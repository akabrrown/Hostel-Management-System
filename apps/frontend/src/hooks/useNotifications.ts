import { useState, useEffect, useCallback } from 'react'
import { Notification } from '@/types'
import { fetchApi } from '@/lib/apiClient';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetchApi('/api/notifications')
      const data = await response.json()
      
      if (response.ok) {
        setNotifications(data.data || [])
        setUnreadCount(data.data?.filter((n: Notification) => !n.read).length || 0)
      } else {
        setError(data.error || 'Failed to fetch notifications')
      }
    } catch (err) {
      setError('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetchApi(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      })
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetchApi('/api/notifications/mark-all-read', {
        method: 'PUT',
      })
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        )
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetchApi(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        const deletedNotification = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }, [notifications])

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
    if (!notification.read) {
      setUnreadCount(prev => prev + 1)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  }
}
