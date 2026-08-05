'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchTodayCheckins, performCheckout } from '@/store/slices/porterSlice'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import ModernBadge from '@/components/admin/ModernBadge'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import EmptyState from '@/components/admin/EmptyState'
import { 
  Search, 
  Clock, 
  User, 
  LogOut, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  MapPin,
  Activity,
  UserX,
  History,
  ArrowRight,
  ShieldAlert,
  Zap,
  ChevronRight,
  CheckCircle2
} from 'lucide-react'
import { formatIndexNumber } from '@/lib/formatters'
import { initPageAnimations } from '@/lib/animations'
import { LoadingPage } from '@/components/ui/loading';

export default function PorterCheckout() {
  const dispatch = useDispatch()
  const { todayCheckins, loading } = useSelector((state: RootState) => state.porter)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  useEffect(() => {
    dispatch(fetchTodayCheckins() as any)
    initPageAnimations(150)
  }, [dispatch])

  const activeCheckins = todayCheckins.filter(checkin => checkin.status === 'active' || checkin.status === 'checked_in')
  const checkedOutToday = todayCheckins.filter(checkin => 
    checkin.checkOutTime && new Date(checkin.checkOutTime).toDateString() === new Date().toDateString()
  )

  const filteredCheckinsActive = activeCheckins.filter(checkin =>
    checkin.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.student.indexNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCheckout = async (studentId: string) => {
    try {
      await dispatch(performCheckout(studentId) as any)
      setSelectedStudent(null)
      setSearchTerm('')
      dispatch(fetchTodayCheckins() as any)
    } catch (error) {
      console.error('Error performing check-out:', error)
    }
  }

  const getDurationHours = (checkInTime: string) => {
    const start = new Date(checkInTime)
    const end = new Date()
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60))
  }

  const getFinalDuration = (start: string, end: string) => {
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60))
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 pb-12">
      {/* Registry Header */}
      <div className="page-header bg-white p-10 rounded-2xl shadow-sm border-2 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Check-out <span className="text-rose-600">Protocol</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Personnel Access Control</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-inner">
             <Calendar className="w-5 h-5 text-rose-500" />
             <div className="text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Logs</div>
                <div className="text-sm font-black text-slate-700 mt-1">{new Date().toLocaleDateString('en-GB')}</div>
             </div>
           </div>
        </div>
      </div>

      {/* Registry Intelligence Side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Control Panel */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Active Search & Primary Control */}
           <div className="control-panel border-2 border-slate-100 shadow-sm rounded-2xl bg-white p-10">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-none">Departure Verification</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Initialize exit for resident</p>
                 </div>
                 <div className="w-12 h-12 bg-rose-50 rounded-[1.25rem] border-2 border-rose-100 flex items-center justify-center text-rose-600">
                    <UserX className="w-6 h-6" />
                 </div>
              </div>

              <div className="relative group mb-10">
                 <div className="absolute inset-0 bg-rose-500/5 rounded-2xl blur-xl group-focus-within:bg-rose-500/10 transition-all opacity-0 group-focus-within:opacity-100" />
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                    <input
                       type="text"
                       placeholder="Find student currently on-site..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all placeholder:text-slate-400 placeholder:font-bold outline-none"
                    />
                 </div>
              </div>

              {/* Active Residents List (Filtered) */}
              <div className="space-y-4">
                 <div className="flex items-center gap-4 px-4 mb-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-1">Resident Identifier</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-32 text-center">Protocol</div>
                 </div>

                 {loading ? (
                    <LoadingPage />
                 ) : filteredCheckinsActive.length > 0 ? (
                    filteredCheckinsActive.map((checkin) => (
                       <div key={checkin.id} className="group p-6 bg-white border-2 border-slate-100 hover:border-[#B8860B]/20 rounded-[2rem] hover:shadow-lg hover:shadow-[#B8860B]/5 transition-all duration-300">
                          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                             <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-[1.25rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-400 text-lg font-black group-hover:bg-[#003366]/5 group-hover:border-[#003366]/10 group-hover:text-[#003366] transition-all">
                                   {checkin.student.firstName[0]}{checkin.student.lastName[0]}
                                </div>
                                <div>
                                   <h3 className="font-black text-lg text-slate-900 group-hover:text-[#003366] transition-colors">{checkin.student.firstName} {checkin.student.lastName}</h3>
                                   <div className="flex items-center gap-3 mt-2">
                                      <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 uppercase tracking-widest">{formatIndexNumber(checkin.student.indexNumber)}</span>
                                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">UNIT {checkin.room?.roomNumber || 'PENDING'}</span>
                                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                                      <span className="text-[10px] font-black text-[#B8860B] uppercase tracking-widest">Duration: {getDurationHours(checkin.checkInTime)}h</span>
                                   </div>
                                </div>
                             </div>
                             
                             <Button onClick={() => handleCheckout(checkin.student.id)} className="w-full md:w-auto h-12 px-8 rounded-xl bg-[#003366] hover:bg-[#B8860B] text-white shadow-lg shadow-[#003366]/10 font-black text-[10px] uppercase tracking-[0.15em] transition-all hover:-translate-y-0.5">
                                <LogOut className="w-5 h-5 mr-2" /> De-authorize
                             </Button>
                          </div>
                       </div>
                    ))
                 ) : searchTerm ? (
                    <div className="py-16 px-8 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                       <UserX className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No active resident matching &quot;{searchTerm}&quot;</p>
                    </div>
                 ) : (
                    <div className="py-20">
                       <EmptyState
                          icon={CheckCircle2}
                          title="Site Area Clear"
                          description="All registered residents have successfully processed their departure or no entry recorded."
                          actionLabel="Sync Registry"
                          onAction={() => dispatch(fetchTodayCheckins() as any)}
                       />
                    </div>
                 )}
              </div>
           </div>

           {/* Finalized Exit Archive */}
           <div className="archive-panel border-2 border-slate-100 shadow-sm rounded-2xl bg-white p-10">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                 <div>
                    <h2 className="text-2xl font-black text-[#003366] leading-none">Exit Log Archive</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Verified Shift Departures</p>
                 </div>
                 <div className="w-12 h-12 bg-emerald-50 rounded-[1.25rem] border-2 border-emerald-100 flex items-center justify-center text-emerald-600">
                    <History className="w-6 h-6" />
                 </div>
              </div>

              <div className="space-y-4">
                 {checkedOutToday.length > 0 ? (
                    checkedOutToday.map((checkin) => (
                       <div key={checkin.id} className="p-6 bg-slate-50 border-2 border-slate-100 hover:bg-white hover:border-[#003366]/20 hover:shadow-lg hover:shadow-[#003366]/5 rounded-[2rem] transition-all duration-300">
                          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                             <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-[1.25rem] bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                                   <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                   <h3 className="font-black text-lg text-slate-900 leading-none">{checkin.student.firstName} {checkin.student.lastName}</h3>
                                   <div className="flex items-center gap-3 mt-3">
                                      <span className="text-[10px] font-black text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200 tracking-widest uppercase">Final Unit: {checkin.room?.roomNumber || 'N/A'}</span>
                                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Exit Verified</span>
                                   </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right">
                                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visit Duration</div>
                                   <div className="text-sm font-black text-slate-900 mt-1">{getFinalDuration(checkin.checkInTime, checkin.checkOutTime!)}h</div>
                                </div>
                                <div className="text-sm font-black text-slate-400 border-l-2 border-slate-200 pl-6 py-2">
                                   {new Date(checkin.checkOutTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                             </div>
                          </div>
                       </div>
                    ))
                 ) : (
                    <div className="py-24 px-8 text-center opacity-50">
                       <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No departures archived today</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Audit Sidebar */}
        <div className="space-y-8">
           {/* Shift Intelligence */}
           <div className="space-y-4">
              <AnimatedStatCard icon={Activity} label="Occupied Units" value={activeCheckins.length} iconColor="blue" subText="Residents On-site" />
              <AnimatedStatCard icon={LogOut} label="Exits Finalized" value={checkedOutToday.length} iconColor="rose" subText="Departure Logs" />
              <AnimatedStatCard icon={Clock} label="Avg Residency" value={`${activeCheckins.length > 0 ? Math.round(activeCheckins.reduce((acc, c) => acc + getDurationHours(c.checkInTime), 0) / activeCheckins.length) : 0}h`} iconColor="amber" subText="Current Avg Hold" />
           </div>

           {/* Security Warning / Protocol */}
           <div className="alert-card border-none shadow-xl shadow-rose-900/20 rounded-2xl bg-rose-600 p-10 text-white relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 opacity-10">
                 <ShieldAlert className="h-48 w-48 text-white" />
              </div>
              <div className="relative z-10 space-y-8">
                 <div>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                       <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight">Exit Protocol</h3>
                    <p className="text-rose-100 text-[10px] font-bold mt-2 uppercase tracking-widest leading-loose">Verify all student belongings and key returns during de-authorization.</p>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border-2 border-white/5 hover:bg-white/20 transition-all cursor-pointer">
                       <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0"><ChevronRight className="w-4 h-4 text-white" /></div>
                       <span className="text-xs font-black uppercase tracking-widest">Verify Key Return</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border-2 border-white/5 hover:bg-white/20 transition-all cursor-pointer">
                       <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0"><ChevronRight className="w-4 h-4 text-white" /></div>
                       <span className="text-xs font-black uppercase tracking-widest">Inspect Asset State</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border-2 border-white/5 hover:bg-white/20 transition-all cursor-pointer">
                       <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0"><ChevronRight className="w-4 h-4 text-white" /></div>
                       <span className="text-xs font-black uppercase tracking-widest">Update Shift Log</span>
                    </div>
                 </div>

                 <Button className="w-full bg-slate-900 text-white hover:bg-black border-none font-black rounded-2xl h-14 text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-rose-950/40 transition-all hover:-translate-y-0.5">
                    Emergency Lock-down
                 </Button>
              </div>
           </div>
           
           {/* Shift Summary Metadata */}
           <div className="p-8 bg-slate-50 rounded-2xl border-2 border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-2.5 h-2.5 rounded-full bg-[#003366] animate-pulse" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Audit Context</span>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Target Hub</span>
                    <span className="text-slate-900">University Main</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Log Integrity</span>
                    <span className="text-emerald-500">VERIFIED</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
