import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import studentSlice from './slices/studentSlice'
import bookingSlice from './slices/bookingSlice'
import notificationSlice from './slices/notificationSlice'
import porterSlice from './slices/porterSlice'
import adminSlice from './slices/adminSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    student: studentSlice,
    booking: bookingSlice,
    notifications: notificationSlice,
    porter: porterSlice,
    admin: adminSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
