import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchApi } from '@/lib/apiClient';

interface CheckinRecord {
  id: string
  student: {
    id: string
    firstName: string
    lastName: string
    indexNumber: string
    room?: {
      roomNumber: string
    }
  }
  room?: {
    roomNumber: string
  }
  checkInTime: string
  checkOutTime?: string | null
  status: 'active' | 'checked_in' | 'checked_out'
}

interface PorterState {
  todayCheckins: CheckinRecord[]
  loading: boolean
  error: string | null
}

const initialState: PorterState = {
  todayCheckins: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchTodayCheckins = createAsyncThunk(
  'porter/fetchTodayCheckins',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/api/porter/today-checkins')
      const data = await response.json()
      
      if (response.ok) {
        return data.data || []
      } else {
        return rejectWithValue(data.error || 'Failed to fetch check-ins')
      }
    } catch (error) {
      return rejectWithValue('Failed to fetch check-ins')
    }
  }
)

export const performCheckin = createAsyncThunk(
  'porter/performCheckin',
  async (studentId: string, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/api/porter/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      })
      const data = await response.json()
      
      if (response.ok) {
        return data.data
      } else {
        return rejectWithValue(data.error || 'Failed to check in student')
      }
    } catch (error) {
      return rejectWithValue('Failed to check in student')
    }
  }
)

export const performCheckout = createAsyncThunk(
  'porter/performCheckout',
  async (studentId: string, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/api/porter/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      })
      const data = await response.json()
      
      if (response.ok) {
        return data.data
      } else {
        return rejectWithValue(data.error || 'Failed to check out student')
      }
    } catch (error) {
      return rejectWithValue('Failed to check out student')
    }
  }
)

export const porterSlice = createSlice({
  name: 'porter',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTodayCheckins
      .addCase(fetchTodayCheckins.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTodayCheckins.fulfilled, (state, action) => {
        state.loading = false
        state.todayCheckins = action.payload
      })
      .addCase(fetchTodayCheckins.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // performCheckin
      .addCase(performCheckin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(performCheckin.fulfilled, (state, action) => {
        state.loading = false
        // Add the new checkin to the list
        state.todayCheckins.push(action.payload)
      })
      .addCase(performCheckin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // performCheckout
      .addCase(performCheckout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(performCheckout.fulfilled, (state, action) => {
        state.loading = false
        // Remove the checkout from the list (or update status)
        const index = state.todayCheckins.findIndex(checkin => checkin.id === action.payload.id)
        if (index !== -1) {
          state.todayCheckins[index] = action.payload
        }
      })
      .addCase(performCheckout.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = porterSlice.actions
export default porterSlice.reducer
