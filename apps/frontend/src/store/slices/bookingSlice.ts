import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { fetchApi } from '@/lib/apiClient';
import { 
  Reservation, 
  Booking, 
  Hostel, 
  Room, 
  ReservationPreferences,
  ApiResponse 
} from '@/types'

// Async thunks
export const fetchAvailableHostels = createAsyncThunk(
  'booking/fetchAvailableHostels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/api/hostels/available')
      const data: ApiResponse<Hostel[]> = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch hostels')
      }
      
      return data.data || []
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch hostels')
    }
  }
)

export const fetchAvailableRooms = createAsyncThunk(
  'booking/fetchAvailableRooms',
  async (hostelId: string, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/api/hostels/${hostelId}/rooms/available`)
      const data: ApiResponse<Room[]> = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch rooms')
      }
      
      return data.data || []
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch rooms')
    }
  }
)

export const submitReservation = createAsyncThunk(
  'booking/submitReservation',
  async (preferences: ReservationPreferences, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      })
      
      const data: ApiResponse<Reservation> = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit reservation')
      }
      
      return data.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to submit reservation')
    }
  }
)

export const bookBed = createAsyncThunk(
  'booking/bookBed',
  async (bedId: string, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bedId }),
      })
      
      const data: ApiResponse<Booking> = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to book bed')
      }
      
      return data.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to book bed')
    }
  }
)

interface BookingState {
  currentReservation: Reservation | null
  currentBooking: Booking | null
  availableHostels: Hostel[]
  availableRooms: Room[]
  selectedPreferences: ReservationPreferences | null
  loading: boolean
  error: string | null
}

const initialState: BookingState = {
  currentReservation: null,
  currentBooking: null,
  availableHostels: [],
  availableRooms: [],
  selectedPreferences: null,
  loading: false,
  error: null,
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSelectedPreferences: (state, action: PayloadAction<ReservationPreferences>) => {
      state.selectedPreferences = action.payload
    },
    clearCurrentReservation: (state) => {
      state.currentReservation = null
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null
    },
    clearAvailableRooms: (state) => {
      state.availableRooms = []
    },
    clearError: (state) => {
      state.error = null
    },
    resetBookingState: (state) => {
      state.currentReservation = null
      state.currentBooking = null
      state.selectedPreferences = null
      state.availableRooms = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch available hostels
    builder
      .addCase(fetchAvailableHostels.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAvailableHostels.fulfilled, (state, action) => {
        state.loading = false
        state.availableHostels = action.payload
      })
      .addCase(fetchAvailableHostels.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch available rooms
    builder
      .addCase(fetchAvailableRooms.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAvailableRooms.fulfilled, (state, action) => {
        state.loading = false
        state.availableRooms = action.payload
      })
      .addCase(fetchAvailableRooms.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Submit reservation
    builder
      .addCase(submitReservation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitReservation.fulfilled, (state, action) => {
        state.loading = false
        state.currentReservation = action.payload || null
      })
      .addCase(submitReservation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Book bed
    builder
      .addCase(bookBed.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(bookBed.fulfilled, (state, action) => {
        state.loading = false
        state.currentBooking = action.payload || null
      })
      .addCase(bookBed.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  setSelectedPreferences,
  clearCurrentReservation,
  clearCurrentBooking,
  clearAvailableRooms,
  clearError,
  resetBookingState,
} = bookingSlice.actions

export default bookingSlice.reducer
