'use client'

import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import Card from '@/components/ui/card'
import { SignupData, StudentSignupData } from '@/types'
import { loginSuccess } from '@/store/slices/authSlice'
import styles from './SignupForm.module.css'

interface SignupFormProps {
  userType: 'student' | 'staff'
  onSuccess?: () => void
}

const SignupForm = ({ userType, onSuccess }: SignupFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()

  const baseValidationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
    captchaToken: Yup.string(),
  })

  const studentValidationSchema = baseValidationSchema.shape({
    role: Yup.string().oneOf(['student']).required(),
    indexNumber: Yup.string().required('Index number is required'),
    dateOfBirth: Yup.string().required('Date of birth is required'),
    phone: Yup.string().required('Phone number is required'),
    programOfStudy: Yup.string().required('Program of study is required'),
    yearOfStudy: Yup.number().min(1).max(8).required('Year of study is required'),
    emergencyContact: Yup.object({
      name: Yup.string().required('Emergency contact name is required'),
      phone: Yup.string().required('Emergency contact phone is required'),
      relationship: Yup.string().required('Relationship is required'),
    }),
  })

  const staffValidationSchema = baseValidationSchema.shape({
    role: Yup.string().oneOf(['admin', 'porter', 'director']).required('Role is required'),
  })

  const validationSchema = userType === 'student' ? studentValidationSchema : staffValidationSchema

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: userType === 'student' ? 'student' : 'admin',
      ...(userType === 'student' && {
        indexNumber: '',
        dateOfBirth: '',
        phone: '',
        programOfStudy: '',
        yearOfStudy: 1,
        emergencyContact: {
          name: '',
          phone: '',
          relationship: '',
        },
      }),
      captchaToken: 'dev-bypass',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true)
      setError('')

      try {
        const endpoint = '/api/auth/register'
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Signup failed')
        }

        setSuccess(true)
        
        // Auto-login for students, staff needs approval
        if (userType === 'student') {
          dispatch(loginSuccess({
            user: data.user,
            token: data.token,
          }))
          
          onSuccess?.()
          router.push('/student/dashboard')
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Signup failed')
      } finally {
        setIsLoading(false)
      }
    },
  })

  const handleCaptchaSuccess = (token: string) => {
    formik.setFieldValue('captchaToken', token)
  }

  if (success && userType === 'staff') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Registration Successful!
          </h3>
          <p className="text-gray-600 mb-4">
            Your account has been created and is pending approval. You will receive an email once your account is activated.
          </p>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-navy-primary mb-2">
            Create {userType === 'student' ? 'Student' : 'Staff'} Account
          </h2>
          <p className="text-gray-600">
            {userType === 'student' 
              ? 'Register for hostel accommodation'
              : 'Register for staff access'
            }
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName ? formik.errors.firstName || undefined : undefined}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName ? formik.errors.lastName || undefined : undefined}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@upsamail.edu.gh"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email ? formik.errors.email || undefined : undefined}
            />
          </div>

          {userType === 'staff' && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <Select
                id="role"
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.role ? formik.errors.role || undefined : undefined}
                options={[
                  { value: "", label: "Select a role" },
                  { value: "admin", label: "Administrator" },
                  { value: "porter", label: "Porter" },
                  { value: "director", label: "Director" }
                ]}
              />
            </div>
          )}

          {userType === 'student' && (
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
                  value={formik.values.indexNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.indexNumber ? formik.errors.indexNumber || undefined : undefined}
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
                  value={formik.values.dateOfBirth}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.dateOfBirth ? formik.errors.dateOfBirth || undefined : undefined}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g., 0244123456"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone ? (formik.errors as any).phone || undefined : undefined}
                />
              </div>

              <div>
                <label htmlFor="programOfStudy" className="block text-sm font-medium text-gray-700 mb-1">
                  Program of Study
                </label>
                <Input
                  id="programOfStudy"
                  name="programOfStudy"
                  type="text"
                  placeholder="e.g., B.Sc. Computer Science"
                  value={formik.values.programOfStudy}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.programOfStudy ? formik.errors.programOfStudy || undefined : undefined}
                />
              </div>

              <div>
                <label htmlFor="yearOfStudy" className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Study
                </label>
                <Select
                  id="yearOfStudy"
                  name="yearOfStudy"
                  value={formik.values.yearOfStudy}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.yearOfStudy ? formik.errors.yearOfStudy || undefined : undefined}
                  options={[
                    { value: "", label: "Select year" },
                    { value: "1", label: "Year 1" },
                    { value: "2", label: "Year 2" },
                    { value: "3", label: "Year 3" },
                    { value: "4", label: "Year 4" }
                  ]}
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Emergency Contact</h4>
                
                <div>
                  <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <Input
                    id="emergencyContact.name"
                    name="emergencyContact.name"
                    type="text"
                    placeholder="Emergency contact name"
                    value={formik.values.emergencyContact?.name || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={(formik.touched.emergencyContact as any)?.name ? (formik.errors.emergencyContact as any)?.name || undefined : undefined}
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <Input
                    id="emergencyContact.phone"
                    name="emergencyContact.phone"
                    type="tel"
                    placeholder="Emergency contact phone"
                    value={formik.values.emergencyContact?.phone || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={(formik.touched.emergencyContact as any)?.phone ? (formik.errors.emergencyContact as any)?.phone || undefined : undefined}
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <Input
                    id="emergencyContact.relationship"
                    name="emergencyContact.relationship"
                    type="text"
                    placeholder="e.g., Parent, Guardian"
                    value={formik.values.emergencyContact?.relationship || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={(formik.touched.emergencyContact as any)?.relationship ? (formik.errors.emergencyContact as any)?.relationship || undefined : undefined}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password ? formik.errors.password || undefined : undefined}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword ? formik.errors.confirmPassword || undefined : undefined}
            />
          </div>

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
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-navy-primary hover:text-navy-secondary">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </Card>
  )
}

export default SignupForm
