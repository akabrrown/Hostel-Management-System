'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { fetchProfile } from '@/store/slices/authSlice'
import { formatIndexNumber } from '@/lib/formatters'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { 
  Users,
  Bed, 
  LogIn, 
  LogOut, 
  Search, 
  Clock,
  ArrowRight,
  UserCheck,
  Building,
  History,
  Phone,
  Mail,
  CheckCircle,
  ChevronRight,
  MapPin,
  Activity,
  CalendarDays
} from 'lucide-react'
import { initPageAnimations } from '@/lib/animations'
import { fetchApi } from '@/lib/apiClient';
import { LoadingPage } from '@/components/ui/loading';

interface Student {
  id: string
  firstName: string
  lastName: string
  indexNumber: string
  email: string
  phone: string
  accommodationStatus: 'allocated' | 'pending' | 'none'
  room?: {
    hostel: string
    roomNumber: string
    bedNumber: string
  }
}

interface CheckInRecord {
  id: string
  studentId: string
  studentName: string
  indexNumber: string
  room: string
  bed: string
  action: 'checkin' | 'checkout'
  timestamp: string
  notes?: string
  porterName: string
}

export default function PorterDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const dispatch = useDispatch()

  const [porterStats, setPorterStats] = useState({
    occupancy: 0,
    totalCapacity: 0,
    checkedIn: 0,
    availableBeds: 0,
    todayActivity: 0
  })

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'porter')) {
      router.push('/login')
      return
    }

    const loadData = async () => {
      try {
        setIsLoading(true)
        await dispatch(fetchProfile() as any)

        const [statsRes, historyRes] = await Promise.all([
          fetchApi('/api/porter/stats'),
          fetchApi('/api/porter/today-checkins')
        ])

        if (statsRes.ok) setPorterStats(await statsRes.json())
        if (historyRes.ok) {
          const hData = await historyRes.json()
          setCheckInHistory(hData.data || [])
        }
      } catch (error) {
        console.error('Failed to load porter dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, dispatch])

  useEffect(() => {
    if (!isLoading) {
      initPageAnimations(150)
    }
  }, [isLoading])

  // Handle Search
  useEffect(() => {
    if (searchTerm.length < 3) {
      if (searchTerm.length === 0) setStudents([])
      return
    }

    const searchTimer = setTimeout(async () => {
      try {
        const res = await fetchApi(`/api/porter/search-student?query=${searchTerm}`)
        if (res.ok) {
          const data = await res.json()
          setStudents(data.data ? [data.data] : [])
        }
      } catch (error) {
        console.error('Search error:', error)
      }
    }, 500)

    return () => clearTimeout(searchTimer)
  }, [searchTerm])

  const filteredStudents = students.filter(student => 
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.indexNumber.includes(searchTerm)
  )

  const getStatusVariant = (status: string): 'success' | 'warning' | 'neutral' => {
    switch (status) {
      case 'allocated': return 'success'
      case 'pending': return 'warning'
      default: return 'neutral'
    }
  }

  const getActionVariant = (action: string): 'success' | 'danger' => {
    return action === 'checkin' ? 'success' : 'danger'
  }

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 px-6">
      {/* Hero Welcome Section */}
      <div className="page-header relative overflow-hidden rounded-xl bg-gradient-to-br from-[#003366] to-[#002244] p-10 text-white shadow-2xl shadow-[#003366]/20">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Activity className="h-48 w-48 text-[#B8860B]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight">Access <span className="text-[#B8860B]">Management</span></h1>
            <p className="text-white/80 font-bold max-w-md text-sm md:text-xs uppercase tracking-widest leading-relaxed">
              Welcome back, Porter {user?.lastName}. Securely handle student entry/exit and room audits.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <Button onClick={() => router.push('/porter/checkin')} className="bg-[#B8860B] text-white hover:bg-[#9A6F09] border-none shadow-xl px-8 h-14 text-[10px] uppercase tracking-widest font-black rounded-xl flex-1 transition-all hover:-translate-y-0.5">
               <LogIn className="w-4 h-4 mr-2" />
               Check-in
             </Button>
             <Button onClick={() => router.push('/porter/keys')} className="bg-white/10 text-white hover:bg-white/20 border-none shadow-xl px-8 h-14 text-[10px] uppercase tracking-widest font-black rounded-xl flex-1 backdrop-blur-sm transition-all hover:-translate-y-0.5">
               Key Tracking
             </Button>
             <Button onClick={() => router.push('/porter/visitors')} className="bg-white/10 text-white hover:bg-white/20 border-none shadow-xl px-8 h-14 text-[10px] uppercase tracking-widest font-black rounded-xl flex-1 backdrop-blur-sm transition-all hover:-translate-y-0.5">
               Visitor Queue
             </Button>
          </div>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="stats-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <AnimatedStatCard icon={Users} label="Total Bed Occupancy" value={porterStats.occupancy} iconColor="blue" subText={`of ${porterStats.totalCapacity} capacity`} />
         <AnimatedStatCard icon={UserCheck} label="Residents On-Site" value={porterStats.checkedIn} iconColor="green" subText="Currently present" />
         <AnimatedStatCard icon={Bed} label="Clean Vacancies" value={porterStats.availableBeds} iconColor="amber" subText="Ready for students" />
         <AnimatedStatCard icon={CheckCircle} label="Checked In" value={checkInHistory.filter(l => l.action === 'checkin').length} iconColor="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registry Search Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="registry-card border border-slate-100 shadow-sm rounded-xl bg-white overflow-hidden p-0">
             <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50">
                <div>
                   <h2 className="text-xl font-black text-slate-900 leading-none">Security Registry</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Locate student for verification</p>
                </div>
                <div className="relative w-full md:w-96 group">
                   <div className="absolute inset-0 bg-[#003366]/5 rounded-xl blur-xl group-focus-within:bg-[#003366]/10 transition-all opacity-0 group-focus-within:opacity-100" />
                   <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#003366] transition-colors" />
                      <input
                        type="text"
                        placeholder="Search Index or Full Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-xl text-sm font-black focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all placeholder:text-slate-400 placeholder:font-bold outline-none"
                      />
                   </div>
                </div>
             </div>

             <div className="p-6">
                {searchTerm.length > 0 && searchTerm.length < 3 ? (
                   <div className="py-16 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">Keep typing to search registry...</div>
                ) : filteredStudents.length > 0 ? (
                   <div className="space-y-4">
                      {filteredStudents.map(student => (
                         <div key={student.id} className="group p-6 bg-white border border-slate-100 hover:border-[#003366]/30 rounded-xl hover:shadow-lg hover:shadow-[#003366]/5 transition-all duration-300">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                               <div className="flex items-center gap-5">
                                  <div className="h-16 w-16 rounded-[1rem] bg-[#003366]/5 border border-[#003366]/10 flex items-center justify-center text-[#003366] text-xl font-black">
                                     {student.firstName[0]}{student.lastName[0]}
                                  </div>
                                  <div>
                                     <div className="text-lg font-black text-slate-900 tracking-tight group-hover:text-[#003366] transition-colors">{student.firstName} {student.lastName}</div>
                                     <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">{formatIndexNumber(student.indexNumber)}</div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                           <Phone className="w-3.5 h-3.5" /> {student.phone || 'No Phone'}
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                                  <div className="flex items-center gap-4">
                                     {student.room ? (
                                        <div className="text-right">
                                           <div className="text-xs font-black text-slate-900 tracking-tight">{student.room.hostel}</div>
                                           <div className="text-[10px] font-bold text-[#003366] uppercase tracking-widest mt-1">Room {student.room.roomNumber} • Bed {student.room.bedNumber}</div>
                                        </div>
                                     ) : (
                                        <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">No Room Allocated</div>
                                     )}
                                     <ModernBadge variant={getStatusVariant(student.accommodationStatus)}>{student.accommodationStatus}</ModernBadge>
                                  </div>
                                  <Button variant="outline" size="sm" className="w-full md:w-auto rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-[#003366] hover:text-white hover:border-[#003366] transition-all h-10 px-5">
                                     Action Center <ChevronRight className="w-4 h-4 ml-2" />
                                  </Button>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                ) : searchTerm.length >= 3 ? (
                   <div className="py-24 px-8">
                      <EmptyState
                         icon={Search}
                         title="No Records Located"
                         description={`Registry search for "${searchTerm}" returned zero results. Please verify the Index Serial.`}
                         actionLabel="Clear Search"
                         onAction={() => setSearchTerm('')}
                      />
                   </div>
                ) : (
                   <div className="py-24 text-center opacity-50">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                         <Search className="w-10 h-10 text-slate-300" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search the registry to begin verification</p>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Intelligence Panel */}
        <div className="space-y-8">
          {/* Recent Security Logs */}
          <div className="logs-card border border-slate-100 shadow-sm rounded-xl bg-white p-8">
             <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight">Security Logs</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Recent Site Activity</p>
                </div>
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                   <Clock className="w-5 h-5" />
                </div>
             </div>

             <div className="space-y-8">
                {checkInHistory.length > 0 ? (
                  checkInHistory.slice(0, 5).map((record) => (
                    <div key={record.id} className="relative pl-12 group cursor-default">
                       <div className="absolute left-3 top-2 bottom-[-24px] w-0.5 bg-slate-100 group-hover:bg-[#003366]/20 transition-all rounded-full last:hidden" />
                       <div className={`absolute top-1 left-[0.4rem] h-3.5 w-3.5 rounded-full border-[3px] border-white ring-2 ring-slate-100 transition-all group-hover:scale-125 ${
                         record.action === 'checkin' ? 'bg-emerald-500 ring-emerald-100' : 'bg-rose-500 ring-rose-100'
                       }`} />
                       
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <div className="text-sm font-black text-slate-900 leading-none group-hover:text-[#003366] transition-colors">{record.studentName}</div>
                             <div className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-widest">
                                <span className={`mr-2 font-black ${record.action === 'checkin' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                   {record.action.toUpperCase()}
                                </span>
                                • {record.room} • {record.bed}
                             </div>
                          </div>
                          <div className="text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                             {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center px-6">
                     <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No logs recorded for the current shift</p>
                  </div>
                )}
             </div>

             {checkInHistory.length > 0 && (
               <Button variant="ghost" className="w-full mt-8 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-[#003366] rounded-xl py-6 border border-slate-50 hover:border-[#003366]/10 hover:bg-[#003366]/5 transition-all">
                  Full Audit Log <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
             )}
          </div>

          {/* Quick Tasks / Guidelines */}
          <div className="guidelines-card border-none shadow-xl shadow-[#003366]/10 rounded-xl bg-[#003366] p-10 text-white relative overflow-hidden">
             <div className="absolute -bottom-8 -right-8 opacity-10">
                <Building className="h-48 w-48 text-white" />
             </div>
             <div className="relative z-10 space-y-8">
                <div>
                   <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                      <Bed className="w-7 h-7 text-white" />
                   </div>
                   <h3 className="text-2xl font-black tracking-tight">Audit Protocol</h3>
                   <p className="text-white/70 text-[10px] font-bold mt-2 uppercase tracking-widest">Standard Procedure for Residents</p>
                </div>
                
                <ul className="space-y-4">
                   {[
                     'Verify valid institutional ID',
                     'Confirm room booking status',
                     'Issue sanitized key bundle',
                     'Update digital check-in log'
                   ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-xs font-bold text-white/90">
                         <div className="w-6 h-6 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                            <ChevronRight className="w-3 h-3 text-white" />
                         </div>
                         {item}
                      </li>
                   ))}
                </ul>

                <Button className="w-full bg-[#B8860B] text-white hover:bg-[#9A6F09] border-none font-black rounded-xl h-14 text-[10px] uppercase tracking-widest shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5">
                   Open Manual
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
