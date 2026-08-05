'use client'

import { useState, useEffect } from 'react'
import { fetchApi } from '@/lib/apiClient'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import { LoadingPage } from '@/components/ui/loading'
import { initPageAnimations } from '@/lib/animations'
import toast from 'react-hot-toast'
import {
  FileText, Search, Clock, CheckCircle, XCircle,
  Calendar, ChevronRight, Filter, MoreVertical, Timer
} from 'lucide-react'

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRes, setSelectedRes] = useState<any | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchReservations()
    initPageAnimations(150)
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const res = await fetchApi('/api/admin/reservations')
      if (res.ok) {
        const result = await res.json()
        setReservations(result.data || [])
      }
    } catch (e) {
      toast.error('Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setActionLoading(true)
      const res = await fetchApi(`/api/admin/reservations/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        toast.success(`Reservation ${status.replace('_', ' ')}`)
        fetchReservations()
        setSelectedRes(null)
      }
    } catch (e) {
      toast.error('Failed to update')
    } finally {
      setActionLoading(false)
    }
  }

  const handleExtend = async (id: string) => {
    try {
      setActionLoading(true)
      const res = await fetchApi(`/api/admin/reservations/${id}/extend`, {
        method: 'POST',
        body: JSON.stringify({ daysToAdd: 3 })
      })
      if (res.ok) {
        toast.success('Extended by 3 days')
        fetchReservations()
      }
    } catch (e) {
      toast.error('Failed to extend')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'reserved': case 'converted_to_booking': return 'success'
      case 'pending': case 'awaiting_payment': return 'warning'
      case 'expired': case 'cancelled': return 'danger'
      default: return 'neutral'
    }
  }

  const filtered = reservations.filter(r => {
    const matchesSearch = search === '' || 
      r.students?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.students?.user?.index_number?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const countByStatus = (s: string) => reservations.filter(r => r.status === s).length

  if (loading) return <LoadingPage />

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="page-header bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#003366] tracking-tight">Reservation <span className="text-[#B8860B]">Queue</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pre-booking holds awaiting payment or action</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedStatCard icon={FileText} label="Total Reservations" value={reservations.length} iconColor="blue" />
        <AnimatedStatCard icon={Clock} label="Pending" value={countByStatus('pending')} iconColor="yellow" />
        <AnimatedStatCard icon={Timer} label="Awaiting Payment" value={countByStatus('awaiting_payment')} iconColor="orange" />
        <AnimatedStatCard icon={CheckCircle} label="Converted" value={countByStatus('converted_to_booking')} iconColor="green" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* List */}
        <div className="xl:col-span-2">
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden p-0">
            <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative group w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#003366] transition-colors" />
                <input
                  placeholder="Search by student name or index..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#003366]/20 transition-all placeholder:text-slate-400"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-[#003366]/20"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reserved">Reserved</option>
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="converted_to_booking">Converted</option>
              </select>
            </div>

            <div className="divide-y divide-slate-50">
              {filtered.length > 0 ? (
                filtered.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRes(r)}
                    className={`flex items-center justify-between p-6 cursor-pointer transition-all hover:bg-slate-50/50 ${
                      selectedRes?.id === r.id ? 'bg-[#E8F1F8]/30 border-l-4 border-[#003366]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                        {r.students?.full_name?.[0] || 'S'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {r.students?.full_name || 'Unknown Student'}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {r.students?.user?.index_number} • {r.rooms?.room_number}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <ModernBadge variant={getStatusVariant(r.status)}>
                        {r.status?.replace('_', ' ')}
                      </ModernBadge>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20">
                  <EmptyState icon={FileText} title="No Reservations" description="No reservation records match the current filters." />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Inspector */}
        <div>
          {selectedRes ? (
            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden p-0 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="p-8 bg-gradient-to-br from-slate-50 to-white border-b border-slate-50">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl border border-blue-200 mb-6">
                  {selectedRes.students?.full_name?.[0] || 'S'}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {selectedRes.students?.full_name || 'Unknown Student'}
                  </h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {selectedRes.students?.user?.index_number}
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                  <ModernBadge variant={getStatusVariant(selectedRes.status)}>
                    {selectedRes.status?.replace('_', ' ')}
                  </ModernBadge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Index</span>
                  <span className="text-sm font-black text-slate-700">{selectedRes.students?.user?.index_number}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Room</span>
                  <span className="text-xs font-black text-slate-700">{selectedRes.rooms?.room_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created</span>
                  <span className="text-xs font-black text-slate-700">
                    {selectedRes.created_at ? new Date(selectedRes.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-6 space-y-3">
                  {selectedRes.status === 'pending' && (
                    <Button
                      onClick={() => handleStatusChange(selectedRes.id, 'reserved')}
                      disabled={actionLoading}
                      className="w-full bg-[#10B981] hover:bg-emerald-600 text-white rounded-2xl h-12 font-black text-xs uppercase tracking-widest"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve Reservation
                    </Button>
                  )}
                  {(selectedRes.status === 'pending' || selectedRes.status === 'awaiting_payment') && (
                    <Button
                      onClick={() => handleExtend(selectedRes.id)}
                      disabled={actionLoading}
                      className="w-full bg-[#F59E0B] hover:bg-amber-600 text-white rounded-2xl h-12 font-black text-xs uppercase tracking-widest"
                    >
                      <Timer className="w-4 h-4 mr-2" /> Extend Deadline (+3 days)
                    </Button>
                  )}
                  {selectedRes.status !== 'cancelled' && selectedRes.status !== 'converted_to_booking' && (
                    <Button
                      onClick={() => handleStatusChange(selectedRes.id, 'cancelled')}
                      disabled={actionLoading}
                      className="w-full bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-2xl h-12 font-black text-xs uppercase tracking-widest"
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Cancel Reservation
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-none shadow-sm rounded-2xl bg-[#003366] overflow-hidden p-8 text-white min-h-[400px] flex flex-col justify-center text-center relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <FileText className="h-48 w-48" />
              </div>
              <div className="relative z-10 space-y-4 max-w-xs mx-auto">
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-blue-200" />
                </div>
                <h3 className="text-2xl font-black">Details Panel</h3>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest leading-loose">
                  Select a reservation from the list to view details and take action.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
