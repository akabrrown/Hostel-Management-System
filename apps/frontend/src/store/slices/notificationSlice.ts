import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Notification, ApiResponse } from '@/types'
import { fetchApi } from '@/lib/apiClient';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/api/notifications')
      const data: ApiResponse<Notification[]> = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch notifications')
      }
      
      return data.data || []
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch notifications')
    }
  }
)

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      })
      
      const data: ApiResponse<Notification> = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to mark notification as read')
      }
      
      return data.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark notification as read')
    }
  }
)

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/api/notifications/read-all', {
        method: 'PATCH',
      })
      
      const data: ApiResponse<Notification[]> = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to mark all notifications as read')
      }
      
      return data.data || []
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark all notifications as read')
    }
  }
)

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })
      
      const data: ApiResponse = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete notification')
      }
      
      return notificationId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete notification')
    }
  }
)

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'createdAt'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      state.notifications.unshift(newNotification)
      if (!newNotification.read) {
        state.unreadCount += 1
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notificationIndex = state.notifications.findIndex(n => n.id === action.payload)
      if (notificationIndex !== -1) {
        const notification = state.notifications[notificationIndex]
        if (!notification.read) {
          state.unreadCount -= 1
        }
        state.notifications.splice(notificationIndex, 1)
      }
    },
    clearNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
        state.unreadCount = action.payload.filter(n => !n.read).length
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Mark notification as read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload?.id)
        if (notification && !notification.read) {
          notification.read = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Mark all notifications as read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
        state.notifications.forEach(notification => {
          notification.read = true
        })
        state.unreadCount = 0
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Delete notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationIndex = state.notifications.findIndex(n => n.id === action.payload)
        if (notificationIndex !== -1) {
          const notification = state.notifications[notificationIndex]
          if (!notification.read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
          state.notifications.splice(notificationIndex, 1)
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  clearError,
} = notificationSlice.actions

export default notificationSlice.reducer
