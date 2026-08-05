'use client'

import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Card from '@/components/ui/card'
import { LoginCredentials, StudentLoginCredentials } from '@/types'
import { loginSuccess } from '@/store/slices/authSlice'
import styles from './LoginForm.module.css'

interface LoginFormProps {
  userType: 'student' | 'staff'
  onSuccess?: () => void
}

interface StudentFormValues {
  indexNumber: string
  dateOfBirth: string
  captchaToken: string
}

interface StaffFormValues {
  email: string
  password: string
  captchaToken: string
}

const LoginForm = ({ userType, onSuccess }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const dispatch = useDispatch()

  const validationSchema = Yup.object({
    ...(userType === 'student' 
      ? {
          indexNumber: Yup.string().required('Index number is required'),
          dateOfBirth: Yup.string().required('Date of birth is required'),
        }
      : {
          email: Yup.string().email('Invalid email address').required('Email is required'),
          password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        }
    ),
    captchaToken: Yup.string().required('Please complete the captcha'),
  })

  const formik = useFormik<StudentFormValues | StaffFormValues>({
    initialValues: {
      ...(userType === 'student' 
        ? {
            indexNumber: '',
            dateOfBirth: '',
          }
        : {
            email: '',
            password: '',
          }
      ),
      captchaToken: '',
    } as StudentFormValues | StaffFormValues,
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true)
      setError('')

      try {
        const endpoint = userType === 'student' ? '/api/auth/student-login' : '/api/auth/login'
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Login failed')
        }

        dispatch(loginSuccess({
          user: data.user,
          token: data.token,
        }))

        onSuccess?.()
        
        // Redirect based on user role
        const redirectMap: Record<string, string> = {
          student: '/student/dashboard',
          admin: '/admin/dashboard',
          porter: '/porter/dashboard',
          director: '/director/dashboard',
        }
        
        router.push(redirectMap[data.user.role] || '/')

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed')
      } finally {
        setIsLoading(false)
      }
    },
  })

  const handleCaptchaSuccess = (token: string) => {
    formik.setFieldValue('captchaToken', token)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-navy-primary mb-2">
            {userType === 'student' ? 'Student Login' : 'Staff Login'}
          </h2>
          <p className="text-gray-600">
            {userType === 'student' 
              ? 'Enter your index number and date of birth'
              : 'Enter your email and password'
            }
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {userType === 'student' ? (
            <>
              <div>
                <label htmlFor="indexNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Index Number
                </label>
                <Input
                  id="indexNumber"
                  name="indexNumber"
                  type="text"
                  placeholder="e.g., 2021001234"
                  value={userType === 'student' ? (formik.values as StudentFormValues).indexNumber : ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={userType === 'student' && (formik.touched as any).indexNumber ? (formik.errors as any).indexNumber || undefined : undefined}
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={userType === 'student' ? (formik.values as StudentFormValues).dateOfBirth : ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={userType === 'student' && (formik.touched as any).dateOfBirth ? (formik.errors as any).dateOfBirth || undefined : undefined}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@upsamail.edu.gh"
                  value={userType === 'staff' ? (formik.values as StaffFormValues).email : ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={userType === 'staff' && (formik.touched as any).email ? (formik.errors as any).email || undefined : undefined}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={userType === 'staff' ? (formik.values as StaffFormValues).password : ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={userType === 'staff' && (formik.touched as any).password ? (formik.errors as any).password || undefined : undefined}
                />
              </div>
            </>
          )}

          {/* Cloudflare Turnstile would go here */}
          <div className="flex justify-center">
            <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600">
              Captcha placeholder - Cloudflare Turnstile integration
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formik.values.captchaToken}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {userType === 'student' ? (
              <>
                First time? Enter your index number and use your date of birth as the password (DDMMYYYY).
              </>
            ) : (
              <>
                Forgot your password?{' '}
                <a href="/forgot-password" className="text-navy-primary hover:text-navy-secondary">
                  Reset password
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </Card>
  )
}

export default LoginForm
