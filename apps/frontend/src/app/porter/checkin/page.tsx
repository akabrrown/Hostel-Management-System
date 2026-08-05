'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchTodayCheckins, performCheckin } from '@/store/slices/porterSlice'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import ModernBadge from '@/components/admin/ModernBadge'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import EmptyState from '@/components/admin/EmptyState'
import { 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  LogIn, 
  User, 
  MapPin, 
  AlertCircle,
  Activity,
  History,
  ChevronRight,
  ShieldCheck,
  Zap,
  Phone,
  ArrowRight
} from 'lucide-react'
import { formatIndexNumber } from '@/lib/formatters'
import { initPageAnimations } from '@/lib/animations'
import { fetchApi } from '@/lib/apiClient';
import { LoadingPage } from '@/components/ui/loading';

interface SearchResult {
  id: string
  firstName: string
  lastName: string
  indexNumber: string
  accommodationStatus: string
  room?: {
    roomNumber: string
    hostel: string
    bedNumber: string
  }
}

export default function PorterCheckin() {
  const dispatch = useDispatch()
  const { todayCheckins, loading } = useSelector((state: RootState) => state.porter)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    dispatch(fetchTodayCheckins() as any)
    initPageAnimations(150)
  }, [dispatch])

  const handleSearch = async () => {
    if (searchTerm.length < 3) return
    
    setIsSearching(true)
    try {
      const response = await fetchApi(`/api/porter/search-student?query=${searchTerm}`)
      const data = await response.json()
      
      if (response.ok && data.data) {
        setSelectedStudent(data.data)
      } else {
        setSelectedStudent(null)
      }
    } catch (error) {
      console.error('Error searching student:', error)
      setSelectedStudent(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleCheckin = async (studentId: string) => {
    try {
      await dispatch(performCheckin(studentId) as any)
      setSelectedStudent(null)
      setSearchTerm('')
      dispatch(fetchTodayCheckins() as any)
    } catch (error) {
      console.error('Error performing check-in:', error)
    }
  }

  const filteredCheckins = todayCheckins?.filter((checkin: any) =>
    checkin.student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.student.indexNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 pb-12">
      {/* Registry Header */}
      <div className="page-header bg-white p-10 rounded-2xl shadow-sm border-2 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Check-in <span className="text-[#003366]">Registry</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Personnel Access Control</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-inner">
          <Clock className="w-5 h-5 text-[#003366]" />
          <div className="text-right">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Shift Active</div>
             <div className="text-sm font-black text-slate-700 mt-1">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Verification Search Area */}
          <div className="search-section border-2 border-slate-100 shadow-sm rounded-2xl bg-white p-10">
             <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 leading-none">Student Verification</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Initialize access for resident</p>
             </div>
             
             <div className="flex flex-col sm:flex-row items-center gap-4">
               <div className="relative flex-1 w-full group">
                  <div className="absolute inset-0 bg-[#003366]/5 rounded-2xl blur-xl group-focus-within:bg-[#003366]/10 transition-all opacity-0 group-focus-within:opacity-100" />
                  <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#003366] transition-colors" />
                     <input
                        type="text"
                        placeholder="Search Index, Room or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all placeholder:text-slate-400 placeholder:font-bold outline-none"
                     />
                  </div>
               </div>
               <Button onClick={handleSearch} disabled={isSearching} className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-[#003366] hover:bg-[#002244] shadow-xl shadow-[#003366]/20 font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {isSearching ? <Zap className="w-4 h-4 animate-pulse mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  Verify Student
               </Button>
             </div>

             {/* Dynamic Search result Mirror */}
             {selectedStudent && (
                <div className="mt-8 p-8 bg-[#003366]/5 border-2 border-[#003366]/10 rounded-[2rem] animate-in fade-in zoom-in-95 duration-500">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                         <div className="w-20 h-20 rounded-[1.5rem] bg-white shadow-sm border-2 border-slate-100 flex items-center justify-center text-[#003366] text-2xl font-black">
                            {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                         </div>
                         <div>
                            <div className="flex items-center gap-3">
                               <h3 className="text-xl font-black text-slate-900 leading-none">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                               <ModernBadge variant="success">Allocated</ModernBadge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl border border-slate-100">{formatIndexNumber(selectedStudent.indexNumber)}</div>
                               <div className="flex items-center gap-1.5 text-[10px] font-black text-[#003366] uppercase tracking-widest">
                                  <MapPin className="w-3.5 h-3.5" /> Room {selectedStudent.room?.roomNumber || 'PENDING'}
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      <Button onClick={() => handleCheckin(selectedStudent.id)} className="w-full md:w-auto h-14 px-8 rounded-2xl bg-[#B8860B] hover:bg-[#9A6F09] shadow-lg shadow-[#B8860B]/20 font-black text-[10px] uppercase tracking-widest transition-all hover:-translate-y-0.5">
                         <ShieldCheck className="w-5 h-5 mr-2" /> Initialize Check-in
                      </Button>
                   </div>
                </div>
             )}
          </div>

          {/* Today's Access Log */}
          <div className="checkin-list border-2 border-slate-100 shadow-sm rounded-2xl bg-white p-10">
             <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 leading-none">Daily Registry Feed</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Today&apos;s verified entry logs</p>
                </div>
                <Button variant="ghost" className="text-[#003366] font-black text-[10px] uppercase tracking-widest hover:bg-[#003366]/5 px-5 h-12 rounded-xl border-2 border-slate-50 hover:border-[#003366]/10 transition-all">
                   Full Audit Mirror <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
             </div>
             
             {loading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <LoadingPage />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refreshing Registry...</p>
                </div>
             ) : filteredCheckins.length > 0 ? (
                <div className="space-y-4">
                   {filteredCheckins.map((checkin: any) => (
                      <div key={checkin.id} className="group p-6 bg-white border-2 border-slate-100 hover:border-[#003366]/30 rounded-[2rem] hover:shadow-lg hover:shadow-[#003366]/5 transition-all duration-300">
                         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                               <div className="w-14 h-14 bg-emerald-50 border-2 border-emerald-100 rounded-[1.25rem] flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                  <LogIn className="w-6 h-6" />
                               </div>
                               <div>
                                  <h3 className="font-black text-lg text-slate-900 group-hover:text-[#003366] transition-colors">
                                     {checkin.student.firstName} {checkin.student.lastName}
                                  </h3>
                                  <div className="flex items-center gap-3 mt-1">
                                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{formatIndexNumber(checkin.student.indexNumber)}</span>
                                     <span className="text-[10px] font-black text-[#003366] uppercase tracking-widest">UNIT {checkin.room?.roomNumber || 'NONE'}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                               <div className="text-right">
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Entry</div>
                                  <div className="text-xs font-black text-slate-700 mt-1">{new Date(checkin.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                               </div>
                               <ModernBadge variant="success">Verified</ModernBadge>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="py-24 px-8">
                   <EmptyState
                      icon={History}
                      title="Registry Empty"
                      description="No check-in events have been recorded in the current shift cycle."
                      actionLabel="Refresh Feed"
                      onAction={() => dispatch(fetchTodayCheckins() as any)}
                   />
                </div>
             )}
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-8">
           {/* Shift Intelligence Stats */}
           <div className="space-y-4">
              <AnimatedStatCard icon={Activity} label="Shift Volume" value={todayCheckins?.length || 0} iconColor="blue" subText="Check-ins Today" />
              <AnimatedStatCard icon={ShieldCheck} label="Secured Area" value={todayCheckins?.filter((c: any) => c.status === 'active').length || 0} iconColor="emerald" subText="Residents On-site" />
              <AnimatedStatCard icon={History} label="Audit Log" value={todayCheckins?.filter((c: any) => c.status === 'checked_out').length || 0} iconColor="amber" subText="Exits Processed" />
           </div>

           {/* Security Manual Quick-access */}
           <div className="security-card border-none shadow-xl shadow-[#003366]/10 rounded-2xl bg-[#003366] p-10 text-white relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 opacity-10">
                 <ShieldCheck className="h-48 w-48 text-white" />
              </div>
              <div className="relative z-10 space-y-8">
                 <div>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                       <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight">Registry Integrity</h3>
                    <p className="text-white/70 text-[10px] font-bold mt-2 uppercase tracking-widest leading-loose">Personnel access guidelines and security verification protocols.</p>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border-2 border-white/5 hover:bg-white/20 transition-all cursor-pointer">
                       <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[10px] font-black">01</div>
                       <span className="text-xs font-black uppercase tracking-tight">Verify Physical ID</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border-2 border-white/5 hover:bg-white/20 transition-all cursor-pointer">
                       <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[10px] font-black">02</div>
                       <span className="text-xs font-black uppercase tracking-tight">Sync Digital Mirror</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border-2 border-white/5 hover:bg-white/20 transition-all cursor-pointer">
                       <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[10px] font-black">03</div>
                       <span className="text-xs font-black uppercase tracking-tight">Sanitize Key Bundle</span>
                    </div>
                 </div>

                 <Button className="w-full bg-[#B8860B] text-white hover:bg-[#9A6F09] border-none font-black rounded-2xl h-14 text-[10px] uppercase tracking-widest shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5">
                    Open Protocol Manual
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
