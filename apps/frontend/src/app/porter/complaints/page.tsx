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
  MessageSquareWarning, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User,
  MapPin,
  Filter
} from "lucide-react"
import { initPageAnimations } from "@/lib/animations"
import toast from "react-hot-toast"

export default function PorterComplaintsPage() {
  const router = useRouter()
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'Pending' | 'In Progress' | 'Resolved' | 'Rejected'>('all')

  useEffect(() => {
    if (profileFetched && !user) {
      router.replace('/login')
    } else if (user && user.role !== 'porter') {
      router.replace(`/${user.role}/dashboard`)
    }
  }, [user, profileFetched, router])

  useEffect(() => {
    if (user && user.role === 'porter') {
      fetchComplaints()
      initPageAnimations(150)
    }
  }, [user])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const res = await fetchApi('/api/porter/complaints')
      const json = await res.json()
      if (res.ok) {
        setComplaints(json.data || [])
      }
    } catch (error) {
      toast.error("Failed to fetch complaints")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetchApi(`/api/porter/complaints/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success(`Complaint marked as ${newStatus}`)
        fetchComplaints()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to update status')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  if (!profileFetched || loading) return <LoadingPage />

  const filteredComplaints = complaints.filter(c => activeFilter === 'all' ? true : c.status === activeFilter)

  const getPriorityVariant = (priority: string): 'danger' | 'warning' | 'success' | 'neutral' => {
    switch(priority) {
      case 'Critical': return 'danger'
      case 'High': return 'warning'
      case 'Medium': return 'warning'
      case 'Low': return 'success'
      default: return 'neutral'
    }
  }

  const getStatusVariant = (status: string): 'warning' | 'info' | 'success' | 'danger' | 'neutral' => {
    switch (status) {
      case 'Pending': return 'warning'
      case 'In Progress': return 'info'
      case 'Resolved': return 'success'
      case 'Rejected': return 'danger'
      default: return 'neutral'
    }
  }

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
            <MessageSquareWarning className="w-8 h-8 text-[#003366]" />
            Hostel Complaints
          </h1>
          <p className="text-slate-500 font-medium">Manage and resolve student complaints in your assigned hostel.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-2 items-center shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 mr-2" />
        <span className="text-sm font-bold text-slate-700 mr-2 uppercase tracking-wider">Status:</span>
        {['all', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeFilter === filter 
                ? 'bg-[#003366] text-white shadow-md' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredComplaints.length === 0 ? (
          <div className="col-span-full">
             <EmptyState 
                icon={CheckCircle}
                title="No Complaints Found"
                description={`There are no ${activeFilter !== 'all' ? activeFilter.toLowerCase() : ''} complaints in your hostel.`}
              />
          </div>
        ) : (
          filteredComplaints.map(complaint => (
            <Card key={complaint.id} className="p-6 hover:shadow-lg transition-all border-slate-100 animate-slide-up">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ModernBadge variant={getStatusVariant(complaint.status)}>
                      {complaint.status}
                    </ModernBadge>
                    <ModernBadge variant={getPriorityVariant(complaint.priority)}>
                      {complaint.priority} Priority
                    </ModernBadge>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{complaint.title}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{complaint.category}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                {complaint.description}
              </p>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{(complaint.users?.students?.[0]?.full_name || complaint.users?.students?.full_name) || 'Unknown Student'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Room {complaint.rooms?.room_number || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {complaint.status === 'Pending' && (
                    <Button size="sm" onClick={() => updateStatus(complaint.id, 'In Progress')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                      Start Work
                    </Button>
                  )}
                  {complaint.status === 'In Progress' && (
                    <Button size="sm" onClick={() => updateStatus(complaint.id, 'Resolved')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                      Mark Resolved
                    </Button>
                  )}
                  {complaint.status === 'Pending' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(complaint.id, 'Rejected')} className="text-rose-600 hover:bg-rose-50 rounded-xl">
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
