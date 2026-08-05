'use client'

import { useState, useEffect } from 'react'
import { fetchApi } from '@/lib/apiClient'
import { formatIndexNumber } from '@/lib/formatters'
import { 
  Users, Search, UserCheck, ShieldAlert,
  ChevronRight, Filter, Download, MoreVertical, Key, LogOut, X, Building
} from 'lucide-react'
import Button from '@/components/ui/button'
import toast from 'react-hot-toast'
import { LoadingPage } from '@/components/ui/loading'
import Card from '@/components/ui/card'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { initPageAnimations } from '@/lib/animations'

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)

  useEffect(() => {
    fetchStudents()
    initPageAnimations(150)
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await fetchApi('/api/admin/students')
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students || [])
      }
    } catch (e) {
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
      const res = await fetchApi(`/api/admin/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success(`Account ${newStatus}`)
        fetchStudents()
        if (selectedStudent?.id === id) {
          setSelectedStudent({ ...selectedStudent, status: newStatus })
        }
      }
    } catch (e) {
      toast.error('Failed to update status')
    }
  }

  const filteredStudents = students.filter(s => {
    const searchLower = search.toLowerCase()
    return (
      (s.firstName?.toLowerCase() || '').includes(searchLower) ||
      (s.lastName?.toLowerCase() || '').includes(searchLower) ||
      (s.indexNumber?.toLowerCase() || '').includes(searchLower) ||
      (s.email?.toLowerCase() || '').includes(searchLower)
    )
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'allocated': case 'paid': return 'success'
      case 'pending': return 'warning'
      case 'none': case 'overdue': return 'danger'
      default: return 'neutral'
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 h-full flex flex-col">
      {/* Editorial Header */}
      <div className="page-header bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#003366] tracking-tight">Student <span className="text-[#1A5F9E]">Directory</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Master Identity & Accommodation Records</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="border-slate-200 text-slate-600 rounded-2xl h-12 px-6 text-xs font-black uppercase tracking-widest hover:bg-slate-50">
             <Download className="w-4 h-4 mr-2" /> Export CSV
           </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-0">
        
        {/* Left Column: Fast Search & List */}
        <div className="xl:col-span-2 flex flex-col min-h-0 h-full space-y-6">
           <Card className="flex-1 flex flex-col border-none shadow-sm rounded-2xl bg-white overflow-hidden p-0 min-h-0">
             <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0">
                <div className="relative w-full max-w-md group">
                   <div className="absolute inset-0 bg-[#003366]/5 rounded-2xl blur-xl group-focus-within:bg-[#003366]/10 transition-all opacity-0 group-focus-within:opacity-100" />
                   <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#003366] transition-colors" />
                      <input
                        type="text"
                        placeholder="Search by name, index, or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#003366]/20 transition-all placeholder:text-slate-400"
                      />
                   </div>
                </div>
                <Button variant="ghost" className="text-slate-400 hover:text-slate-600 h-12 rounded-xl">
                   <Filter className="w-4 h-4 mr-2" /> Filter List
                </Button>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {loading ? (
                   <div className="py-20 flex justify-center"><LoadingPage /></div>
                ) : filteredStudents.length > 0 ? (
                    <div className="w-full">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Index No.</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredStudents.map(s => (
                            <tr
                              key={s.id}
                              onClick={() => setSelectedStudent(s)}
                              className={`group cursor-pointer transition-colors hover:bg-slate-50 ${
                                selectedStudent?.id === s.id ? 'bg-blue-50/50' : 'bg-white'
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="relative shrink-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                      s.status === 'suspended' 
                                        ? 'bg-rose-100 text-rose-700' 
                                        : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {s.firstName[0]}{s.lastName[0]}
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                      s.status === 'suspended' ? 'bg-rose-500' : 'bg-emerald-500'
                                    }`} title={s.status || 'Active'} />
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                      {s.firstName} {s.lastName}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate max-w-[200px]">
                                      {s.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-mono font-bold tracking-widest text-slate-700 uppercase">
                                  {formatIndexNumber(s.indexNumber)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <ModernBadge variant={getStatusBadgeVariant(s.accommodationStatus)}>
                                  {s.accommodationStatus}
                                </ModernBadge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <ChevronRight className={`inline-block w-5 h-5 transition-all duration-300 ${
                                  selectedStudent?.id === s.id ? 'text-blue-600 translate-x-1' : 'text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1'
                                }`} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                ) : (
                   <div className="py-20">
                      <EmptyState
                         icon={Users}
                         title="No Students Found"
                         description={`Search for "${search}" returned zero results.`}
                         actionLabel="Clear Search"
                         onAction={() => setSearch('')}
                      />
                   </div>
                )}
             </div>
           </Card>
        </div>

        {/* Right Column: Detailed Inspector Panel */}
        <div className="flex flex-col h-[calc(100vh-12rem)] space-y-6">
           {selectedStudent ? (
              <Card className="h-full flex flex-col border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden p-0 animate-in fade-in duration-300 relative">
                 
                 {/* Simple Header */}
                 <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between shrink-0">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-xl text-slate-700 shadow-sm relative">
                          {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                             selectedStudent.status === 'suspended' ? 'bg-rose-500' : 'bg-emerald-500'
                          }`} />
                       </div>
                       
                       <div>
                          <h2 className="text-xl font-bold text-slate-900 leading-none mb-2">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                          <div className="flex items-center gap-3">
                             <p className="text-sm font-medium text-slate-500 font-mono uppercase">{formatIndexNumber(selectedStudent.indexNumber)}</p>
                             <span className="w-1 h-1 rounded-full bg-slate-300" />
                             <p className="text-sm text-slate-500">{selectedStudent.gender || 'Not specified'}</p>
                          </div>
                       </div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600" onClick={() => setSelectedStudent(null)}>
                       <X className="w-5 h-5" />
                    </Button>
                 </div>

                 {/* Scrollable Content */}
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    
                    <div>
                       <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                          Contact Details
                       </h3>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm">
                             <span className="text-slate-500 font-medium">Email Address</span>
                             <span className="font-semibold text-slate-900">{selectedStudent.email}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                             <span className="text-slate-500 font-medium">Phone Number</span>
                             <span className="font-semibold text-slate-900">{selectedStudent.phone || 'Not provided'}</span>
                          </div>
                       </div>
                    </div>

                    <div>
                       <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                          Accommodation
                       </h3>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm">
                             <span className="text-slate-500 font-medium">Status</span>
                             <ModernBadge variant={getStatusBadgeVariant(selectedStudent.accommodationStatus)}>
                                {selectedStudent.accommodationStatus}
                             </ModernBadge>
                          </div>
                          {selectedStudent.room && (
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Current Assignment</span>
                                <span className="font-semibold text-slate-900">
                                   {selectedStudent.room.hostel}, Room {selectedStudent.room.roomNumber}
                                </span>
                             </div>
                          )}
                       </div>
                    </div>

                    <div className="pt-6">
                       <h3 className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-4 border-b border-rose-100 pb-2 flex items-center gap-2">
                          <ShieldAlert className="w-3.5 h-3.5" /> Danger Zone
                       </h3>
                       <p className="text-sm text-slate-600 mb-4">
                          {selectedStudent.status === 'suspended' ? 'This account is currently suspended from accessing the system.' : 'Suspending this account will immediately revoke all access.'}
                       </p>
                       <Button 
                         onClick={() => handleStatusToggle(selectedStudent.id, selectedStudent.status)}
                         variant="outline"
                         className={`w-full font-semibold rounded-lg ${
                            selectedStudent.status === 'suspended' 
                              ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' 
                              : 'border-rose-200 text-rose-700 hover:bg-rose-50'
                         }`}
                       >
                          {selectedStudent.status === 'suspended' ? (
                             <><UserCheck className="w-4 h-4 mr-2" /> Reinstate Access</>
                          ) : (
                             <>Suspend Account</>
                          )}
                       </Button>
                    </div>

                 </div>
              </Card>
           ) : (
              <Card className="h-full flex flex-col border border-slate-200 shadow-sm rounded-2xl bg-slate-50 overflow-hidden p-8 text-slate-400 justify-center text-center">
                 <div className="max-w-[14rem] mx-auto space-y-4">
                    <UserCheck className="w-12 h-12 mx-auto text-slate-300" />
                    <div>
                       <h3 className="text-base font-semibold text-slate-700 mb-1">Inspector Panel</h3>
                       <p className="text-slate-500 text-sm">
                          Select a student from the directory to view detailed identity records.
                       </p>
                    </div>
                 </div>
              </Card>
           )}
        </div>
      </div>
    </div>
  )
}
