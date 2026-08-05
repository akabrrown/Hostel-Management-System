// Notification system with email/SMS alerts
import { supabase } from '@/lib/supabase'
import { createError, handleError } from '@/lib/errors'

// Notification types
export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'payment'
  | 'booking'
  | 'reservation'
  | 'checkin'
  | 'checkout'
  | 'maintenance'
  | 'announcement'

export type NotificationChannel = 'email' | 'sms' | 'in_app' | 'push'

export interface Notification {
  id: string
  userId?: string
  type: NotificationType
  title: string
  message: string
  channels: NotificationChannel[]
  data?: Record<string, any>
  metadata?: {
    priority: 'low' | 'medium' | 'high' | 'urgent'
    category: string
    actionUrl?: string
    actionText?: string
    targetRoles?: string[]
  }
  isRead: boolean
  createdAt: string
  readAt?: string
}

export interface EmailConfig {
  smtp: {
    host: string
    port: number
    secure: boolean
    user: string
    password: string
  }
  from: {
    name: string
    email: string
  }
  templates: {
    welcome: string
    booking: string
    payment: string
    maintenance: string
    announcement: string
  }
}

export interface SMSConfig {
  providers: {
    mtn: {
      apiKey: string
      senderId: string
    }
    vodafone: {
      apiKey: string
      senderId: string
    }
    airteltigo: {
      apiKey: string
      senderId: string
    }
  }
  defaultProvider: 'mtn' | 'vodafone' | 'airteltigo'
}

// Notification service class
class NotificationService {
  private emailConfig: EmailConfig
  private smsConfig: SMSConfig

  constructor() {
    this.emailConfig = {
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASSWORD || '',
      },
      from: {
        name: process.env.SMTP_FROM_NAME || 'UPSA Hostel Management',
        email: process.env.SMTP_FROM_EMAIL || 'noreply@upsamail.edu.gh',
      },
      templates: {
        welcome: 'welcome-template',
        booking: 'booking-template',
        payment: 'payment-template',
        maintenance: 'maintenance-template',
        announcement: 'announcement-template',
      },
    }

