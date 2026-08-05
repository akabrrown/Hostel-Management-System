'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { 
  LayoutDashboard, 
  LogIn, 
  LogOut as LogOutIcon,
  Menu,
  LogOut,
  Bell,
  User,
  Key,
  Users,
  Wrench,
  DoorOpen,
  MessageSquareWarning
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { RootState } from '@/store'
import { initPageAnimations } from '@/lib/animations'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'

const porterNavigation = [
  { name: 'Control Center', href: '/porter/dashboard', icon: LayoutDashboard },
  { name: 'Room Matrix', href: '/porter/rooms', icon: DoorOpen },
  { name: 'Check-in Registry', href: '/porter/checkin', icon: LogIn },
  { name: 'Check-out Log', href: '/porter/checkout', icon: LogOutIcon },
  { name: 'Key Tracking', href: '/porter/keys', icon: Key },
  { name: 'Visitor Queue', href: '/porter/visitors', icon: Users },
  { name: 'Maintenance', href: '/porter/maintenance', icon: Wrench },
  { name: 'Complaints', href: '/porter/complaints', icon: MessageSquareWarning },
  { name: 'Announcements', href: '/porter/announcements', icon: Bell },
]

export default function PorterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dispatch = useDispatch()
  const router = useRouter()
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    initPageAnimations()
  }, [])

  // Enable session timeout
  useSessionTimeout()

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar 
        navigation={porterNavigation} 
        userRole="Porter"
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
                 <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
              </button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />
              
              <div className="flex items-center gap-x-4 p-1">
                 <div className="hidden lg:flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-900 leading-none">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
                      Personnel • Porter
                    </span>
                 </div>
                 
                 <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/20">
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
