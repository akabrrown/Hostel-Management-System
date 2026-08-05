"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { fetchApi } from "@/lib/apiClient"
import { RootState } from "@/store"
import ModernBadge from "@/components/admin/ModernBadge"
import { LoadingPage } from '@/components/ui/loading'
import Card from "@/components/ui/card"
import Button from "@/components/ui/button"
import EmptyState from "@/components/admin/EmptyState"
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  User,
  MapPin,
  ChevronRight,
  Filter
} from "lucide-react"
import { initPageAnimations } from "@/lib/animations"
import toast from "react-hot-toast"

export default function PorterMaintenancePage() {
  const router = useRouter()
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all')

  useEffect(() => {
    if (profileFetched && !user) {
      router.replace('/login')
    } else if (user && user.role !== 'porter') {
      router.replace(`/${user.role}/dashboard`)
    }
  }, [user, profileFetched, router])

  useEffect(() => {
    if (user && user.role === 'porter') {
      fetchReports()
      initPageAnimations(150)
    }
  }, [user])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await fetchApi('/api/porter/maintenance')
      const json = await res.json()
      if (res.ok) {
        setReports(json.data || [])
      }
    } catch (error) {
      toast.error("Failed to fetch maintenance reports")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetchApi(`/api/porter/maintenance/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success(`Request marked as ${newStatus.replace('_', ' ')}`)
        fetchReports()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'warning'
      case 'in_progress': return 'info'
      case 'resolved': return 'success'
      case 'closed': return 'neutral'
      default: return 'neutral'
    }
  }

  const getPriorityColor = (priority: string) => {
    return priority === 'high' || priority === 'urgent' ? 'text-rose-600 bg-rose-50' : 
           priority === 'medium' ? 'text-amber-600 bg-amber-50' : 
           'text-emerald-600 bg-emerald-50'
  }

  const filteredReports = activeFilter === 'all' 
    ? reports 
    : reports.filter(r => r.status === activeFilter)

  if (!profileFetched || loading) {
    return <LoadingPage />
  }

  if (!user || user.role !== 'porter') return null

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="page-header bg-white p-10 rounded-2xl shadow-sm border-2 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Facilities <span className="text-[#B8860B]">Maintenance</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incident Tracking &amp; Resolution</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border-2 border-slate-100 shadow-inner overflow-x-auto custom-scrollbar gap-1">
          {(['all', 'open', 'in_progress', 'resolved'] as const).map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
                activeFilter === filter 
                  ? 'bg-[#003366] text-white shadow-lg shadow-[#003366]/20' 
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {filter.replace('_', ' ')} ({filter === 'all' ? reports.length : reports.filter(r => r.status === filter).length})
            </button>
          ))}
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="py-20 px-8 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
          <Wrench className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <p className="text-lg font-black text-slate-300 tracking-tight mb-2">No Incidents Reported</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
            {activeFilter === 'all' ? 'The facilities log is clear.' : `No ${activeFilter.replace('_', ' ')} reports at this time.`}
          </p>
          <button onClick={fetchReports} className="h-12 px-8 bg-slate-900 hover:bg-[#003366] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:-translate-y-0.5">
            Refresh Log
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredReports.map(report => (
            <div key={report.id} className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-[#B8860B]/5 hover:border-[#B8860B]/20 transition-all duration-300 group">
               {/* Priority Accent Strip */}
               <div className={`h-1.5 w-full ${
                 report.priority === 'high' || report.priority === 'urgent' ? 'bg-rose-500' :
                 report.priority === 'medium' ? 'bg-[#B8860B]' : 'bg-emerald-500'
               }`} />

               <div className="p-10">
                 <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                       <div className={`w-14 h-14 rounded-[1.25rem] border-2 flex items-center justify-center shrink-0 ${
                          report.status === 'open' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                          report.status === 'in_progress' ? 'bg-[#003366]/5 border-[#003366]/10 text-[#003366]' : 'bg-emerald-50 border-emerald-100 text-emerald-500'
                       }`}>
                          {report.status === 'open' ? <AlertTriangle className="w-6 h-6" /> : 
                           report.status === 'in_progress' ? <Activity className="w-6 h-6" /> : 
                           <CheckCircle className="w-6 h-6" />}
                       </div>
                       <div>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                             <ModernBadge variant={getStatusVariant(report.status)}>{String(report.status).replace('_', ' ')}</ModernBadge>
                             <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl border ${getPriorityColor(report.priority)}`}>
                                {report.priority} Priority
                             </span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 capitalize leading-tight group-hover:text-[#003366] transition-colors">{report.category}</h3>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6 mb-8">
                    <p className="text-sm font-bold text-slate-600 leading-relaxed bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl">
                       &quot;{report.description}&quot;
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4">
                       <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 px-3 py-2 rounded-xl">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Room {report.room?.room_number || 'Unknown'}</span>
                       </div>
                       <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 px-3 py-2 rounded-xl">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{report.reporter?.email || 'Unknown'}</span>
                       </div>
                       <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 px-3 py-2 rounded-xl">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{new Date(report.created_at).toLocaleDateString()}</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-wrap items-center gap-3 border-t-2 border-slate-100 pt-8">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Update:</span>
                    {report.status !== 'open' && (
                       <Button 
                         variant="outline" 
                         onClick={() => updateStatus(report.id, 'open')}
                         className="border-2 border-amber-100 bg-amber-50 text-[#B8860B] hover:bg-amber-100 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                       >
                          Mark Open
                       </Button>
                    )}
                    {report.status !== 'in_progress' && (
                       <Button 
                         variant="outline"
                         onClick={() => updateStatus(report.id, 'in_progress')}
                         className="border-2 border-[#003366]/10 bg-[#003366]/5 text-[#003366] hover:bg-[#003366]/10 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                       >
                          In Progress
                       </Button>
                    )}
                    {report.status !== 'resolved' && (
                       <Button 
                         onClick={() => updateStatus(report.id, 'resolved')}
                         className="bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:-translate-y-0.5"
                       >
                          Resolve Issue
                       </Button>
                    )}
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
