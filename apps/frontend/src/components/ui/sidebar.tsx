'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { Home, Users, Bed, CreditCard, Calendar, Settings, BarChart, LogOut, Menu, X } from 'lucide-react'
import styles from './sidebar.module.css'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  label: string
  icon: React.ReactNode
  path: string
  roles?: string[]
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useSelector((state: RootState) => state.auth)

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/dashboard',
    },
    {
      label: 'Room Booking',
      icon: <Bed className="h-5 w-5" />,
      path: '/room-booking',
      roles: ['student'],
    },
    {
      label: 'Room Reservation',
      icon: <Calendar className="h-5 w-5" />,
      path: '/room-reservation',
      roles: ['student'],
    },
    {
      label: 'Students',
      icon: <Users className="h-5 w-5" />,
      path: '/students',
      roles: ['admin', 'director'],
    },
    {
      label: 'Payments',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/payments',
      roles: ['student', 'admin', 'director'],
    },
    {
      label: 'Analytics',
      icon: <BarChart className="h-5 w-5" />,
      path: '/analytics',
      roles: ['admin', 'director'],
    },
    {
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/settings',
    },
  ]

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true
    return user && item.roles.includes(user.role)
  })

  const handleNavigation = (path: string) => {
    router.push(path)
    onClose()
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.firstName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
