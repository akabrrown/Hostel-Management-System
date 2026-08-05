// UPSA Hostel Management System - Constants

export const APP_CONFIG = {
  name: 'UPSA Hostel Management System',
  version: '1.0.0',
  description: 'Comprehensive hostel management system for UPSA',
} as const

export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  PORTER: 'porter',
  DIRECTOR: 'director',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Student routes
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_ROOM_BOOKING: '/student/room-booking',
  STUDENT_ROOM_RESERVATION: '/student/room-reservation',
  STUDENT_PROFILE: '/student/profile',
  STUDENT_PAYMENTS: '/student/payments',
  STUDENT_ANNOUNCEMENTS: '/student/announcements',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_ROOMS: '/admin/rooms',
  ADMIN_HOSTELS: '/admin/hostels',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_ANNOUNCEMENTS: '/admin/announcements',
  ADMIN_ACCOUNTS: '/admin/accounts',
  ADMIN_PROFILE: '/admin/profile',
  
  // Porter routes
  PORTER_DASHBOARD: '/porter/dashboard',
  PORTER_CHECKIN: '/porter/checkin',
  PORTER_CHECKOUT: '/porter/checkout',
  PORTER_VISITORS: '/porter/visitors',
  PORTER_PROFILE: '/porter/profile',
  
  // Director routes
  DIRECTOR_DASHBOARD: '/director/dashboard',
  DIRECTOR_REPORTS: '/director/reports',
  DIRECTOR_ANALYTICS: '/director/analytics',
  DIRECTOR_PROFILE: '/director/profile',
  
  // Error pages
  NOT_FOUND: '/not-found',
  FORBIDDEN: '/forbidden',
} as const

export const ROOM_TYPES = {
  SINGLE: 'single',
  DOUBLE: 'double',
  TRIPLE: 'triple',
  QUADRUPLE: 'quadruple',
} as const

export type RoomType = typeof ROOM_TYPES[keyof typeof ROOM_TYPES]

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
  REFUNDED: 'refunded',
} as const

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

export const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS]

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  ANNOUNCEMENT: 'announcement',
  PAYMENT_REMINDER: 'payment_reminder',
  BOOKING_CONFIRMATION: 'booking_confirmation',
  ROOM_ALLOCATION: 'room_allocation',
} as const

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]

export const GENDER_OPTIONS = {
  MALE: 'male',
  FEMALE: 'female',
  MIXED: 'mixed',
} as const

export type Gender = typeof GENDER_OPTIONS[keyof typeof GENDER_OPTIONS]

export const ACADEMIC_YEARS = {
  FIRST: 1,
  SECOND: 2,
  THIRD: 3,
  FOURTH: 4,
  FIFTH: 5,
  SIXTH: 6,
} as const

export type AcademicYear = typeof ACADEMIC_YEARS[keyof typeof ACADEMIC_YEARS]

export const SEMESTERS = {
  FIRST: 'first',
  SECOND: 'second',
  SUMMER: 'summer',
} as const

export type Semester = typeof SEMESTERS[keyof typeof SEMESTERS]

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
  },
  
  // Profile
  PROFILE: '/api/profile',
  
  // Hostels & Rooms
  HOSTELS: '/api/hostels',
  ROOMS: '/api/rooms',
  
  // Bookings & Reservations
  RESERVATIONS: '/api/reservations',
  BOOKINGS: '/api/bookings',
  
  // Payments
  PAYMENTS: '/api/payments',
  
  // Announcements & Notifications
  ANNOUNCEMENTS: '/api/announcements',
  NOTIFICATIONS: '/api/notifications',
  
  // Admin specific
  STUDENTS: '/api/admin/students',
  ACCOUNTS: '/api/admin/accounts',
  
  // Porter specific
  CHECKIN: '/api/porter/checkin',
  CHECKOUT: '/api/porter/checkout',
  VISITORS: '/api/porter/visitors',
  
  // Director specific
  ANALYTICS: '/api/director/analytics',
  REPORTS: '/api/director/reports',
} as const

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  INDEX_NUMBER_LENGTH: 10,
  PHONE_NUMBER_MIN_LENGTH: 10,
  PHONE_NUMBER_MAX_LENGTH: 15,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
} as const

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'upsa_auth_token',
  USER_ROLE: 'upsa_user_role',
  LANGUAGE: 'upsa_language',
  PREFERENCES: 'upsa_preferences',
} as const

export const SESSION_STORAGE_KEYS = {
  REDIRECT_URL: 'upsa_redirect_url',
  FORM_DATA: 'upsa_form_data',
  TEMP_DATA: 'upsa_temp_data',
} as const
