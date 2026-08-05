'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useRealtimeNotifications } from '@/hooks/useRealtime'
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Badge } from './badge'
import { gsap } from 'gsap'
import styles from './realtimeNotifications.module.css'

interface RealtimeNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export function RealtimeNotifications() {
  const { notifications, unreadCount, sendNotification } = useRealtimeNotifications()
  const [showNotifications, setShowNotifications] = useState(false)
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null)
  
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    // Animate notification badge when new notifications arrive
    if (unreadCount > 0) {
      gsap.fromTo('.notification-badge',
        { scale: 1.5, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
    }
  }, [unreadCount])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const markAsRead = (notificationId: string) => {
    // This would typically update the database
    console.log('Marking notification as read:', notificationId)
  }

  const dismissNotification = (notificationId: string) => {
    // This would typically remove the notification
    console.log('Dismissing notification:', notificationId)
  }

  const handleNotificationClick = (notification: RealtimeNotification) => {
    if (notification.action) {
      notification.action.onClick()
    }
    markAsRead(notification.id)
    setExpandedNotification(expandedNotification === notification.id ? null : notification.id)
  }

  const testNotification = () => {
    sendNotification({
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test real-time notification sent at ' + new Date().toLocaleTimeString(),
      timestamp: new Date().toISOString(),
      read: false
    })
  }

  if (!user) return null

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <Badge className="notification-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={testNotification}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Test
                </button>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No notifications yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Real-time notifications will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 cursor-pointer transition-colors hover:bg-gray-50 ${getNotificationColor(notification.type)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                dismissNotification(notification.id)
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <X className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {expandedNotification === notification.id && notification.action && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              notification.action!.onClick()
                            }}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {notification.action.label}
                          </button>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                          {notification.action && (
                            <button className="text-xs text-blue-600 hover:text-blue-700">
                              {expandedNotification === notification.id ? 'Show Less' : 'Show More'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                Mark All as Read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Real-time status indicator component
export function RealtimeStatus() {
  const { isConnected } = useRealtimeNotifications()
  
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      <span className="text-sm text-gray-600">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  )
}

// Real-time bed availability component
export function RealtimeBedAvailability() {
  const { bedAvailability, isConnected } = { bedAvailability: [] as Array<{hostel: string; roomNumber: string; bedNumber: string; status: string; available: boolean}>, isConnected: false }
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Real-time Bed Availability</h3>
        <RealtimeStatus />
      </div>
      
      <div className="space-y-2">
        {bedAvailability.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            No bed availability updates yet
          </p>
        ) : (
          bedAvailability.slice(0, 5).map((update, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{update.hostel}</span>
                <span className="text-sm text-gray-600 ml-2">
                  Room {update.roomNumber} - Bed {update.bedNumber}
                </span>
              </div>
              <Badge className={
                update.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }>
                {update.available ? 'Available' : 'Occupied'}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Real-time announcement component
export function RealtimeAnnouncements() {
  const { announcements, latestAnnouncement } = { 
    announcements: [] as Array<{id: string; title: string; message: string; timestamp: string}>, 
    latestAnnouncement: null as {id: string; title: string; message: string; timestamp: string} | null 
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Live Announcements</h3>
        <RealtimeStatus />
      </div>
      
      {latestAnnouncement && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                {latestAnnouncement.title}
              </h4>
              <p className="text-sm text-gray-600">
                {latestAnnouncement.message}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(latestAnnouncement.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {announcements.slice(1, 4).map((announcement, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded">
            <h4 className="font-medium text-gray-900 text-sm">
              {announcement.title}
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              {new Date(announcement.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
