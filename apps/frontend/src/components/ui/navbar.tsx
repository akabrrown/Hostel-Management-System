'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'
import Image from 'next/image'
import styles from './navbar.module.css'

interface NavbarProps {
  title?: string
  showUserMenu?: boolean
  onMenuClick?: () => void
}

export default function Navbar({ title = 'UPSA Hostel Management', showUserMenu = true, onMenuClick }: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch(e) {}
    dispatch(logout())
    router.push('/login')
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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left side */}
          <div className="flex items-center gap-6">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="p-2 -ml-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors focus:outline-none"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div className="flex-shrink-0 cursor-pointer flex items-center h-12" onClick={() => router.push('/')}>
              <Image 
                src="/UPSA.jpg" 
                alt="UPSA Logo" 
                width={200}
                height={60}
                priority
                className="h-full w-auto object-contain mix-blend-multiply"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {showUserMenu && !isAuthenticated && (
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded hover:bg-gray-800 transition-colors focus:outline-none"
              >
                Sign in
              </button>
            )}
            
            {showUserMenu && isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all focus:outline-none"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 text-gray-600">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user.firstName || 'Account'}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-50 mb-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.firstName ? user.firstName : 'User'}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        router.push(getDashboardPath())
                        setIsUserMenuOpen(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      Dashboard
                    </button>
                    
                    <button
                      onClick={() => {
                        router.push('/profile')
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
