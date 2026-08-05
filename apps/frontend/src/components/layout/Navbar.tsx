'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { Menu, User, LogOut, Settings, LayoutDashboard } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'

interface NavbarProps {
  title?: string
  showUserMenu?: boolean
  onMenuClick?: () => void
}

export function Navbar({ title = 'UPSA Hostel Management', showUserMenu = true, onMenuClick }: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await authApi.logout()
      dispatch(logout())
      // Clear our custom token cookie
      document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      router.push('/login')
      router.refresh()
    }
  }

  const getDashboardPath = () => {
    if (!user) return '/login'
    const rolePaths = {
      student: '/student/dashboard',
      admin: '/admin/dashboard',
      porter: '/porter/dashboard',
      director: '/director/dashboard',
    }
    return rolePaths[user.role as keyof typeof rolePaths] || '/login'
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 transition-all duration-300">
          {/* Left side */}
          <div className="flex items-center gap-6">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="p-2 -ml-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <Link href="/" className="flex-shrink-0 flex items-center h-12 transition-transform hover:scale-[1.02]">
              <Image
                src="/UPSA.jpg"
                alt="UPSA Logo"
                width={180}
                height={54}
                priority
                className="h-full w-auto object-contain mix-blend-multiply"
              />
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {showUserMenu && !isAuthenticated && (
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm"
              >
                Sign in
              </button>
            )}

            {showUserMenu && isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all focus:outline-none"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-600 shadow-sm">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">
                    {user.firstName || user.email?.split('@')[0] || 'Account'}
                  </span>
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-4 py-2 border-b border-slate-50 mb-2">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-blue-600 font-medium capitalize mt-0.5">{user.role}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        router.push(getDashboardPath())
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-3 opacity-70" />
                      Dashboard
                    </button>

                    <button
                      onClick={() => {
                        const settingsPath = user?.role === 'student' ? '/student/settings' : '/admin/settings'
                        router.push(settingsPath)
                        setIsUserMenuOpen(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-400" />
                      Settings
                    </button>

                    <div className="h-px bg-gray-100 my-2" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
