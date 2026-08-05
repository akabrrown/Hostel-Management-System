import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { loginStart, loginSuccess, loginFailure, logout } from '@/store/slices/authSlice'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { authApi, setApiAuth, handleApiError } from '@/lib/api'

interface UseAuthReturn {
  user: any
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, role: string) => Promise<void>
  logoutUser: () => void
  error: string | null
}

export function useAuth(): UseAuthReturn {
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string, role: string) => {
    setError(null)
    dispatch(loginStart())

    try {
      const response = await authApi.login({ email, password, role }) as { error?: string; user?: any; session?: any }

      if (response.error) {
        throw new Error(response.error)
      }

      const { user, session } = response

      // Store auth token
      setApiAuth(session.access_token)

      dispatch(loginSuccess({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token: session.access_token,
      }))

      // Redirect based on role
      const redirectMap = {
        student: '/student/dashboard',
        admin: '/admin/dashboard',
        porter: '/porter/dashboard',
        director: '/director/dashboard',
      }

      router.push(redirectMap[user.role as keyof typeof redirectMap])
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Login failed')
      setError(errorMessage)
      dispatch(loginFailure())
    }
  }

  const logoutUser = async () => {
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch(e) {}
    dispatch(logout())
    router.push('/login')
  }

  return {
    user,
    loading: isLoading,
    isAuthenticated,
    login,
    logoutUser,
    error,
  }
}
