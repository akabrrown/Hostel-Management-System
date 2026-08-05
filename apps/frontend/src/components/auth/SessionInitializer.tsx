'use client'

import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProfile } from '@/store/slices/authSlice'
import { RootState } from '@/store'
import { usePathname } from 'next/navigation'
import { initSocketClient, joinUserRoom } from '@/lib/socket'
import { toast } from 'react-hot-toast'

export function SessionInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()
  const { profileFetched, loading, user } = useSelector((state: RootState) => state.auth)
  const pathname = usePathname()
  const hasFetched = useRef(false)

  useEffect(() => {
    // Public routes that don't need auth check (can be expanded)
    const publicRoutes = ['/login', '/signup', '/', '/reset-password']
    const isPublicRoute = publicRoutes.some(route => 
      route === '/' ? pathname === '/' : pathname?.startsWith(route)
    )

    // If it's not a public route and we haven't fetched the profile yet, fetch it
    // We also check if a token might exists in cookies (though we can't easily check httpOnly cookies from JS)
    // Most users will have a session if they were previously logged in.
    if (!profileFetched && !loading && !hasFetched.current && !isPublicRoute) {
      hasFetched.current = true
      console.log('SessionInitializer: Fetching profile for protected route', pathname)
      dispatch(fetchProfile() as any)
    }
  }, [dispatch, profileFetched, loading, pathname])

  useEffect(() => {
    if (profileFetched && user) {
      const socket = initSocketClient()
      const userId = user.id || user.userId
      if (userId) {
        joinUserRoom(userId)
      }

      const handleNewNotification = (notification: any) => {
        // Show push notification toast
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1 flex flex-col gap-1">
                  <p className="text-sm font-bold text-gray-900">🔔 {notification.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-primary-dark focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ), { duration: 6000 })
      }

      socket.on('new_notification', handleNewNotification)

      return () => {
        socket.off('new_notification', handleNewNotification)
      }
    }
  }, [profileFetched, user])

  return <>{children}</>
}
