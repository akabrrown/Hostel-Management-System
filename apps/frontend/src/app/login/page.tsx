'use client'

import { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice'
import { authApi, setApiAuth, handleApiError } from '@/lib/api'
import Image from 'next/image'
import { Home, ArrowLeft, Eye, EyeOff, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react'

const LoginSchema = Yup.object().shape({
  identifier: Yup.string().required('Email or Index Number is required'),
  password: Yup.string().required('Password or Date of Birth is required'),
})

const OtpSchema = Yup.object().shape({
  otp: Yup.string().required('OTP is required').length(6, 'OTP must be 6 digits'),
})

const ResetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string().required('New password is required').min(8, 'Must be at least 8 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
})

export default function LoginPage() {
  const [viewState, setViewState] = useState<'login' | 'otp' | 'reset'>('login')
  const [tempToken, setTempToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Animation state for smooth transitions
  const [isTransitioning, setIsTransitioning] = useState(false)

  const dispatch = useDispatch()
  const router = useRouter()

  const switchViewState = (newState: 'login' | 'otp' | 'reset') => {
    setIsTransitioning(true)
    setTimeout(() => {
      setViewState(newState)
      setIsTransitioning(false)
    }, 300)
  }

  const handleSuccessfulAuth = (user: any, session_token: string) => {
    setApiAuth(session_token)

    // Set cookie for Next.js middleware
    document.cookie = `sb-access-token=${session_token}; path=/; max-age=86400`

    dispatch(loginSuccess({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        indexNumber: user.indexNumber || null,
      },
      token: session_token,
    }))

    const redirectMap = {
      student: '/student/dashboard',
      admin: '/admin/dashboard',
      porter: '/porter/dashboard',
    }
    router.push(redirectMap[user.role as keyof typeof redirectMap] || '/login')
  }

  const loginFormik = useFormik({
    initialValues: { identifier: '', password: '' },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      setIsLoading(true)
      setError('')
      dispatch(loginStart())

      try {
        const response = await authApi.login({
          identifier: values.identifier,
          password: values.password,
        }) as any

        if (response.requiresOtp) {
          setTempToken(response.tempToken)
          switchViewState('otp')
        } else {
          handleSuccessfulAuth(response.user, response.token)
        }
      } catch (error: any) {
        setError(handleApiError(error, 'Login failed'))
        dispatch(loginFailure())
      } finally {
        setIsLoading(false)
      }
    },
  })

  const otpFormik = useFormik({
    initialValues: { otp: '' },
    validationSchema: OtpSchema,
    onSubmit: async (values) => {
      setIsLoading(true)
      setError('')
      try {
        const response = await authApi.verifyOtp({ token: tempToken, otp: values.otp }) as any
        if (response.error) throw new Error(response.error)

        setTempToken(response.tempToken)
        switchViewState('reset')
      } catch (error: any) {
        setError(handleApiError(error, 'Invalid OTP'))
      } finally {
        setIsLoading(false)
      }
    },
  })

  const resetFormik = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values) => {
      setIsLoading(true)
      setError('')
      try {
        const response = await authApi.completeInitialReset({
          token: tempToken,
          newPassword: values.newPassword
        }) as any

        if (response.error) throw new Error(response.error)

        handleSuccessfulAuth(response.user, response.token)
      } catch (error: any) {
        setError(handleApiError(error, 'Failed to reset password'))
      } finally {
        setIsLoading(false)
      }
    },
  })

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden selection:bg-[#003366] selection:text-white">
      {/* Background Graphic Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#B8860B]/10 blur-[120px] pointer-events-none" />

      {/* Left Column - Branding & Imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#003366] flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://upsa.edu.gh/wp-content/uploads/2020/08/slide-7.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay scale-105 hover:scale-100 transition-transform duration-[10s] ease-out"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f] via-transparent to-transparent"></div>

        <div className="relative z-10 flex items-center gap-2">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-bold tracking-widest uppercase group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Portal
          </Link>
        </div>

        <div className="relative z-10 max-w-lg mt-auto mb-12">
          <Image
            src="/UPSA.jpg"
            alt="UPSA Logo"
            width={120}
            height={120}
            priority
            className="mb-8 rounded-xl bg-white p-2 shadow-2xl"
          />
          <h1 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            Elevating Your <span className="text-[#B8860B]">Campus</span> Experience.
          </h1>
          <p className="text-blue-100/80 text-lg leading-relaxed font-medium">
            Access the official UPSA Hostel Management System to manage your allocations, process payments, and request maintenance securely.
          </p>
        </div>
      </div>

      {/* Right Column - Authentication */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">

        {/* Mobile Back Button */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#003366] transition-colors text-xs font-bold tracking-widest uppercase">
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {viewState === 'login' && 'Welcome Back'}
              {viewState === 'otp' && 'Verify Identity'}
              {viewState === 'reset' && 'Secure Account'}
            </h2>
            <p className="text-slate-500 font-medium">
              {viewState === 'login' && 'Enter your credentials to access your portal.'}
              {viewState === 'otp' && 'We sent a 6-digit code to your email.'}
              {viewState === 'reset' && 'Create a strong password for future access.'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-bold leading-snug">{error}</p>
              </div>
            </div>
          )}

          {/* Form Container with Transition */}
          <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>

            {/* LOGIN STATE */}
            {viewState === 'login' && (
              <form onSubmit={loginFormik.handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="identifier" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Index Number / Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003366] transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      id="identifier"
                      type="text"
                      {...loginFormik.getFieldProps('identifier')}
                      className={`w-full pl-11 pr-4 py-4 rounded-xl border bg-white/50 backdrop-blur-sm text-slate-900 font-medium transition-all focus:outline-none focus:ring-4 focus:ring-[#003366]/10 focus:bg-white ${loginFormik.touched.identifier && loginFormik.errors.identifier
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-slate-200 hover:border-slate-300 focus:border-[#003366]'
                        }`}
                      placeholder="e.g. 10293847 or email"
                    />
                  </div>
                  {loginFormik.touched.identifier && loginFormik.errors.identifier && (
                    <p className="text-red-500 text-xs font-bold ml-1">{loginFormik.errors.identifier}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Password / Date of Birth
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003366] transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...loginFormik.getFieldProps('password')}
                      className={`w-full pl-11 pr-12 py-4 rounded-xl border bg-white/50 backdrop-blur-sm text-slate-900 font-medium transition-all focus:outline-none focus:ring-4 focus:ring-[#003366]/10 focus:bg-white ${loginFormik.touched.password && loginFormik.errors.password
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-slate-200 hover:border-slate-300 focus:border-[#003366]'
                        }`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#003366] transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {loginFormik.touched.password && loginFormik.errors.password && (
                    <p className="text-red-500 text-xs font-bold ml-1">{loginFormik.errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] font-bold text-slate-400 max-w-[200px] leading-relaxed">
                    First time? Use your DOB (DD-MM-YYYY)
                  </div>
                  <Link href="/reset-password" className="text-xs font-bold text-[#003366] hover:text-[#B8860B] transition-colors">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 bg-[#003366] hover:bg-[#002244] text-white font-bold py-4 rounded-xl shadow-xl shadow-[#003366]/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Login'
                  )}
                </button>
              </form>
            )}

            {/* OTP STATE */}
            {viewState === 'otp' && (
              <form onSubmit={otpFormik.handleSubmit} className="space-y-6">
                <div className="space-y-2 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-8 h-8 text-[#003366]" />
                  </div>
                  <label htmlFor="otp" className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                    Enter Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    {...otpFormik.getFieldProps('otp')}
                    className="w-full text-center tracking-[0.5em] text-3xl font-black py-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#003366] focus:ring-4 focus:ring-[#003366]/10 transition-all"
                    placeholder="------"
                  />
                  {otpFormik.touched.otp && otpFormik.errors.otp && (
                    <p className="text-red-500 text-xs font-bold">{otpFormik.errors.otp}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpFormik.values.otp.length !== 6}
                  className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-4 rounded-xl shadow-xl shadow-[#003366]/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify Code'}
                </button>
              </form>
            )}

            {/* RESET PASSWORD STATE */}
            {viewState === 'reset' && (
              <form onSubmit={resetFormik.handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003366] transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      {...resetFormik.getFieldProps('newPassword')}
                      className={`w-full pl-11 pr-12 py-4 rounded-xl border bg-white/50 backdrop-blur-sm text-slate-900 font-medium transition-all focus:outline-none focus:ring-4 focus:ring-[#003366]/10 focus:bg-white ${resetFormik.touched.newPassword && resetFormik.errors.newPassword
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-slate-200 hover:border-slate-300 focus:border-[#003366]'
                        }`}
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#003366] transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {resetFormik.touched.newPassword && resetFormik.errors.newPassword && (
                    <p className="text-red-500 text-xs font-bold ml-1">{resetFormik.errors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003366] transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...resetFormik.getFieldProps('confirmPassword')}
                      className={`w-full pl-11 pr-12 py-4 rounded-xl border bg-white/50 backdrop-blur-sm text-slate-900 font-medium transition-all focus:outline-none focus:ring-4 focus:ring-[#003366]/10 focus:bg-white ${resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-slate-200 hover:border-slate-300 focus:border-[#003366]'
                        }`}
                      placeholder="Repeat new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#003366] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword && (
                    <p className="text-red-500 text-xs font-bold ml-1">{resetFormik.errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 bg-[#003366] hover:bg-[#002244] text-white font-bold py-4 rounded-xl shadow-xl shadow-[#003366]/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Set Password & Access Portal'}
                </button>
              </form>
            )}

          </div>

          <div className="mt-12 text-center text-xs font-bold text-slate-400">
            <p>University of Professional Studies, Accra</p>
            <p className="mt-1 text-slate-300">Secured Platform v2.0</p>
          </div>

        </div>
      </div>
    </div>
  )
}
