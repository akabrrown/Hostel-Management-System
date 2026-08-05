'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchNotifications } from '@/store/slices/notificationSlice'
import { gsap } from 'gsap'
import Button from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Bell, Calendar, User, Filter, AlertCircle, Info, CheckCircle2, Megaphone, Check } from 'lucide-react'
import apiClient from '@/lib/api'
import { toast } from 'react-hot-toast'
import { LoadingPage } from '@/components/ui/loading';

interface Announcement {
  id: number
  title: string
  content: string
  author: string
  category: string
  priority: string
  date: string
  read: boolean
}

export default function StudentAnnouncements() {
  const dispatch = useDispatch()
  const { notifications, loading: notifLoading } = useSelector((state: RootState) => state.notifications)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<any>('/announcements')
      setAnnouncements(response.data || [])
    } catch (error) {
      console.error('Failed to load announcements:', error)
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    dispatch(fetchNotifications() as any)
    loadAnnouncements()
  }, [dispatch])

  // GSAP Animations
  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.page-header',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        )
        gsap.fromTo('.announcement-card',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, delay: 0.2, ease: 'power3.out' }
        )
      })
      return () => ctx.revert()
    }
  }, [loading])

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || announcement.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'academic': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Info }
      case 'payment': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 }
      case 'maintenance': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: AlertCircle }
      case 'emergency': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: AlertCircle }
      default: return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', icon: Megaphone }
    }
  }

  const markAsRead = (id: number) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
    toast.success('Marked as read')
  }

  if (loading) {
    return (
      <LoadingPage />
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 page-header">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 bg-[#003366]/10 rounded-xl">
                   <Megaphone className="w-6 h-6 text-[#003366]" />
                 </div>
                 <span className="text-[#003366] font-black uppercase tracking-widest text-[10px]">Notice Board</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Announcements</h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-2xl">
                Stay updated with the latest news, events, and important notices from the administration.
              </p>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
               <div className="flex items-center gap-2 bg-[#003366]/5 text-[#003366] px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-[#003366]/10">
                 <Bell className="w-4 h-4" />
                 {announcements.filter(a => !a.read).length} Unread
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search & Filter */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 page-header relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm font-medium text-slate-900"
            />
          </div>
          <div className="md:w-64 relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer text-slate-700"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="payment">Payment</option>
              <option value="maintenance">Maintenance</option>
              <option value="social">Social</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => {
              const config = getCategoryConfig(announcement.category)
              const Icon = config.icon
              
              return (
                <div 
                  key={announcement.id} 
                  className={`group announcement-card bg-white rounded-2xl p-8 border shadow-sm hover:border-slate-300 transition-colors relative overflow-hidden ${announcement.read ? 'border-slate-200 opacity-90' : 'border-[#003366]/30'}`}
                >
                  <div className="flex items-start gap-6 z-10 relative">
                     <div className={`p-4 rounded-[1.5rem] ${config.bg} flex-shrink-0`}>
                       <Icon className={`w-6 h-6 ${config.color}`} />
                     </div>
                     
                     <div className="flex-1">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                         <div className="flex items-center gap-3">
                           <h3 className={`text-xl font-black tracking-tight ${announcement.read ? 'text-slate-700' : 'text-slate-900'}`}>{announcement.title}</h3>
                           {!announcement.read && (
                             <span className="bg-[#003366]/10 text-[#003366] text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest border border-[#003366]/20">
                               New
                             </span>
                           )}
                         </div>
                         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                           <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border-2 border-slate-100">
                             <User className="w-3.5 h-3.5 text-[#003366]" />
                             {announcement.author}
                           </span>
                           <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border-2 border-slate-100">
                             <Calendar className="w-3.5 h-3.5 text-[#003366]" />
                             {new Date(announcement.date).toLocaleDateString()}
                           </span>
                         </div>
                       </div>
                       
                       <p className={`text-sm mb-6 leading-relaxed font-medium ${announcement.read ? 'text-slate-500' : 'text-slate-700'}`}>
                         {announcement.content}
                       </p>
                       
                       <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                         <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${config.color} ${config.bg} border-2 ${config.border}`}>
                           {announcement.category}
                         </span>
                         
                         {!announcement.read && (
                           <Button 
                             size="sm" 
                             variant="ghost" 
                             onClick={() => markAsRead(announcement.id)}
                             className="text-[10px] font-black uppercase tracking-widest text-[#003366] hover:bg-[#003366]/5 rounded-xl py-4 px-5"
                           >
                             <Check className="w-3.5 h-3.5 mr-2" /> Mark as Read
                           </Button>
                         )}
                       </div>
                     </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm announcement-card">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Announcements</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto">
                 You are all caught up! There are no announcements to display at this time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
