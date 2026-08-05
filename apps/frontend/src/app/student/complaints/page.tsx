'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { MessageSquareWarning, Plus, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react'
import Button from '@/components/ui/button'
import { fetchApi } from '@/lib/apiClient'
import toast from 'react-hot-toast'
import gsap from 'gsap'

interface Complaint {
  id: string
  title: string
  description: string
  category: string
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  created_at: string
}

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Maintenance',
    priority: 'Medium'
  })
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'student')) {
      router.push('/login')
      return
    }
    
    if (profileFetched && user) {
      fetchComplaints()
    }
  }, [user, profileFetched, router])

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const res = await fetchApi('/api/student/complaints')
      if (res.ok) {
        const data = await res.json()
        setComplaints(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch complaints', error)
      toast.error('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.complaint-item',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
        )
      })
      return () => ctx.revert()
    }
  }, [loading, complaints])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.accommodation?.room?.id || !user?.accommodation?.hostel?.id) {
        toast.error('You must be assigned to a room to submit a complaint.')
        return
    }

    try {
      const res = await fetchApi('/api/student/complaints', {
        method: 'POST',
        body: JSON.stringify({
            ...form,
            room_id: user.accommodation.room.id,
            hostel_id: user.accommodation.hostel.id
        })
      })

      if (res.ok) {
        toast.success('Complaint submitted successfully')
        setShowForm(false)
        setForm({ title: '', description: '', category: 'Maintenance', priority: 'Medium' })
        fetchComplaints()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to submit complaint')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'High':
      case 'Critical': return <AlertTriangle className="w-4 h-4 text-rose-500" />
      case 'Medium': return <Clock className="w-4 h-4 text-amber-500" />
      default: return <CheckCircle className="w-4 h-4 text-emerald-500" />
    }
  }

  if (!profileFetched || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003366]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-r from-[#003366] to-[#004080] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
              <MessageSquareWarning className="w-6 h-6 text-yellow-400" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Complaints Hub</h1>
          </div>
          <p className="text-blue-100/80 max-w-md leading-relaxed text-sm">
            Report issues related to maintenance, noise, or security. We are here to ensure your stay is comfortable and safe.
          </p>
        </div>
        <div className="relative z-10 flex gap-3">
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-500 hover:bg-yellow-400 text-[#003366] border-none shadow-lg shadow-yellow-500/20 font-bold px-6 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {showForm ? 'Cancel Report' : <><Plus className="w-5 h-5" /> File a Complaint</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        {showForm && (
          <div className="lg:col-span-12">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#003366]" /> Submit New Report
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Category</label>
                    <select 
                      className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#003366] focus:ring-4 focus:ring-[#003366]/10 transition-all bg-slate-50 hover:bg-white"
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                    >
                      <option>Maintenance</option>
                      <option>Noise</option>
                      <option>Security</option>
                      <option>Cleanliness</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Priority Level</label>
                    <select 
                      className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#003366] focus:ring-4 focus:ring-[#003366]/10 transition-all bg-slate-50 hover:bg-white"
                      value={form.priority}
                      onChange={e => setForm({...form, priority: e.target.value})}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Title</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#003366] focus:ring-4 focus:ring-[#003366]/10 transition-all bg-slate-50 hover:bg-white"
                    placeholder="E.g., Leaking pipe in the bathroom"
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <textarea 
                    required 
                    rows={4} 
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#003366] focus:ring-4 focus:ring-[#003366]/10 transition-all bg-slate-50 hover:bg-white resize-none"
                    placeholder="Provide detailed information about the issue..."
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <Button type="button" variant="outline" className="rounded-xl px-6" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#003366] hover:bg-[#002244] text-white rounded-xl px-8 shadow-md">
                    Submit Report
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Complaints List */}
        <div className="lg:col-span-12 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-slate-900">Your Reports</h2>
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{complaints.length} Total</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">All Good!</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">
                  You haven't filed any complaints yet. Everything seems to be running smoothly.
                </p>
              </div>
            ) : (
              complaints.map((complaint) => (
                <div key={complaint.id} className="complaint-item group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          {getPriorityIcon(complaint.priority)} {complaint.priority}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {new Date(complaint.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2 leading-tight group-hover:text-[#003366] transition-colors">{complaint.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{complaint.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
