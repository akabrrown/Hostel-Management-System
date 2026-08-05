'use client'

import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi, handleApiError } from '@/lib/api'
import Image from 'next/image'
import { Home, ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'

const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
})

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values) => {
      setIsLoading(true)
      setError('')
      
      try {
        // This would be your actual API call for password reset
        // await authApi.resetPassword(values.email)
        
        // For now, simulate success
        setSuccess(true)
      } catch (error: any) {
        const errorMessage = handleApiError(error, 'Password reset failed')
        setError(errorMessage)
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
            className="mb-8 rounded-2xl bg-white p-2 shadow-2xl"
          />
          <h1 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            Account <span className="text-[#B8860B]">Recovery</span>.
          </h1>
          <p className="text-blue-100/80 text-lg leading-relaxed font-medium">
            Lost your credentials? We will guide you through the process of securely restoring your access to the HMS platform.
          </p>
        </div>
      </div>

      {/* Right Column - Reset Password Flow */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        
        {/* Mobile Back Button */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#003366] transition-colors text-xs font-bold tracking-widest uppercase">
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>

        <div className="w-full max-w-[420px]">
          
          {success ? (
             <div className="text-center animate-in zoom-in-95 fade-in duration-500">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
                  Recovery Email Sent
                </h2>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                  We have dispatched a secure recovery link to your registered email address. Please check your inbox and follow the enclosed instructions.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#003366]/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  Return to Login
                </button>
             </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                  Forgot Password?
                </h2>
                <p className="text-slate-500 font-medium">
                  Enter your registered institutional email to receive a recovery link.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 animate-in slide-in-from-top-2 fade-in duration-300">
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold leading-snug">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={formik.handleSubmit} className="space-y-5 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003366] transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      {...formik.getFieldProps('email')}
                      className={`w-full pl-11 pr-4 py-4 rounded-2xl border bg-white/50 backdrop-blur-sm text-slate-900 font-medium transition-all focus:outline-none focus:ring-4 focus:ring-[#003366]/10 focus:bg-white ${
                        formik.touched.email && formik.errors.email 
                          ? 'border-red-300 focus:border-red-400' 
                          : 'border-slate-200 hover:border-slate-300 focus:border-[#003366]'
                      }`}
                      placeholder="john.doe@upsamail.edu.gh"
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-xs font-bold ml-1">{formik.errors.email}</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full mt-4 bg-[#003366] hover:bg-[#002244] text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#003366]/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Send Recovery Link'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center lg:text-left">
                <p className="text-sm font-bold text-slate-500">
                  Remember your credentials?{' '}
                  <Link href="/login" className="text-[#003366] hover:text-[#B8860B] transition-colors">
                    Back to Login
                  </Link>
                </p>
              </div>
            </>
          )}

          <div className="mt-12 text-center text-xs font-bold text-slate-400">
            <p>University of Professional Studies, Accra</p>
            <p className="mt-1 text-slate-300">Secured Platform v2.0</p>
          </div>

        </div>
      </div>
    </div>
  )
}