    this.smsConfig = {
      providers: {
        mtn: {
          apiKey: process.env.MTN_API_KEY || '',
          senderId: process.env.MTN_SENDER_ID || 'UPSA',
        },
        vodafone: {
          apiKey: process.env.VODAFONE_API_KEY || '',
          senderId: process.env.VODAFONE_SENDER_ID || 'UPSA',
        },
        airteltigo: {
          apiKey: process.env.AIRTELTIGO_API_KEY || '',
          senderId: process.env.AIRTELTIGO_SENDER_ID || 'UPSA',
        },
      },
      defaultProvider: (process.env.DEFAULT_SMS_PROVIDER as any) || 'mtn',
    }
  }

  // Create notification
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'readAt'>): Promise<Notification> {
    try {
      const newNotification: Notification = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        ...notification,
        isRead: false,
        createdAt: new Date().toISOString(),
      }

      // Save to database
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          id: newNotification.id,
          user_id: newNotification.userId,
          type: newNotification.type,
          title: newNotification.title,
          message: newNotification.message,
          channels: newNotification.channels,
          data: newNotification.data,
          metadata: newNotification.metadata,
          is_read: false,
          created_at: newNotification.createdAt,
        })
        .select()
        .single()

      if (error) {
        throw createError('database_error', 'Failed to create notification', 'DB_ERROR', error)
      }

      // Send notifications through channels
      await this.sendNotificationChannels(newNotification)

      return data
    } catch (error) {
      throw handleError(error)
    }
  }

  // Send notification through specified channels
  private async sendNotificationChannels(notification: Notification): Promise<void> {
    const promises: Promise<void>[] = []

    if (notification.channels.includes('email') && notification.userId) {
      promises.push(this.sendEmailNotification(notification))
    }

    if (notification.channels.includes('sms') && notification.userId) {
      promises.push(this.sendSMSNotification(notification))
    }

    if (notification.channels.includes('in_app')) {
      promises.push(this.sendInAppNotification(notification))
    }

    await Promise.allSettled(promises)
  }

  // Send email notification
  private async sendEmailNotification(notification: Notification): Promise<void> {
    try {
      // Get user email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', notification.userId || '')
        .single()

      if (userError || !user) {
        throw createError('not_found', 'User not found for email notification')
      }

      // In production, use actual email service like Nodemailer, SendGrid, etc.
      const emailData = {
        to: user.email,
        from: `${this.emailConfig.from.name} <${this.emailConfig.from.email}>`,
        subject: notification.title,
        html: this.generateEmailTemplate(notification, user),
        text: notification.message,
      }

      console.log('Sending email:', emailData)

      // Mock email sending
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error('Failed to send email notification:', error)
    }
  }

  // Send SMS notification
  private async sendSMSNotification(notification: Notification): Promise<void> {
    try {
      // Get user phone
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('phone, first_name, last_name')
        .eq('user_id', notification.userId || '')
        .single()

      if (studentError || !student) {
        throw createError('not_found', 'Student not found for SMS notification')
      }

      const provider = this.smsConfig.providers[this.smsConfig.defaultProvider]
      
      // In production, use actual SMS service like Twilio, Africa's Talking, etc.
      const smsData = {
        to: student.phone,
        from: provider.senderId,
        message: `${notification.title}: ${notification.message}`,
      }

      console.log('Sending SMS:', smsData)

      // Mock SMS sending
      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (error) {
      console.error('Failed to send SMS notification:', error)
    }
  }

  // Send in-app notification
  private async sendInAppNotification(notification: Notification): Promise<void> {
    try {
      // This would typically use WebSocket or Server-Sent Events
      // For now, we'll just log it
      console.log('In-app notification:', notification)

      // Store in database for real-time fetching
      if (notification.userId) {
        await supabase
          .from('notifications')
          .update({ delivered_in_app: true })
          .eq('id', notification.id)
      }
    } catch (error) {
      console.error('Failed to send in-app notification:', error)
    }
  }

  // Generate email template
  private generateEmailTemplate(notification: Notification, user: any): string {
    const templates = {
      info: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #001f3f; color: white; padding: 20px; text-align: center;">
            <h1>UPSA Hostel Management</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #001f3f;">${notification.title}</h2>
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>${notification.message}</p>
            ${notification.metadata?.actionUrl ? `
              <div style="margin-top: 20px; text-align: center;">
                <a href="${notification.metadata.actionUrl}" 
                   style="background: #FFD700; color: #001f3f; padding: 12px 24px; 
                          text-decoration: none; border-radius: 4px; font-weight: bold;">
                  ${notification.metadata.actionText || 'View Details'}
                </a>
              </div>
            ` : ''}
          </div>
          <div style="background: #001f3f; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>&copy; 2024 UPSA Hostel Management. All rights reserved.</p>
          </div>
        </div>
      `,
      success: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>✅ Success!</h1>
            <h2>UPSA Hostel Management</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #28a745;">${notification.title}</h2>
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>${notification.message}</p>
            ${notification.metadata?.actionUrl ? `
              <div style="margin-top: 20px; text-align: center;">
                <a href="${notification.metadata.actionUrl}" 
                   style="background: #28a745; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 4px; font-weight: bold;">
                  ${notification.metadata.actionText || 'View Details'}
                </a>
              </div>
            ` : ''}
          </div>
        </div>
      `,
      warning: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">
            <h1>⚠️ Warning</h1>
            <h2>UPSA Hostel Management</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #f59e0b;">${notification.title}</h2>
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>${notification.message}</p>
            ${notification.metadata?.actionUrl ? `
              <div style="margin-top: 20px; text-align: center;">
                <a href="${notification.metadata.actionUrl}" 
                   style="background: #f59e0b; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 4px; font-weight: bold;">
                  ${notification.metadata.actionText || 'View Details'}
                </a>
              </div>
            ` : ''}
          </div>
        </div>
      `,
      error: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
            <h1>❌ Error</h1>
            <h2>UPSA Hostel Management</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #ef4444;">${notification.title}</h2>
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>${notification.message}</p>
            ${notification.metadata?.actionUrl ? `
              <div style="margin-top: 20px; text-align: center;">
                <a href="${notification.metadata.actionUrl}" 
                   style="background: #ef4444; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 4px; font-weight: bold;">
                  ${notification.metadata.actionText || 'View Details'}
                </a>
              </div>
            ` : ''}
          </div>
        </div>
      `,
      payment: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #FFD700; color: #001f3f; padding: 20px; text-align: center;">
            <h1>💳 Payment Confirmation</h1>
            <h2>UPSA Hostel Management</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #001f3f;">${notification.title}</h2>
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>${notification.message}</p>
            ${notification.data ? `
              <div style="background: #e9ecef; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <h3>Payment Details:</h3>
                <p><strong>Amount:</strong> GHS ${notification.data.amount}</p>
                <p><strong>Transaction ID:</strong> ${notification.data.transactionId}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `,
      booking: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #001f3f; color: white; padding: 20px; text-align: center;">
            <h1>🏠 Room Booking</h1>
            <h2>UPSA Hostel Management</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #001f3f;">${notification.title}</h2>
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>${notification.message}</p>
            ${notification.data ? `
              <div style="background: #e9ecef; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <h3>Booking Details:</h3>
                <p><strong>Hostel:</strong> ${notification.data.hostel}</p>
                <p><strong>Room:</strong> ${notification.data.room}</p>
                <p><strong>Bed:</strong> ${notification.data.bed}</p>
                <p><strong>Semester:</strong> ${notification.data.semester}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `,
      reservation: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0891b2; color: white; padding: 20px; text-align: center;">
            <h1>📋 Room Reservation</h1>
            <h2>UPSA Hostel Management</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #0891b2;">${notification.title}</h2>
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>${notification.message}</p>
            ${notification.data ? `
              <div style="background: #e9ecef; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <h3>Reservation Details:</h3>
                <p><strong>Hostel:</strong> ${notification.data.hostel}</p>
                <p><strong>Room Type:</strong> ${notification.data.roomType}</p>
                <p><strong>Academic Year:</strong> ${notification.data.academicYear}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `,
      checkin: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #059669; color: white; padding: 20px; text-align: center;">
            <h1>🔑 Check-in</h1>
            <h2>UPSA Hostel Management</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #059669;">${notification.title}</h2>
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>${notification.message}</p>
            ${notification.data ? `
              <div style="background: #e9ecef; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <h3>Check-in Details:</h3>
                <p><strong>Hostel:</strong> ${notification.data.hostel}</p>
                <p><strong>Room:</strong> ${notification.data.room}</p>
                <p><strong>Check-in Date:</strong> ${notification.data.checkInDate}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `,
      checkout: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
            <h1>🚪 Check-out</h1>
            <h2>UPSA Hostel Management</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #dc2626;">${notification.title}</h2>
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>${notification.message}</p>
            ${notification.data ? `
              <div style="background: #e9ecef; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <h3>Check-out Details:</h3>
                <p><strong>Hostel:</strong> ${notification.data.hostel}</p>
                <p><strong>Room:</strong> ${notification.data.room}</p>
                <p><strong>Check-out Date:</strong> ${notification.data.checkOutDate}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `,
      maintenance: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #7c3aed; color: white; padding: 20px; text-align: center;">
            <h1>🔧 Maintenance Notice</h1>
            <h2>UPSA Hostel Management</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #7c3aed;">${notification.title}</h2>
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>${notification.message}</p>
            ${notification.data ? `
              <div style="background: #e9ecef; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <h3>Maintenance Details:</h3>
                <p><strong>Area:</strong> ${notification.data.area}</p>
                <p><strong>Duration:</strong> ${notification.data.duration}</p>
                <p><strong>Impact:</strong> ${notification.data.impact}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `,
      announcement: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #9333ea; color: white; padding: 20px; text-align: center;">
            <h1>📢 Announcement</h1>
            <h2>UPSA Hostel Management</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #9333ea;">${notification.title}</h2>
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>${notification.message}</p>
            ${notification.data ? `
              <div style="background: #e9ecef; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <h3>Announcement Details:</h3>
                <p><strong>Category:</strong> ${notification.data.category}</p>
                <p><strong>Priority:</strong> ${notification.data.priority}</p>
                <p><strong>Valid Until:</strong> ${notification.data.validUntil}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `,
    }

    return templates[notification.type] || templates.info
  }

  // Get user notifications
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number
      offset?: number
      unreadOnly?: boolean
      type?: NotificationType
    } = {}
  ): Promise<{ notifications: Notification[]; total: number }> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (options.unreadOnly) {
        query = query.eq('is_read', false)
      }

      if (options.type) {
        query = query.eq('type', options.type)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data: notifications, error } = await query

      if (error) {
        throw createError('database_error', 'Failed to fetch notifications', 'DB_ERROR', error)
      }

      // Get total count
      const { count: total } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      return {
        notifications: notifications || [],
        total: total || 0,
      }
    } catch (error) {
      throw handleError(error)
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        throw createError('database_error', 'Failed to mark notification as read', 'DB_ERROR', error)
      }
    } catch (error) {
      throw handleError(error)
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        throw createError('database_error', 'Failed to mark all notifications as read', 'DB_ERROR', error)
      }
    } catch (error) {
      throw handleError(error)
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        throw createError('database_error', 'Failed to delete notification', 'DB_ERROR', error)
      }
    } catch (error) {
      throw handleError(error)
    }
  }

  // Get notification count
  async getNotificationCount(userId: string, unreadOnly: boolean = true): Promise<number> {
    try {
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (unreadOnly) {
        query = query.eq('is_read', false)
      }

      const { count } = await query
      return count || 0
    } catch (error) {
      throw handleError(error)
    }
  }

  // Send bulk notifications
  async sendBulkNotifications(
    notifications: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'readAt'>[]
  ): Promise<void> {
    const promises = notifications.map(notification => 
      this.createNotification(notification)
    )

    await Promise.allSettled(promises)
  }
}

