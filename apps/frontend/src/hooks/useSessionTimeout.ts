import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { logout } from '@/store/slices/authSlice'

const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000 // Show warning 5 minutes before timeout

export function useSessionTimeout() {
  const dispatch = useDispatch()
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimer = () => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }

    // Set warning timer (5 minutes before logout)
    warningTimeoutRef.current = setTimeout(() => {
      const shouldContinue = window.confirm(
        'Your session will expire in 5 minutes due to inactivity. Click OK to continue your session.'
      )
      
      if (shouldContinue) {
        resetTimer() // Reset if user wants to continue
      }
    }, INACTIVITY_TIMEOUT - WARNING_TIME)

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      // Logout user
      dispatch(logout())
      router.push('/login?reason=session_timeout')
      
      // Show notification
      alert('Your session has expired due to inactivity. Please log in again.')
    }, INACTIVITY_TIMEOUT)
  }

  useEffect(() => {
    // Activity events to track
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    // Reset timer on any activity
    events.forEach(event => {
      document.addEventListener(event, resetTimer)
    })

    // Start initial timer
    resetTimer()

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer)
      })
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
