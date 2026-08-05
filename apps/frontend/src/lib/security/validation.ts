import { z } from 'zod'

// User validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['student', 'admin', 'porter', 'director'], {
    errorMap: () => ({ message: 'Invalid role selected' }),
  }).optional(),
})

export const signupSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  indexNumber: z.string().regex(/^(UPSA)?\d{8}$/, 'Invalid index number format (must be 8 digits)'),
  dateOfBirth: z.string().refine((date) => {
    const parsedDate = new Date(date)
    const minAge = new Date()
    minAge.setFullYear(minAge.getFullYear() - 16)
    return parsedDate <= minAge
  }, 'Must be at least 16 years old'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  programOfStudy: z.string().optional(),
  yearOfStudy: z.preprocess((val) => (typeof val === 'string' ? parseInt(val, 10) : val), z.number().min(1).max(8).optional()),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
})

// Room reservation validation
export const roomReservationSchema = z.object({
  hostelId: z.string().uuid('Invalid hostel selection'),
  floorId: z.string().uuid('Invalid floor selection'),
  roomTypeId: z.string().uuid('Invalid room type selection'),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, 'Invalid academic year format'),
  semester: z.enum(['First Semester', 'Second Semester'], {
    errorMap: () => ({ message: 'Invalid semester selected' }),
  }),
  specialRequests: z.string().max(500, 'Special requests must not exceed 500 characters').optional(),
})

// Room booking validation
export const roomBookingSchema = z.object({
  hostelId: z.string().uuid('Invalid hostel selection'),
  floorId: z.string().uuid('Invalid floor selection'),
  roomId: z.string().uuid('Invalid room selection'),
  bedId: z.string().uuid('Invalid bed selection'),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, 'Invalid academic year format'),
  semester: z.enum(['First Semester', 'Second Semester'], {
    errorMap: () => ({ message: 'Invalid semester selected' }),
  }),
})

// Payment validation
export const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive').min(50, 'Minimum payment amount is GHS 50'),
  paymentMethod: z.enum(['mobile_money', 'bank_transfer', 'card'], {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
  transactionId: z.string().min(1, 'Transaction ID is required'),
  semester: z.string().min(1, 'Semester is required'),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, 'Invalid academic year format'),
})

// Admin user management validation
export const adminUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format').optional().or(z.literal('')),
  role: z.enum(['admin', 'porter', 'director', 'student'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
  indexNumber: z.string().optional(),
})

// Announcement validation
export const announcementSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must not exceed 200 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(2000, 'Content must not exceed 2000 characters'),
  category: z.enum(['general', 'maintenance', 'emergency', 'academic'], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  isScheduled: z.boolean().default(false),
  scheduledFor: z.string().datetime('Invalid scheduled date').optional(),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type RoomReservationInput = z.infer<typeof roomReservationSchema>
export type RoomBookingInput = z.infer<typeof roomBookingSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type AdminUserInput = z.infer<typeof adminUserSchema>
export type AnnouncementInput = z.infer<typeof announcementSchema>
