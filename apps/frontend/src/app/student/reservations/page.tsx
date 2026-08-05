'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import apiClient from '@/lib/api'
import Button from '@/components/ui/button'
import { Calendar, Building, Users, CreditCard, Eye, Search, Filter, History, Clock, CheckCircle2, XCircle } from 'lucide-react'
import gsap from 'gsap'
import { LoadingPage } from '@/components/ui/loading'

interface Reservation {
  id: string
  type: 'reservation' | 'booking'
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed'
  createdAt: string
  academicYear: string
  semester: string
  details: {
    hostel?: string
    floor?: number
    room?: string
    roomType?: string
    price?: number
  }
  allocation?: {
    hostel: string
    roomNumber: string
    bedNumber: string
    allocatedAt: string
  }
}

export default function ReservationsHistory() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await apiClient.get<Reservation[]>('/student/reservations')
        setReservations(response || [])
      } catch (error) {
        console.error('Failed to load reservations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (profileFetched && (!user || user.role !== 'student')) {
      setIsLoading(false)
      router.push('/login')
      return
    }

    fetchReservations()
  }, [user, router, profileFetched])

  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.page-header',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        )
        gsap.fromTo('.stats-card',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.2, ease: 'power3.out' }
        )
        gsap.fromTo('.reservation-card',
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.4, ease: 'power3.out' }
        )
      })
      return () => ctx.revert()
    }
  }, [isLoading])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 }
      case 'pending':
        return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock }
      case 'rejected':
        return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: XCircle }
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', icon: History }
    }
  }

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.details.hostel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.details.room?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.academicYear.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = statusFilter === 'all' || reservation.status === statusFilter
    
    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border-2 border-slate-100 page-header">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-[#003366]/10 rounded-xl">
               <History className="w-6 h-6 text-[#003366]" />
             </div>
             <span className="text-[#003366] font-black uppercase tracking-widest text-[10px]">History</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Reservations <span className="text-[#003366]">History</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-2xl">
            Track your room booking application status and history.
          </p>

           {/* Stats Overview */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            <div className="stats-card bg-[#003366] p-6 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl -mr-8 -mt-8"></div>
              <div className="text-3xl font-black text-white mb-2 relative z-10">{reservations.length}</div>
              <div className="text-[10px] font-black text-white/60 uppercase tracking-widest relative z-10">Total</div>
            </div>
            <div className="stats-card bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
              <div className="text-3xl font-black text-emerald-700 tracking-tight mb-2">
                {reservations.filter(r => r.status === 'active' || r.status === 'approved').length}
              </div>
              <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Approved</div>
            </div>
            <div className="stats-card bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm">
              <div className="text-3xl font-black text-amber-700 tracking-tight mb-2">
                {reservations.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pending</div>
            </div>
            <div className="stats-card bg-rose-50 p-6 rounded-3xl border border-rose-100 shadow-sm">
              <div className="text-3xl font-black text-rose-700 tracking-tight mb-2">
                {reservations.filter(r => r.status === 'rejected').length}
              </div>
              <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Rejected</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filters */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-slate-100 mb-8 flex flex-col md:flex-row gap-4 page-header relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm font-medium text-slate-900"
            />
          </div>
          <div className="md:w-64 relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-slate-100 shadow-sm reservation-card">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <History className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No History Found</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? "We couldn't find any records matching your search filters." 
                  : "You haven't made any room reservations yet. Start by making a reservation request."}
              </p>
              <Button onClick={() => router.push('/student/room-reservation')} className="bg-[#003366] text-white hover:bg-[#1A5F9E] text-[10px] font-black uppercase tracking-widest py-6 px-8 rounded-2xl shadow-lg shadow-[#003366]/20 transition-all hover:-translate-y-0.5">
                Make a Reservation
              </Button>
            </div>
          ) : (
            filteredReservations.map((reservation) => {
              const statusConfig = getStatusConfig(reservation.status)
              const StatusIcon = statusConfig.icon
              
              return (
                <div key={reservation.id} className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md transition-all duration-300 reservation-card group">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-6">
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${statusConfig.bg} ${statusConfig.color} border-2 ${statusConfig.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {reservation.status}
                        </span>
                        <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-slate-50 text-slate-600 border-2 border-slate-100 uppercase tracking-widest">
                          {reservation.type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(reservation.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 mb-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-[#003366]/5 transition-colors">
                             <Building className="w-5 h-5 text-slate-400 group-hover:text-[#003366] transition-colors" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hostel</p>
                            <p className="text-sm font-black text-slate-900 tracking-tight">{reservation.details.hostel || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-[#003366]/5 transition-colors">
                             <Users className="w-5 h-5 text-slate-400 group-hover:text-[#003366] transition-colors" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Room Type</p>
                            <p className="text-sm font-black text-slate-900 tracking-tight">{reservation.details.roomType || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-[#003366]/5 transition-colors">
                             <CreditCard className="w-5 h-5 text-slate-400 group-hover:text-[#003366] transition-colors" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</p>
                            <p className="text-sm font-black text-[#B8860B] tracking-tight">
                               {reservation.details.price ? `GHS ${reservation.details.price}` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
                        <span><span className="font-black text-slate-900">Year:</span> {reservation.academicYear}</span>
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                        <span><span className="font-black text-slate-900">Sem:</span> {reservation.semester}</span>
                        
                        {(reservation.details.room || reservation.details.floor) && (
                          <>
                            <span className="hidden sm:inline w-1.5 h-1.5 bg-slate-300 rounded-full" />
                            {reservation.details.floor && <span><span className="font-black text-slate-900">Floor:</span> {reservation.details.floor}</span>}
                            {reservation.details.room && <span className="ml-2"><span className="font-black text-slate-900">Room:</span> {reservation.details.room}</span>}
                          </>
                        )}
                      </div>

                      {reservation.allocation && (
                        <div className="mt-6 bg-emerald-50 border-2 border-emerald-100 rounded-[1.5rem] p-6 flex items-start gap-4">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-black text-emerald-800 tracking-tight mb-2">Allocation Confirmed</p>
                            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                              Assigned to <span className="font-black">{reservation.allocation.hostel}</span>, Room <span className="font-black">{reservation.allocation.roomNumber}</span> (<span className="font-black">{reservation.allocation.bedNumber}</span>)
                            </div>
                            <div className="text-[10px] font-bold text-emerald-600 mt-2 opacity-80 uppercase tracking-widest">
                               Confirmed on {new Date(reservation.allocation.allocatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center">
                      <Button variant="outline" size="sm" className="w-full md:w-auto hover:bg-slate-50 py-5 px-6 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
