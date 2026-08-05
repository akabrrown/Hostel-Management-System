'use client'

import { useEffect, useState, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

interface RealtimeEvent {
  event: string
  payload: any
  timestamp: string
}

interface RealtimeState {
  bedAvailability: any[]
  announcements: any[]
  paymentStatus: any[]
  roomAllocation: any[]
  notifications: any[]
  isConnected: boolean
  lastEvent: RealtimeEvent | null
}

export function useRealtime() {
  const [realtimeState, setRealtimeState] = useState<RealtimeState>({
    bedAvailability: [],
    announcements: [],
    paymentStatus: [],
    roomAllocation: [],
    notifications: [],
    isConnected: false,
    lastEvent: null
  })
  
  const [channels, setChannels] = useState<Map<string, RealtimeChannel>>(new Map())
  const { user } = useSelector((state: RootState) => state.auth)

  const subscribeToTable = useCallback((tableName: string, event: string, callback: (payload: any) => void) => {
    const channelName = `${tableName}_changes`
    let channel = channels.get(channelName)
    
    if (!channel) {
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes' as any,
          {
            event,
            schema: 'public',
            table: tableName
          },
          (payload) => {
            console.log(`Realtime ${event} on ${tableName}:`, payload)
            callback(payload)
            
            // Update last event
            setRealtimeState(prev => ({
              ...prev,
              lastEvent: {
                event: `${tableName}_${event}`,
                payload,
                timestamp: new Date().toISOString()
              }
            }))
          }
        )
      
      if (channel) {
        setChannels(prev => new Map(prev).set(channelName, channel as RealtimeChannel))
      }
    }
    
    return channel
  }, [channels])

  const subscribeToBedAvailability = useCallback(() => {
    return subscribeToTable('rooms', 'UPDATE', (payload) => {
      setRealtimeState(prev => ({
        ...prev,
        bedAvailability: [...prev.bedAvailability, payload.new]
      }))
    })
  }, [subscribeToTable])

  const subscribeToAnnouncements = useCallback(() => {
    return subscribeToTable('announcements', 'INSERT', (payload) => {
      setRealtimeState(prev => ({
        ...prev,
        announcements: [payload.new, ...prev.announcements]
      }))
    })
  }, [subscribeToTable])

  const subscribeToPaymentStatus = useCallback(() => {
    return subscribeToTable('payments', 'UPDATE', (payload) => {
      setRealtimeState(prev => ({
        ...prev,
        paymentStatus: [...prev.paymentStatus, payload.new]
      }))
    })
  }, [subscribeToTable])

  const subscribeToRoomAllocation = useCallback(() => {
    return subscribeToTable('room_allocations', '*', (payload) => {
      setRealtimeState(prev => ({
        ...prev,
        roomAllocation: [...prev.roomAllocation, payload]
      }))
    })
  }, [subscribeToTable])

  const subscribeToNotifications = useCallback(() => {
    return subscribeToTable('notifications', 'INSERT', (payload) => {
      setRealtimeState(prev => ({
        ...prev,
        notifications: [payload.new, ...prev.notifications]
      }))
    })
  }, [subscribeToTable])

  const connectAll = useCallback(() => {
    if (!user) return

    console.log('Connecting to Supabase Realtime...')
    
    const connectionChannel = supabase.channel('system_connection')
      .on('system', { event: 'connection' }, (payload) => {
        console.log('System connection event:', payload)
        setRealtimeState(prev => ({ ...prev, isConnected: true }))
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to Supabase Realtime')
          setRealtimeState(prev => ({ ...prev, isConnected: true }))
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime connection error')
          setRealtimeState(prev => ({ ...prev, isConnected: false }))
        }
      })

    setChannels(prev => new Map(prev).set('connection', connectionChannel))

    // Subscribe to all relevant tables
    subscribeToBedAvailability()
    subscribeToAnnouncements()
    subscribeToPaymentStatus()
    subscribeToRoomAllocation()
    subscribeToNotifications()
  }, [user, subscribeToBedAvailability, subscribeToAnnouncements, subscribeToPaymentStatus, subscribeToRoomAllocation, subscribeToNotifications])

  const disconnectAll = useCallback(() => {
    console.log('Disconnecting from Supabase Realtime...')
    
    channels.forEach(channel => {
      supabase.removeChannel(channel)
    })
    
    setChannels(new Map())
    setRealtimeState(prev => ({ ...prev, isConnected: false }))
  }, [channels])

  const sendRealtimeNotification = useCallback((notification: any) => {
    // This would typically be handled by a server-side function
    // For now, we'll simulate it
    const notificationPayload = {
      ...notification,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      user_id: user?.id
    }

    setRealtimeState(prev => ({
      ...prev,
      notifications: [notificationPayload, ...prev.notifications]
    }))

    console.log('Sent real-time notification:', notificationPayload)
  }, [user])

  const testConnection = useCallback(() => {
    const testChannel = supabase.channel('test_connection')
      .on('broadcast', { event: 'ping' }, (payload) => {
        console.log('Received ping response:', payload)
      })
      .subscribe()

    testChannel.send({
      type: 'broadcast',
      event: 'ping',
      payload: { timestamp: new Date().toISOString() }
    })

    setTimeout(() => {
      supabase.removeChannel(testChannel)
    }, 5000)
  }, [])

  useEffect(() => {
    if (user) {
      connectAll()
    }

    return () => {
      disconnectAll()
    }
  }, [user, connectAll, disconnectAll])

  return {
    ...realtimeState,
    connectAll,
    disconnectAll,
    sendRealtimeNotification,
    testConnection,
    subscribeToTable,
    channels
  }
}

// Real-time hooks for specific use cases
export function useRealtimeBedAvailability() {
  const realtime = useRealtime()
  
  return {
    bedAvailability: realtime.bedAvailability,
    isConnected: realtime.isConnected,
    lastUpdate: realtime.bedAvailability[realtime.bedAvailability.length - 1]
  }
}

export function useRealtimeAnnouncements() {
  const realtime = useRealtime()
  
  return {
    announcements: realtime.announcements,
    isConnected: realtime.isConnected,
    latestAnnouncement: realtime.announcements[0]
  }
}

export function useRealtimePaymentStatus() {
  const realtime = useRealtime()
  
  return {
    paymentStatus: realtime.paymentStatus,
    isConnected: realtime.isConnected,
    latestPaymentUpdate: realtime.paymentStatus[realtime.paymentStatus.length - 1]
  }
}

export function useRealtimeRoomAllocation() {
  const realtime = useRealtime()
  
  return {
    roomAllocation: realtime.roomAllocation,
    isConnected: realtime.isConnected,
    latestAllocation: realtime.roomAllocation[realtime.roomAllocation.length - 1]
  }
}

export function useRealtimeNotifications() {
  const realtime = useRealtime()
  
  return {
    notifications: realtime.notifications,
    isConnected: realtime.isConnected,
    unreadCount: realtime.notifications.filter(n => !n.read).length,
    sendNotification: realtime.sendRealtimeNotification
  }
}
