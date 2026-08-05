import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchApi } from '@/lib/apiClient';

interface User {
  id: string
  email: string
  role: 'student' | 'admin' | 'porter' | 'director'
  
  // Normalized Frontend Fields (camelCase)
  firstName?: string
  lastName?: string
  indexNumber?: string
  dateOfBirth?: string
  phoneNumber?: string
  gender?: string
  programOfStudy?: string
  yearOfStudy?: number
  academicYear?: string
  profileImageUrl?: string
  emergencyContact?: {
    name?: string
    phone?: string
    relationship?: string
  }
  
  // Original Database Fields (snake_case)
  first_name?: string
  last_name?: string
  student_id?: string
  index_number?: string
  date_of_birth?: string
  phone_number?: string
  program?: string
  year_of_study?: number
  academic_year?: string
  profile_image_url?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  
  // Status & Related
  accommodationStatus?: 'none' | 'pending' | 'allocated'
  accommodation_status?: string
  paymentStatus?: string
  payment_status?: string
  
  // Extended Data
  profile?: any
  accommodation?: any
  bookings?: any[]
  reservations?: any[]
  invoices?: any[]
  
  // Metadata
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
}

const normalizeUser = (data: any): User => {
  if (!data) return data
  
  // Normalize based on what might be present (merged from profiles or users table)
  // We use multiple checks to handle different sources (API, Direct DB, etc.)
  const normalized = {
    ...data,
    // Basic Info
    firstName: data.firstName || data.first_name || data.firstName || '',
    lastName: data.lastName || data.last_name || data.lastName || '',
    
    // Identifiers
    indexNumber: data.indexNumber || data.index_number || data.student_id || '',
    
    // Vital Stats (The ones reported as missing)
    dateOfBirth: data.dateOfBirth || data.date_of_birth || '',
    phoneNumber: data.phoneNumber || data.phone_number || data.phone || data.users?.phone || '',
    gender: data.gender || '',
    
    // Academic Info
    programOfStudy: data.programOfStudy || data.program || data.programme || data.program_of_study || '',
    yearOfStudy: data.yearOfStudy !== undefined ? data.yearOfStudy : (data.year_of_study !== undefined ? data.year_of_study : (data.level !== undefined ? data.level : null)),
    academicYear: data.academicYear || data.academic_year || '',
    
    // UI related
    // UI related
    profileImageUrl: data.profileImageUrl || data.profile_image_url || '',
    
    // Compute derived statuses
    accommodationStatus: data.accommodationStatus || data.accommodation_status || 
      (data.accommodation ? 'allocated' : 
        (data.bookings && data.bookings.some((b: any) => ['allocated', 'checked_in'].includes(b.status?.toLowerCase()))) ? 'allocated' : 
        (data.bookings && data.bookings.some((b: any) => ['pending', 'pending_payment', 'paid', 'approved'].includes(b.status?.toLowerCase()))) ? 'pending' : 'none'),
        
    paymentStatus: data.paymentStatus || data.payment_status || 
      ((data.payments && data.payments.length > 0) ? data.payments[0].status?.toLowerCase() : 
       (data.bookings && data.bookings.length > 0) ? 
         (data.bookings[0].status === 'paid' || data.bookings[0].status === 'allocated' || data.bookings[0].status === 'checked_in' ? 'paid' : 
          data.bookings[0].status === 'pending_payment' ? 'pending' : 'none') 
       : 'none'),
    
    // Status & Related Data
    accommodation: data.accommodation || null,
    bookings: data.bookings || [],
    reservations: data.reservations || [],
    payments: data.payments || [],
    invoices: data.invoices || [],
    profile: data.profile || null,
    
    // Emergency Contact
    emergencyContact: {
      name: data.emergencyContact?.name || data.next_of_kin_name || data.emergency_contact_name || data.emergencyContactName || '',
      phone: data.emergencyContact?.phone || data.next_of_kin_phone || data.emergency_contact_phone || data.emergencyContactPhone || '',
      relationship: data.emergencyContact?.relationship || data.emergency_contact_relationship || data.emergencyContactRelationship || ''
    }
  }

  // Ensure snake_case aliases also exist for backward compatibility or backend use
  return {
    ...normalized,
    first_name: normalized.firstName,
    last_name: normalized.lastName,
    index_number: normalized.indexNumber,
    date_of_birth: normalized.dateOfBirth,
    phone_number: normalized.phoneNumber,
    program: normalized.programOfStudy,
    year_of_study: normalized.yearOfStudy,
    academic_year: normalized.academicYear,
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  loading: boolean
  profileFetched: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  loading: false,
  profileFetched: false,
}

// Async thunks
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/api/profile')
      const data = await response.json()
      
      if (response.ok) {
        return data.data
      } else {
        if (response.status === 401 || response.status === 403) {
          if (typeof document !== 'undefined') {
            document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          }
        }
        return rejectWithValue(data.error || 'Failed to fetch profile')
      }
    } catch (error) {
      return rejectWithValue('Failed to fetch profile')
    }
  }
)

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = normalizeUser(action.payload.user)
      state.token = action.payload.token
      state.isAuthenticated = true
      state.isLoading = false
    },
    loginFailure: (state) => {
      state.isLoading = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isLoading = false
      state.loading = false
      state.profileFetched = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false
        const profileData = action.payload.profile
        const userData = action.payload.user
        
        // Merge and normalize
        // Merge and normalize
        const mergedData = {
          ...userData,
          ...profileData,
          index_number: profileData.index_number || profileData.users?.index_number,
          profile: profileData,
          accommodation: profileData.accommodation,
          bookings: profileData.bookings,
          reservations: profileData.reservations,
          payments: profileData.payments,
          invoices: profileData.invoices,
        };


        state.user = normalizeUser(mergedData)
        state.isAuthenticated = true
        state.profileFetched = true
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.loading = false
        state.profileFetched = true
      })
  },
})

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions
export default authSlice.reducer
