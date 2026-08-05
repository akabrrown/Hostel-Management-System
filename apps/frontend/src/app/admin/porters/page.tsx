'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { DataTable } from '@/components/ui/dataTable'
import ModernBadge from '@/components/admin/ModernBadge'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import EmptyState from '@/components/admin/EmptyState'
import { Search, Plus, Edit, Trash2, Clock, Eye, X, ShieldCheck, UserMinus, ShieldAlert, Zap } from 'lucide-react'
import { TableColumn } from '@/types'
import { initPageAnimations } from '@/lib/animations'
import { fetchApi } from '@/lib/apiClient'
import { adminUserApi, hostelApi } from '@/lib/api'
import { LoadingPage } from '@/components/ui/loading'

interface Porter {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  employeeId: string
  assignedHostel?: string
  assignedFloors?: number[]
  status: 'active' | 'inactive' | 'on-leave'
  isOnDuty: boolean
  lastCheckIn?: string
  lastCheckOut?: string
  totalCheckIns: number
  totalCheckOuts: number
  averageResponseTime: number
  hireDate: string
  department: string
  supervisor: string
  emergencyContact: string
  address: string
}

export default function AdminPorters() {
  const [porters, setPorters] = useState<Porter[]>([])
  const [hostels, setHostels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedHostel, setSelectedHostel] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPorter, setSelectedPorter] = useState<Porter | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    employeeId: '', assignedHostel: '', department: '',
    supervisor: '', emergencyContact: '', address: '',
    status: 'active' as 'active' | 'inactive' | 'on-leave'
  })
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const loadPorters = async () => {
    try {
      setLoading(true)
      const [portersRes, hostelsRes] = await Promise.all([
        fetchApi(`/api/admin/porters?_t=${Date.now()}`),
        hostelApi.getAll()
      ])
      
      if (portersRes.ok) {
        const data = await portersRes.json()
        setPorters(data)
      }
      
      const hostelsData = hostelsRes as any
      setHostels(hostelsData.hostels || hostelsData.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'admin')) {
      router.push('/login')
      return
    }
    loadPorters()
  }, [user, router, profileFetched])

  useEffect(() => {
    if (!loading) initPageAnimations(150)
  }, [loading])

  const filteredPorters = porters.filter(porter => {
    const matchesSearch = 
      porter.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      porter.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      porter.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || porter.status === selectedStatus
    const matchesHostel = selectedHostel === 'all' || porter.assignedHostel === selectedHostel
    return matchesSearch && matchesStatus && matchesHostel
  })

  const getStatusVariant = (status: string): 'success' | 'neutral' | 'warning' => {
    switch (status) {
      case 'active': return 'success'
      case 'on-leave': return 'warning'
      case 'inactive': return 'neutral'
      default: return 'neutral'
    }
  }

  const handleRecruitPorter = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in required fields')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      const payload = {
         firstName: formData.firstName,
         lastName: formData.lastName,
         email: formData.email,
         phone: formData.phone,
         role: 'porter',
         indexNumber: formData.employeeId,
         assignedHostelId: formData.assignedHostel || null
      }
      if (selectedPorter) {
        await adminUserApi.update(selectedPorter.id, payload)
      } else {
        await adminUserApi.create(payload)
      }
      setShowCreateModal(false)
      loadPorters()
    } catch (error: any) {
      setError(error.message || 'Failed to recruit porter')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (porter: Porter) => {
    setSelectedPorter(porter)
    setFormData({
      firstName: porter.firstName,
      lastName: porter.lastName,
      email: porter.email,
      phone: porter.phone,
      employeeId: porter.employeeId,
      assignedHostel: hostels.find(h => h.name === porter.assignedHostel)?.id || '',
      department: porter.department,
      supervisor: porter.supervisor,
      emergencyContact: porter.emergencyContact,
      address: porter.address,
      status: porter.status
    })
    setShowCreateModal(true)
  }

  const columns: TableColumn[] = [
    {
      key: 'name',
      title: 'Porter Identity',
      render: (_value: any, row: Porter) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#E8F1F8] rounded-2xl flex items-center justify-center font-black text-[#003366]">
            {row.firstName.charAt(0)}{row.lastName.charAt(0)}
          </div>
          <div>
            <div className="font-black text-slate-900">{row.firstName} {row.lastName}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'assignment',
      title: 'Post Assignment',
      render: (_value: any, row: Porter) => (
        <div className="space-y-1">
          <div className="text-sm font-bold text-slate-700">{row.assignedHostel || 'N/A'}</div>
          {row.assignedFloors && (
            <div className="text-[10px] font-bold text-slate-400 uppercase">Floors: {row.assignedFloors.join(', ')}</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (_value: any, row: Porter) => (
        <div className="flex flex-col gap-1.5">
           <ModernBadge variant={getStatusVariant(row.status)}>{row.status}</ModernBadge>
           <div className="flex items-center gap-1.5 ml-1">
              <div className={`w-1.5 h-1.5 rounded-full ${row.isOnDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase">{row.isOnDuty ? 'Active Duty' : 'Off Clock'}</span>
           </div>
        </div>
      )
    },
    {
       key: 'id',
       title: '',
       render: (_value: any, row: Porter) => (
         <div className="flex items-center gap-1">
            <button onClick={() => setSelectedPorter(row)} className="p-2 text-slate-400 hover:text-[#003366] hover:bg-[#E8F1F8] rounded-xl transition-all"><Eye className="w-4 h-4" /></button>
            <button onClick={() => handleEditClick(row)} className="p-2 text-slate-400 hover:text-[#1A5F9E] hover:bg-blue-50 rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
            <button onClick={() => {}} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
         </div>
       )
    }
  ]

  const activeCount = porters.filter(p => p.status === 'active').length
  const onDutyCount = porters.filter(p => p.isOnDuty).length

  if (loading) return <LoadingPage />

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="page-header bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#003366] tracking-tight">Security <span className="text-[#B8860B]">& Porters</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Personnel management and shift coordination</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-[#003366] hover:bg-[#1A5F9E] text-white rounded-2xl h-12 px-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-[#003366]/20">
          <Plus className="w-4 h-4 mr-2" /> Recruit Porter
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedStatCard icon={Zap} label="Peak Activity" value="08:00 AM" iconColor="purple" />
        <AnimatedStatCard icon={ShieldCheck} label="Available" value={activeCount} iconColor="green" />
        <AnimatedStatCard icon={Clock} label="On-Shift" value={onDutyCount} iconColor="blue" />
        <AnimatedStatCard icon={UserMinus} label="On Leave" value={porters.filter(p => p.status === 'on-leave').length} iconColor="yellow" />
      </div>

      {/* Filter Bar */}
      <Card className="p-6 border-none shadow-sm rounded-2xl bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[#003366] transition-colors" />
              <input
                placeholder="Search porters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#003366]/20 transition-all placeholder:text-slate-400"
              />
            </div>
            <select value={selectedHostel} onChange={(e) => setSelectedHostel(e.target.value)} className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-[#003366]/20">
              <option value="all">All Hostels</option>
              {hostels.map(h => (
                <option key={h.id} value={h.name}>{h.name}</option>
              ))}
            </select>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-[#003366]/20">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredPorters.length} registered</div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 border-none shadow-sm rounded-2xl bg-white overflow-hidden">
        {filteredPorters.length > 0 ? (
          <DataTable columns={columns} data={filteredPorters} pagination={true} pageSize={10} />
        ) : (
          <div className="py-20">
            <EmptyState icon={ShieldAlert} title="No Porters On Record" description="The personnel registry is empty or no staff match your filters." actionLabel="Register First Porter" onAction={() => setShowCreateModal(true)} />
          </div>
        )}
      </Card>

      {/* Recruitment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] overflow-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-transparent" onClick={() => { setShowCreateModal(false); setSelectedPorter(null) }} />
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#003366] to-[#003366]/80" />
            <div className="p-8 space-y-8 pt-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#E8F1F8] rounded-2xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-[#003366]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#003366]">{selectedPorter ? 'Edit Personnel' : 'Recruit Personnel'}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Register staff and assign responsibilities</p>
                  </div>
                </div>
                <button onClick={() => { setShowCreateModal(false); setSelectedPorter(null) }} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                    <Input value={formData.firstName} onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                    <Input value={formData.lastName} onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID</label>
                    <Input value={formData.employeeId} onChange={(e) => setFormData(p => ({ ...p, employeeId: e.target.value }))} placeholder="P-XXXX" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Post</label>
                    <select value={formData.assignedHostel} onChange={(e) => setFormData(p => ({ ...p, assignedHostel: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#003366]/20">
                      <option value="">Unassigned</option>
                      {hostels.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Email</label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} disabled={!!selectedPorter} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</label>
                  <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#003366]/20">
                    <option value="active">Active Service</option>
                    <option value="on-leave">On Leave</option>
                    <option value="inactive">Retired / Inactive</option>
                  </select>
                </div>
              </div>
              
              {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl">{error}</div>}

              <div className="pt-4 flex items-center justify-end gap-4">
                <Button variant="ghost" onClick={() => { setShowCreateModal(false); setSelectedPorter(null) }} className="font-black text-slate-400 rounded-2xl h-12 px-8 text-xs uppercase tracking-widest">Discard</Button>
                <Button onClick={handleRecruitPorter} disabled={isSubmitting} className="bg-[#003366] hover:bg-[#1A5F9E] text-white rounded-2xl h-12 px-10 font-black text-xs uppercase tracking-widest shadow-lg shadow-[#003366]/20">
                  {isSubmitting ? 'Processing...' : selectedPorter ? 'Update Service' : 'Confirm Recruitment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
