// UPSA Hostel Management System - Type Definitions
import type { ReactNode } from 'react';
export type UserRole = 'student' | 'admin' | 'porter' | 'director';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  indexNumber?: string; // Students only
  dateOfBirth?: string; // Students only
  phoneNumber?: string;
  avatar?: string;
}

export interface Student extends User {
  role: 'student';
  profile: StudentProfile;
  accommodation?: AccommodationDetails;
}

export interface StudentProfile extends UserProfile {
  indexNumber: string;
  dateOfBirth: string;
  programOfStudy: string;
  yearOfStudy: number;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Admin extends User {
  role: 'admin';
  profile: AdminProfile;
  // Dashboard data
  totalStudents?: number;
  studentGrowthRate?: number;
  occupancyRate?: number;
  monthlyRevenue?: number;
  revenueGrowthRate?: number;
  staffEfficiency?: number;
  staffEfficiencyChange?: number;
  pendingReservations?: number;
  recentReservations?: Array<{
    id: string;
    studentName: string;
    date: string;
    room: string;
    createdAt: string;
    status: string;
  }>;
  hostelOccupancy?: Array<{
    name: string;
    occupancyRate: number;
  }>;
}

export interface AdminProfile extends UserProfile {
  department: string;
  permissions: string[];
}

export interface Porter extends User {
  role: 'porter';
  profile: PorterProfile;
}

export interface PorterProfile extends UserProfile {
  assignedHostel: string;
  shiftSchedule: string;
  status: 'active' | 'inactive' | 'on-leave';
}

export interface Director extends User {
  role: 'director';
  profile: DirectorProfile;
  // Dashboard data
  totalStudents?: number;
  studentGrowthRate?: number;
  occupancyRate?: number;
  monthlyRevenue?: number;
  revenueGrowthRate?: number;
  staffEfficiency?: number;
  staffEfficiencyChange?: number;
  hostelOccupancy?: Array<{
    name: string;
    occupancyRate: number;
  }>;
  studentDemographics?: Array<{
    year: string;
    count: number;
  }>;
  programDistribution?: Array<{
    name: string;
    count: number;
  }>;
  paymentStats?: {
    onTime: number;
    late: number;
    default: number;
    avgCollectionTime: number;
  };
  performanceMetrics?: {
    studentSatisfaction: number;
    staffProductivity: number;
    avgCheckInTime: number;
    systemUptime: number;
  };
  reports?: Array<{
    title: string;
    date: string;
    type: string;
  }>;
  scheduledReports?: Array<{
    name: string;
    frequency: string;
    nextRun: string;
  }>;
  strategicInitiatives?: Array<{
    title: string;
    status: string;
    progress: number;
    deadline: string;
    priority: string;
  }>;
  riskAssessment?: Array<{
    risk: string;
    level: string;
    impact: string;
  }>;
}

export interface DirectorProfile extends UserProfile {
  department: string;
  accessLevel: 'strategic' | 'operational';
}

// Accommodation Types
export interface Hostel {
  id: string;
  name: string;
  code: string;
  address: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  gender: 'male' | 'female' | 'mixed';
  warden: string;
  contact: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface Floor {
  id: string;
  hostelId: string;
  floorNumber: number;
  totalRooms: number;
  totalBeds: number;
  facilities: string[];
}

export interface Room {
  id: string;
  hostelId: string;
  floorId: string;
  roomNumber: string;
  roomType: 'single' | 'double' | 'triple' | 'quadruple';
  capacity: number;
  currentOccupancy: number;
  beds: Bed[];
  facilities: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  monthlyFee: number;
}

export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  currentOccupant?: string;
  reservation?: Reservation;
}

export interface AccommodationDetails {
  hostel: Hostel;
  floor: Floor;
  room: Room;
  bed: Bed;
  allocationDate: string;
  semester: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
}

// Booking & Reservation Types
export interface Reservation {
  id: string;
  studentId: string;
  preferences: ReservationPreferences;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface ReservationPreferences {
  hostelId?: string;
  roomType: 'single' | 'double' | 'triple' | 'quadruple';
  floorPreference?: number;
  roommatePreferences?: string[];
  specialRequests?: string;
}

export interface Booking {
  id: string;
  studentId: string;
  bedId: string;
  checkInDate: string;
  checkOutDate?: string;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  createdAt: string;
}

// Payment Types
export interface Payment {
  id: string;
  studentId: string;
  type: 'accommodation' | 'late_fee' | 'maintenance' | 'other';
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  semester: string;
  description: string;
  transactionId?: string;
}

export interface BillingRecord {
  payments: Payment[];
  totalDue: number;
  totalPaid: number;
  overdueAmount: number;
  semester: string;
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  targetRoles: UserRole[];
  targetHostels?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  expiresAt?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// Porter Operations Types
export interface CheckInRecord {
  id: string;
  studentId: string;
  bedId: string;
  checkedInBy: string;
  checkInTime: string;
  notes?: string;
  status: 'active' | 'checked_out';
}

export interface CheckOutRecord {
  id: string;
  studentId: string;
  bedId: string;
  checkedOutBy: string;
  checkOutTime: string;
  conditionReport: string;
  itemsReturned: string[];
  fines?: number;
}

// Analytics & Reports Types
export interface OccupancyReport {
  hostelId: string;
  hostelName: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  semester: string;
  generatedAt: string;
}

export interface FinancialReport {
  semester: string;
  totalRevenue: number;
  totalExpected: number;
  collectionRate: number;
  overdueAmount: number;
  paymentBreakdown: {
    accommodation: number;
    lateFees: number;
    other: number;
  };
}

export interface StudentDemographics {
  totalStudents: number;
  byProgram: Record<string, number>;
  byYear: Record<string, number>;
  byHostel: Record<string, number>;
  genderDistribution: {
    male: number;
    female: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginCredentials {
  email: string;
  password: string;
  captchaToken?: string;
}

export interface StudentLoginCredentials {
  indexNumber: string;
  dateOfBirth: string;
  captchaToken?: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  captchaToken?: string;
}

export interface StudentSignupData extends SignupData {
  role: 'student';
  indexNumber: string;
  dateOfBirth: string;
  programOfStudy: string;
  yearOfStudy: number;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'booking';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Redux Store Types
export interface RootState {
  auth: AuthState;
  booking: BookingState;
  notifications: NotificationState;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface BookingState {
  currentReservation: Reservation | null;
  currentBooking: Booking | null;
  availableHostels: Hostel[];
  availableRooms: Room[];
  selectedPreferences: ReservationPreferences | null;
  loading: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

// Utility Types
export interface SelectOption {
  value: string;
  label: string;
}

export interface TableColumn<T = any> {
  key: keyof T;
  title: string | ReactNode;
  sortable?: boolean;
  render?: (value: any, record: T) => ReactNode;
}

export interface FilterOption {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: any;
}

// Additional Types for New Features

// Report Types
export interface Report {
  id: string;
  name: string;
  type: 'occupancy' | 'financial' | 'demographics' | 'maintenance' | 'custom';
  parameters: ReportParameters;
  generatedAt: string;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'csv';
  status: 'generating' | 'completed' | 'failed';
  fileUrl?: string;
}

export interface ReportParameters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  hostels?: string[];
  roomTypes?: string[];
  studentCategories?: string[];
  includeCharts: boolean;
  includeDetails: boolean;
}

// Search and Filter Types
export interface SearchFilters {
  query: string;
  category?: string;
  status?: string;
  priority?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T = any> {
  id: string;
  title: string;
  description: string;
  type: string;
  data: T;
  relevanceScore: number;
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export interface FormModalProps extends ModalProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
}

// Table Component Types
export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (record: T) => void;
  onSort?: (field: keyof T, order: 'asc' | 'desc') => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedRows: string[]) => void;
}

// Badge Component Types
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Button Component Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  className?: string;
}

// Input Component Types
export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

// Card Component Types
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavigationItem[];
  requiredRole?: UserRole;
}

export interface NavbarProps {
  user?: User;
  navigation: NavigationItem[];
  onLogout?: () => void;
}

// Statistics Types
export interface StatCard {
  title: string;
  value: number | string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: React.ReactNode;
  color?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalRooms: number;
  occupancyRate: number;
  revenue: number;
  pendingPayments: number;
  maintenanceRequests: number;
  newAnnouncements: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'checkin' | 'checkout' | 'payment' | 'booking' | 'announcement';
  description: string;
  timestamp: string;
  user: string;
}

// Maintenance Types
export interface MaintenanceRequest {
  id: string;
  roomId: string;
  reportedBy: string;
  category: 'plumbing' | 'electrical' | 'furniture' | 'cleaning' | 'other';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  reportedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
}

// System Configuration Types
export interface SystemConfig {
  hostelSettings: {
    checkInTime: string;
    checkOutTime: string;
    lateCheckoutFee: number;
    maxReservationDays: number;
  };
  paymentSettings: {
    accommodationFee: number;
    lateFeeRate: number;
    paymentDeadline: string;
    acceptedPaymentMethods: string[];
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    announcementRetention: number;
  };
}

// Error Handling Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  stack?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: any;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

// Theme and UI Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface UIConfig {
  theme: 'light' | 'dark';
  colors: ThemeColors;
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// File Upload Types
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: 'uploading' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

export interface UploadOptions {
  accept?: string[];
  maxSize?: number;
  multiple?: boolean;
  autoUpload?: boolean;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
  title?: string;
  legend?: boolean;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
}

// Export Types
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: Record<string, any>;
}

// Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

export interface FormErrors {
  [field: string]: string[];
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  userId?: string;
}

export interface RealTimeUpdate {
  type: 'checkin' | 'checkout' | 'payment' | 'announcement' | 'maintenance';
  data: any;
  timestamp: string;
}

// Cache Types
export interface CacheItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl?: number;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'lfu';
}
