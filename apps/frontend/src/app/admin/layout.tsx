'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CreditCard, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  FileText,
  UserCircle,
  Edit,
  ClipboardList,
  BarChart3,
  User,
  Key,
  Wrench,
  MessageSquareWarning
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { RootState } from '@/store'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'

const adminNavigation = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/accounts', icon: User },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Hostels', href: '/admin/hostels', icon: Building2 },
  { name: 'Rooms', href: '/admin/rooms', icon: Building2 },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Reservations', href: '/admin/reservations', icon: FileText },
  { name: 'Bookings', href: '/admin/bookings', icon: ClipboardList },
  { name: 'Room Keys', href: '/admin/room-keys', icon: Key },
  { name: 'Maintenance', href: '/admin/maintenance', icon: Wrench },
  { name: 'Complaints', href: '/admin/complaints', icon: MessageSquareWarning },
  { name: 'Porters', href: '/admin/porters', icon: UserCircle },
  { name: 'Visitors', href: '/admin/visitors', icon: Users },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Announcements', href: '/admin/announcements', icon: Bell },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dispatch = useDispatch()
  const router = useRouter()
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)

  // Enable session timeout
  useSessionTimeout()

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

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar 
        navigation={adminNavigation} 
        userRole="Administrator"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Modern Header */}
        <header className="flex h-16 items-center gap-x-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 z-30">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 lg:hidden hover:bg-slate-50 rounded-xl transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              
              {/* Notifications */}
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all relative">
                 <Bell className="h-5 w-5" />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-[#10B981] rounded-full border-2 border-white" />
              </button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />
              
              <div className="flex items-center gap-x-4 p-1">
                 <div className="hidden lg:flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-900 leading-none">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-[10px] font-bold text-[#003366] uppercase tracking-widest mt-0.5">
                      System • Admin
                    </span>
                 </div>
                 
                 <div className="w-8 h-8 rounded-full bg-[#003366] flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-[#003366]/20">
                    <User className="w-4 h-4" />
                 </div>

                 <button 
                   onClick={handleLogout}
                   className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                   title="Logout"
                 >
                   <LogOut className="h-5 w-5" />
                 </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="h-full px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
