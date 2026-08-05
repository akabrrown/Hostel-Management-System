import { z } from 'zod'

// ============================================
// Authentication Schemas
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['student', 'admin', 'porter', 'director']).optional(),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  indexNumber: z.string().regex(/^[A-Z0-9]{8,20}$/, 'Invalid index number format'),
  program: z.string().min(2, 'Program is required'),
})

// ============================================
// Booking & Reservation Schemas
// ============================================

export const bookingSchema = z.object({
  hostelId: z.string().uuid('Invalid hostel ID'),
  floorId: z.string().uuid('Invalid floor ID'),
  roomId: z.string().uuid('Invalid room ID'),
  bedId: z.string().uuid('Invalid bed ID'),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, 'Invalid academic year format (e.g., 2024/2025)'),
  semester: z.enum(['First Semester', 'Second Semester', 'Summer']),
})

export const reservationSchema = z.object({
  preferredHostel: z.string().uuid('Invalid hostel ID').optional(),
  preferredFloor: z.number().int().min(1).max(10).optional(),
  preferredRoomType: z.enum(['Single', 'Double', 'Triple', 'Quad']).optional(),
  specialRequirements: z.string().max(500, 'Special requirements too long').optional(),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/),
  semester: z.enum(['First Semester', 'Second Semester', 'Summer']),
})

// ============================================
// Profile & User Management Schemas
// ============================================

export const profileUpdateSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number').optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  emergencyContactName: z.string().min(2).max(100).optional(),
  emergencyContactPhone: z.string().regex(/^\+?[0-9]{10,15}$/).optional(),
  emergencyContactRelationship: z.string().max(50).optional(),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// ============================================
// Admin Schemas
// ============================================

export const userRoleUpdateSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.number().int().min(1).max(4), // 1=admin, 2=porter, 3=student, 4=director
})

export const roomAllocationSchema = z.object({
  userId: z.string().uuid(),
  roomId: z.string().uuid(),
  bedNumber: z.string().min(1).max(10),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/),
  semester: z.enum(['First Semester', 'Second Semester', 'Summer']),
})

export const announcementSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters').max(5000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  targetAudience: z.enum(['all', 'students', 'staff', 'admins']),
  expiresAt: z.string().datetime().optional(),
})

// ============================================
// Payment Schemas
// ============================================

export const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(100000, 'Amount too large'),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'mobile_money']),
  reference: z.string().min(5).max(100),
  description: z.string().max(500).optional(),
})

// ============================================
// Message/Chat Schemas
// ============================================

export const messageSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient ID'),
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
})

// ============================================
// Search & Filter Schemas
// ============================================

export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  filters: z.object({
    hostel: z.string().uuid().optional(),
    floor: z.number().int().optional(),
    roomType: z.string().optional(),
  }).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// ============================================
// Helper Functions
// ============================================

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

// Export types for TypeScript
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type ReservationInput = z.infer<typeof reservationSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>
export type UserRoleUpdateInput = z.infer<typeof userRoleUpdateSchema>
export type RoomAllocationInput = z.infer<typeof roomAllocationSchema>
export type AnnouncementInput = z.infer<typeof announcementSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type MessageInput = z.infer<typeof messageSchema>
export type SearchInput = z.infer<typeof searchSchema>
