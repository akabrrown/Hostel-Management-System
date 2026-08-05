'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon, X } from 'lucide-react'
import Image from 'next/image'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface SidebarProps {
  navigation: NavItem[]
  title?: string
  userRole?: string
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ navigation, title = 'Hostel Management', userRole, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
         <div 
           className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
           onClick={onClose}
         ></div>
      )}

      {/* Sidebar component */}
      <div className={`
        fixed inset-y-0 z-50 flex w-72 flex-col bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-slate-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 h-10 mt-2 mb-2">
             <Image 
                src="/UPSA.jpg" 
                alt="UPSA Logo" 
                width={200}
                height={60}
                priority
                className="h-full w-auto object-contain mix-blend-multiply"
              />
          </div>
          <button 
            type="button" 
            className="lg:hidden -m-2.5 p-2.5 text-slate-700 hover:text-slate-900 transition-colors"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 sm:px-6 pb-4">
          {userRole && (
            <div className="mt-6 mb-2">
              <span className="text-[10px] font-black leading-6 text-slate-400 uppercase tracking-widest">
                {userRole} Portal
              </span>
            </div>
          )}
          
          <nav className="flex-1 space-y-1 mt-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-bold transition-all
                    ${isActive 
                      ? 'bg-[#003366]/5 text-[#003366]' 
                      : 'text-slate-500 hover:text-[#003366] hover:bg-slate-50'
                    }
                  `}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-[#003366]' : 'text-slate-400 group-hover:text-[#003366]'}`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
