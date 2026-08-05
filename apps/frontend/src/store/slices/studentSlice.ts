import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Student {
  id: string
  firstName: string
  lastName: string
  indexNumber: string
  email: string
  phone: string
  accommodationStatus: string
  bookings: any[]
  paymentStatus: string
  room?: {
    hostel: string
    roomNumber: string
    bedNumber: string
  }
}

interface StudentState {
  student: Student | null
  isLoading: boolean
  error: string | null
}

const initialState: StudentState = {
  student: null,
  isLoading: false,
  error: null,
}

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudent: (state, action: PayloadAction<Student>) => {
      state.student = action.payload
    },
    clearStudent: (state) => {
      state.student = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setStudent, clearStudent, setLoading, setError } = studentSlice.actions
export default studentSlice.reducer
