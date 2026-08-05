import { z } from 'zod'

// Environment Variables Schema
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(3000).max(9999)).default('3000'),
  
  // Database
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  
  // Email
  EMAIL_HOST: z.string().min(1),
  EMAIL_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  
  // SMS (optional)
  SMS_API_KEY: z.string().optional(),
  SMS_API_SECRET: z.string().optional(),
  
  // Security
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().min(1)).default('100'),
  RATE_LIMIT_WINDOW: z.string().transform(Number).pipe(z.number().min(1000)).default('900000'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().min(1)).default('5242880'),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,application/pdf'),
  
  // Analytics (optional)
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  
  // Deployment
  NETLIFY_BUILD_PUBLIC_URL: z.string().url().optional(),
})

// User Authentication Schemas
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Index Number is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['student', 'admin', 'porter', 'director'], {
    errorMap: () => ({ message: 'Invalid role specified' })
  }).optional()
})

export const signupSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  indexNumber: z.string()
    .regex(/^\d{8}$/, 'Index number must be exactly 8 digits').optional(),
  
  email: z.string().email('Invalid email address'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  confirmPassword: z.string(),
  programOfStudy: z.string().optional(),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional()
  }).optional(),
  level: z.enum(['100', '200', '300', '400'], {
    errorMap: () => ({ message: 'Invalid academic level' })
  }).optional(),
  role: z.enum(['student', 'admin', 'porter', 'director']).default('student')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

export const passwordResetSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .endsWith('@upsamail.edu.gh', 'Email must end with @upsamail.edu.gh')
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

// Student Management Schemas
export const studentCreateSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  
  indexNumber: z.string()
    .regex(/^\d{8}$/, 'Index number must be exactly 8 digits'),
  
  email: z.string()
    .email('Invalid email address')
    .endsWith('@upsamail.edu.gh', 'Email must end with @upsamail.edu.gh'),
  
  programOfStudy: z.string().min(1, 'Program of study is required'),
  level: z.enum(['100', '200', '300', '400']),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format')
})

export const studentUpdateSchema = studentCreateSchema.partial()

// Room Management Schemas
export const roomCreateSchema = z.object({
  hostelId: z.string().min(1, 'Hostel is required'),
  floor: z.string().min(1, 'Floor is required'),
  roomNumber: z.string().min(1, 'Room number is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(6, 'Capacity cannot exceed 6'),
  roomType: z.enum(['single', 'double', 'triple', 'quad']),
  pricePerSemester: z.number().min(0, 'Price must be positive'),
  amenities: z.array(z.string()).optional(),
  isAvailable: z.boolean().default(true)
})

export const roomUpdateSchema = roomCreateSchema.partial()

// Payment Management Schemas
export const paymentCreateSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  amount: z.number().min(1, 'Amount must be positive'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'mobile_money', 'online']),
  semester: z.enum(['first', 'second', 'summer']),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, 'Invalid academic year format (e.g., 2023/2024)'),
  paymentDate: z.string().datetime(),
  receiptNumber: z.string().optional(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional()
})

// Announcement Schemas
export const announcementCreateSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),
  
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(5000, 'Content must not exceed 5000 characters'),
  
  category: z.enum(['general', 'academic', 'payment', 'maintenance', 'emergency', 'policy']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  targetAudience: z.array(z.enum(['all', 'students', 'admin', 'porter', 'director'])),
  scheduledFor: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional()
})

// Porter Management Schemas
export const porterCreateSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  
  email: z.string()
    .email('Invalid email address')
    .endsWith('@upsamail.edu.gh', 'Email must end with @upsamail.edu.gh'),
  
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format'),
  assignedHostels: z.array(z.string()).min(1, 'At least one hostel must be assigned'),
  assignedFloors: z.array(z.string()).min(1, 'At least one floor must be assigned'),
  shift: z.enum(['morning', 'afternoon', 'night', 'flexible']),
  isActive: z.boolean().default(true)
})

// Check-in/Check-out Schemas
export const checkInSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  checkInTime: z.string().datetime(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional()
})

export const checkOutSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  checkOutTime: z.string().datetime(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional()
})

// File Upload Schemas
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.enum(['image/jpeg', 'image/png', 'application/pdf']),
  size: z.number().max(5 * 1024 * 1024, 'File size must not exceed 5MB'),
  purpose: z.enum(['student_id', 'admission_letter', 'payment_proof', 'profile_photo'])
})

// Search and Filter Schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
  type: z.enum(['student', 'room', 'payment', 'announcement']).optional(),
  filters: z.record(z.any()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})

// Report Generation Schemas
export const reportSchema = z.object({
  type: z.enum(['occupancy', 'payment', 'student_demographics', 'porter_activities']),
  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime()
  }),
  format: z.enum(['pdf', 'excel', 'csv']),
  filters: z.record(z.any()).optional()
})

// API Response Schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  errors: z.array(z.string()).optional(),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  }).optional()
})

// Export type inference
export type EnvVariables = z.infer<typeof envSchema>
export type LoginData = z.infer<typeof loginSchema>
export type SignupData = z.infer<typeof signupSchema>
export type StudentCreateData = z.infer<typeof studentCreateSchema>
export type RoomCreateData = z.infer<typeof roomCreateSchema>
export type PaymentCreateData = z.infer<typeof paymentCreateSchema>
export type AnnouncementCreateData = z.infer<typeof announcementCreateSchema>
export type PorterCreateData = z.infer<typeof porterCreateSchema>
export type CheckInData = z.infer<typeof checkInSchema>
export type CheckOutData = z.infer<typeof checkOutSchema>
export type FileUploadData = z.infer<typeof fileUploadSchema>
export type SearchData = z.infer<typeof searchSchema>
export type ReportData = z.infer<typeof reportSchema>