// Create notification service instance
export const notificationService = new NotificationService()

// Notification utilities
export const notificationUtils = {
  // Create welcome notification
  createWelcomeNotification: (userId: string, firstName: string): Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'readAt'> => ({
    userId,
    type: 'info',
    title: 'Welcome to UPSA Hostel Management',
    message: `Welcome ${firstName}! Your account has been successfully created. You can now book rooms and manage your accommodation.`,
    channels: ['email', 'in_app'],
    metadata: {
      priority: 'medium',
      category: 'welcome',
      actionUrl: '/student/dashboard',
      actionText: 'Go to Dashboard',
    },
  }),

  // Create booking confirmation notification
  createBookingNotification: (
    userId: string,
    bookingData: any
  ): Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'readAt'> => ({
    userId,
    type: 'booking',
    title: 'Room Booking Confirmed',
    message: `Your room booking has been confirmed. Hostel: ${bookingData.hostel}, Room: ${bookingData.room}, Bed: ${bookingData.bed}`,
    channels: ['email', 'sms', 'in_app'],
    data: bookingData,
    metadata: {
      priority: 'high',
      category: 'booking',
      actionUrl: '/student/bookings',
      actionText: 'View Bookings',
    },
  }),

  // Create payment confirmation notification
  createPaymentNotification: (
    userId: string,
    paymentData: any
  ): Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'readAt'> => ({
    userId,
    type: 'payment',
    title: 'Payment Received',
    message: `Your payment of GHS ${paymentData.amount} has been received and processed successfully.`,
    channels: ['email', 'in_app'],
    data: paymentData,
    metadata: {
      priority: 'high',
      category: 'payment',
      actionUrl: '/student/payments',
      actionText: 'View Payments',
    },
  }),

  // Create check-in notification
  createCheckInNotification: (
    userId: string,
    checkInData: any
  ): Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'readAt'> => ({
    userId,
    type: 'checkin',
    title: 'Check-in Completed',
    message: `You have been successfully checked in to ${checkInData.hostel}, Room ${checkInData.room}.`,
    channels: ['email', 'in_app'],
    data: checkInData,
    metadata: {
      priority: 'medium',
      category: 'checkin',
    },
  }),

  // Create announcement notification
  createAnnouncementNotification: (
    announcementData: any,
    targetRoles?: string[]
  ): Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'readAt'> => ({
    type: 'announcement',
    title: announcementData.title,
    message: announcementData.message,
    channels: ['email', 'in_app'],
    data: announcementData,
    metadata: {
      priority: announcementData.priority || 'medium',
      category: 'announcement',
      targetRoles,
    },
  }),

  // Get notification display text
  getNotificationText: (type: NotificationType): string => {
    const typeMap = {
      info: 'Information',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
      payment: 'Payment',
      booking: 'Booking',
      reservation: 'Reservation',
      checkin: 'Check-in',
      checkout: 'Check-out',
      maintenance: 'Maintenance',
      announcement: 'Announcement',
    }
    return typeMap[type] || 'Notification'
  },

  // Get notification color
  getNotificationColor: (type: NotificationType): string => {
    const colorMap = {
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      payment: '#8b5cf6',
      booking: '#06b6d4',
      reservation: '#0891b2',
      checkin: '#059669',
      checkout: '#dc2626',
      maintenance: '#7c3aed',
      announcement: '#9333ea',
    }
    return colorMap[type] || '#6b7280'
  },

  // Format notification time
  formatNotificationTime: (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) {
      return 'Just now'
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  },
}