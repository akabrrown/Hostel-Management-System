'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { Toaster } from 'react-hot-toast'
import { SessionInitializer } from './auth/SessionInitializer'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionInitializer>
        {children}
        <Toaster position="top-right" />
      </SessionInitializer>
    </Provider>
  )
}
