'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { Search, Plus, Edit, Trash2, Eye, Calendar, User, Send, X, CheckCircle, AlertCircle, Info, Clock, Volume2, Target, Filter } from 'lucide-react'
import { initPageAnimations } from '@/lib/animations'
import { fetchApi } from '@/lib/apiClient';
import { LoadingPage } from '@/components/ui/loading';

export default function PorterAnnouncements() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [hostels, setHostels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    targetAudience: 'all',
    scheduledDate: '',
    scheduledTime: ''
  })

  useEffect(() => {
    loadAnnouncements()
    loadHostels()
  }, [])

  useEffect(() => {
    if (!loading) {
      initPageAnimations(150)
    }
  }, [loading])

  const loadHostels = async () => {
    try {
      const response = await fetchApi('/api/hostels')
      const result = await response.json()
      if (response.ok) {
        setHostels(result.hostels || [])
      }
    } catch (error) {
      console.error('Error loading hostels:', error)
    }
  }

  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      const response = await fetchApi('/api/announcements')
      const result = await response.json()
      if (response.ok) {
        setAnnouncements(result.data || [])
      }
    } catch (error) {
      console.error('Error loading announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'general', name: 'General' },
    { id: 'academic', name: 'Academic' },
    { id: 'payment', name: 'Payment' },
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'urgent', name: 'Urgent' },
    { id: 'emergency', name: 'Emergency' }
  ]

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'draft', name: 'Draft' },
    { id: 'published', name: 'Published' },
    { id: 'scheduled', name: 'Scheduled' },
    { id: 'archived', name: 'Archived' }
  ]

  const targetAudiences = [
    { id: 'all', name: 'All Users' },
    { id: 'students', name: 'Students Only' },
    { id: 'staff', name: 'Staff Only' },
    { id: 'admin', name: 'Admin Only' },
    { id: 'porter', name: 'Porters Only' },
    { id: 'director', name: 'Directors Only' },
    ...hostels.map(h => ({ id: h.id, name: `${h.name} Residents` }))
  ]

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || announcement.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || announcement.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Badge Logic
  const getPriorityVariant = (priority: string): 'danger' | 'warning' | 'info' | 'neutral' => {
    switch (priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'neutral'
    }
  }

  const getStatusVariant = (status: string): 'success' | 'warning' | 'info' | 'neutral' => {
    switch (status) {
      case 'published': return 'success'
      case 'draft': return 'neutral'
      case 'scheduled': return 'info'
      case 'archived': return 'warning'
      default: return 'neutral'
    }
  }

  const handleCreateAnnouncement = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const payload = {
        ...formData,
        scheduledFor: formData.scheduledDate && formData.scheduledTime 
          ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
          : null
      }
      
      const response = await fetchApi('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        setShowCreateModal(false)
        resetForm()
        loadAnnouncements()
      }
    } catch (error) {
      console.error('Error creating announcement:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateAnnouncement = async () => {
    if (!selectedAnnouncement || isSubmitting) return
    setIsSubmitting(true)
    try {
      const payload = {
        ...formData,
        scheduledFor: formData.scheduledDate && formData.scheduledTime 
          ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
          : null
      }
      
      const response = await fetchApi(`/api/announcements/${selectedAnnouncement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        setShowCreateModal(false)
        setSelectedAnnouncement(null)
        resetForm()
        loadAnnouncements()
      }
    } catch (error) {
      console.error('Error updating announcement:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Permanently delete this announcement?')) return
    try {
      const response = await fetchApi(`/api/announcements/${id}`, { method: 'DELETE' })
      if (response.ok) loadAnnouncements()
    } catch (error) {
      console.error('Error deleting announcement:', error)
    }
  }

  const handlePublishAnnouncement = async (id: string) => {
    try {
      const response = await fetchApi(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published', published_at: new Date().toISOString() })
      })
      if (response.ok) loadAnnouncements()
    } catch (error) {
      console.error('Error publishing announcement:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
      targetAudience: 'all',
      scheduledDate: '',
      scheduledTime: ''
    })
  }

  const handleEditClick = (announcement: any) => {
    setSelectedAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      priority: announcement.priority,
      targetAudience: announcement.target_audience,
      scheduledDate: announcement.scheduled_for ? announcement.scheduled_for.split('T')[0] : '',
      scheduledTime: announcement.scheduled_for ? announcement.scheduled_for.split('T')[1].substring(0, 5) : ''
    })
    setShowCreateModal(true)
  }

  if (loading) {
    return (
      <LoadingPage />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="p-6">
        {/* Page Header */}
        <div className="page-header mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Broadcast Center</h1>
            <p className="text-gray-600 mt-1">Manage public notices and community alerts</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="shadow-lg shadow-blue-600/20">
            <Plus className="w-4 h-4 mr-2" />
            Create Broadcast
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="stats-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <AnimatedStatCard icon={Volume2} label="Total Posts" value={announcements.length} iconColor="blue" />
           <AnimatedStatCard icon={CheckCircle} label="Live Now" value={announcements.filter(a => a.status === 'published').length} iconColor="green" />
           <AnimatedStatCard icon={Clock} label="Scheduled" value={announcements.filter(a => a.status === 'scheduled').length} iconColor="purple" />
           <AnimatedStatCard icon={Edit} label="Drafts" value={announcements.filter(a => a.status === 'draft').length} iconColor="yellow" />
        </div>

        {/* Filter Bar */}
        <div className="content-section mb-8">
           <Card className="p-4 border-none shadow-sm bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search broadcasts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 w-64"
                      />
                    </div>
                    
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="h-10 px-4 border border-gray-100 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-blue-100 outline-none">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="h-10 px-4 border border-gray-100 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500/10 outline-none">
                      {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">
                    {filteredAnnouncements.length} results
                 </div>
              </div>
           </Card>
        </div>

        {/* Announcements List */}
        <div className="announcements-list space-y-4">
           {filteredAnnouncements.length > 0 ? (
             filteredAnnouncements.map((ann, idx) => (
               <Card key={ann.id} className="p-0 border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                  <div className="flex flex-col md:flex-row">
                     <div className={`w-2 h-auto ${ann.priority === 'high' ? 'bg-red-500' : ann.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                     <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                           <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                 <ModernBadge variant={getStatusVariant(ann.status)}>{ann.status}</ModernBadge>
                                 <ModernBadge variant={getPriorityVariant(ann.priority)}>{ann.priority} Priority</ModernBadge>
                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{ann.category}</span>
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">{ann.title}</h3>
                           </div>
                           <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <Button size="sm" variant="outline" onClick={() => { setSelectedAnnouncement(ann); setShowViewModal(true); }} className="h-8 w-8 p-0 rounded-full border-gray-100"><Eye className="w-4 h-4" /></Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditClick(ann)} className="h-8 w-8 p-0 rounded-full border-gray-100"><Edit className="w-4 h-4" /></Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteAnnouncement(ann.id)} className="h-8 w-8 p-0 rounded-full border-gray-100 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                           </div>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-6 font-medium leading-relaxed">{ann.content}</p>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50">
                           <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                 <User className="w-3.5 h-3.5 text-gray-400" />
                                 <span className="font-semibold">{ann.creator ? `${ann.creator.first_name} ${ann.creator.last_name}` : 'Admin'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                 <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                 <span className="font-semibold">{new Date(ann.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                 <Target className="w-3 h-3" />
                                 <span className="font-bold uppercase tracking-tighter">To: {ann.target_audience || 'Everybody'}</span>
                              </div>
                           </div>
                           
                           {ann.status === 'draft' && (
                             <Button size="sm" onClick={() => handlePublishAnnouncement(ann.id)} className="h-8 px-4 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20">
                                <Send className="w-3 h-3 mr-2" /> Publish Now
                             </Button>
                           )}
                        </div>
                     </div>
                  </div>
               </Card>
             ))
           ) : (
             <EmptyState
                icon={Volume2}
                title="Silence is golden"
                description="No broadcasts match your current filters. Maybe create a new one?"
                actionLabel="Create First Notice"
                onAction={() => setShowCreateModal(true)}
             />
           )}
        </div>
      </main>

      {/* Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] overflow-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
           <div className="absolute inset-0 bg-transparent" onClick={() => { setShowCreateModal(false); resetForm(); }} />
           <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#003366] to-[#003366]/80" />
              <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 pt-6 overflow-y-auto">
                 <div className="flex justify-between items-start">
                    <div>
                       <h2 className="text-2xl font-bold text-gray-900">{selectedAnnouncement ? 'Refine Broadcast' : 'Draft New Notice'}</h2>
                       <p className="text-sm text-gray-500 mt-1">Fill in the details to reach your audience effectively</p>
                    </div>
                    <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notice Title</label>
                       <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="E.g. Resumption of Hostels" className="font-bold h-12" />
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Message Content</label>
                       <textarea value={formData.content} onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} rows={5} className="w-full px-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 text-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none" placeholder="Write your announcement here..." />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                          <select value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-4 h-11 border border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all">
                             {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Priority Peak</label>
                          <select value={formData.priority} onChange={(e) => setFormData(p => ({ ...p, priority: e.target.value }))} className="w-full px-4 h-11 border border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all">
                             <option value="low">Default / Low</option>
                             <option value="medium">Important / Medium</option>
                             <option value="high">Critical / High</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target Demographic</label>
                       <select value={formData.targetAudience} onChange={(e) => setFormData(p => ({ ...p, targetAudience: e.target.value }))} className="w-full px-4 h-11 border border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all">
                          {targetAudiences.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="pt-4 flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={() => { setShowCreateModal(false); resetForm(); }} className="font-bold text-gray-400 hover:text-gray-900">Discard</Button>
                    <Button onClick={selectedAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement} disabled={isSubmitting} className="px-8 shadow-xl shadow-blue-600/20">
                       {isSubmitting ? 'Processing...' : (selectedAnnouncement ? 'Update Broadcast' : 'Deploy Notice')}
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedAnnouncement && (
         <div className="fixed inset-0 z-[100] overflow-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-transparent" onClick={() => setShowViewModal(false)} />
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#003366] to-[#003366]/80" />
               <div className="p-6 sm:p-8 space-y-6 pt-6 overflow-y-auto">
                  <div className="flex justify-between items-start">
                     <ModernBadge variant={getStatusVariant(selectedAnnouncement.status)}>{selectedAnnouncement.status}</ModernBadge>
                     <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
                  </div>
                  <div className="space-y-2">
                     <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedAnnouncement.title}</h2>
                     <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-widest">
                        <span>{selectedAnnouncement.category}</span>
                        <span>•</span>
                        <span>{new Date(selectedAnnouncement.created_at).toLocaleDateString()}</span>
                     </div>
                  </div>
                  <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium break-words">
                     {selectedAnnouncement.content}
                  </div>
                  <div className="flex items-center justify-between pt-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                           {selectedAnnouncement.creator?.first_name?.charAt(0) || 'A'}
                        </div>
                        <div>
                           <div className="text-xs font-bold text-gray-900">{selectedAnnouncement.creator ? `${selectedAnnouncement.creator.first_name} ${selectedAnnouncement.creator.last_name}` : 'System Admin'}</div>
                           <div className="text-[10px] text-gray-400 font-medium">Post Author</div>
                        </div>
                     </div>
                     <Button variant="outline" size="sm" onClick={() => { setShowViewModal(false); handleEditClick(selectedAnnouncement); }}>Refine Copy</Button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}
