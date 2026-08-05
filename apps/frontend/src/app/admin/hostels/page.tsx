'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { DataTable } from '@/components/ui/dataTable'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { Search, Plus, Edit, Trash2, Building, MapPin, Users, Bed, Settings, X, Image as ImageIcon, Upload } from 'lucide-react'
import { TableColumn } from '@/types'
import FloorGenderConfig from '@/components/admin/FloorGenderConfig'
import { initPageAnimations } from '@/lib/animations'
import { fetchApi } from '@/lib/apiClient'
import { LoadingPage } from '@/components/ui/loading'
import toast from 'react-hot-toast'

interface RoomType {
  id?: string;
  name: string;
  capacity: number;
  price: number;
  description?: string;
}

interface Hostel {
  id: string
  name: string
  code: string
  address: string
  totalFloors: number
  totalRooms: number
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  warden: string
  contact: string
  status: 'active' | 'inactive' | 'maintenance'
  createdAt: string
  pricePerSemester?: number
  pricePerYear?: number
  gender?: 'Male' | 'Female' | 'Mixed'
  amenities: string[]
  description?: string
  roomPricing?: any
  roomTypes?: RoomType[]
  images?: string[]
}

export default function AdminHostels() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null)
  const [showFloorConfigModal, setShowFloorConfigModal] = useState(false)
  const [configuringHostel, setConfiguringHostel] = useState<Hostel | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<{
    name: string
    code: string
    address: string
    totalFloors: string
    warden: string
    contact: string
    status: 'active' | 'inactive' | 'maintenance'
    gender: 'Male' | 'Female' | 'Mixed'
    amenities: string
    description: string
    images: string[]
    roomTypes: RoomType[]
  }>({
    name: '',
    code: '',
    address: '',
    totalFloors: '',
    warden: '',
    contact: '',
    status: 'active',
    gender: 'Male',
    amenities: '',
    description: '',
    images: [],
    roomTypes: []
  })
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'admin')) {
      router.push('/login')
      return
    }
    fetchHostels()
  }, [user, router])

  useEffect(() => {
    if (!loading) initPageAnimations(150)
  }, [loading])

  const fetchHostels = async () => {
    setLoading(true)
    try {
      const response = await fetchApi('/api/hostels', { cache: 'no-store' })
      if (response.ok) {
        const result = await response.json()
        const transformedHostels = result.hostels.map((hostel: any) => ({
          id: hostel.id,
          name: hostel.name,
          code: hostel.code || hostel.name.substring(0, 3).toUpperCase(),
          address: hostel.address,
          totalFloors: hostel.totalFloors || 1,
          totalRooms: hostel.totalRooms || 0,
          totalBeds: hostel.totalBeds || 0,
          occupiedBeds: hostel.occupiedBeds || 0,
          availableBeds: hostel.availableBeds || 0,
          warden: hostel.warden || 'Not assigned',
          contact: hostel.contact || 'Not assigned',
          status: hostel.status || 'inactive',
          createdAt: hostel.createdAt,
          pricePerSemester: hostel.pricePerSemester || 0,
          pricePerYear: hostel.pricePerYear || 0,
          gender: hostel.gender || 'Mixed',
          amenities: hostel.amenities || [],
          description: hostel.description || '',
          roomPricing: hostel.roomPricing,
          roomTypes: hostel.roomTypes || [],
          images: hostel.images || []
        }))
        setHostels(transformedHostels)
      }
    } catch (error) {
      console.error('Failed to fetch hostels:', error)
      setHostels([])
    } finally {
      setLoading(false)
    }
  }

  const filteredHostels = hostels.filter(hostel => {
    const matchesSearch = 
      hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.warden.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || hostel.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
    switch (status) {
      case 'active': return 'success'
      case 'maintenance': return 'warning'
      case 'inactive': return 'neutral'
      default: return 'neutral'
    }
  }

  const handleCreateHostel = async () => {
    try {
      if (!formData.name || !formData.address || !formData.warden || !formData.contact) {
        toast.error('Fill in all required fields')
        return
      }

      const hostelData = {
        name: formData.name,
        code: formData.code,
        address: formData.address,
        description: formData.description,
        gender: formData.gender.toLowerCase(),
        totalFloors: parseInt(formData.totalFloors) || 1,
        wardenName: formData.warden,
        wardenEmail: formData.contact.includes('@') ? formData.contact : `${formData.warden.toLowerCase().replace(/\s+/g, '.')}@upsamail.edu.gh`,
        wardenPhone: formData.contact,
        isActive: formData.status === 'active',
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
        roomTypes: formData.roomTypes,
        images: formData.images
      }

      const isEdit = !!editingHostel;
      const url = isEdit ? `/api/hostels?id=${editingHostel.id}` : '/api/hostels';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetchApi(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hostelData),
      })

      if (response.ok) {
        setShowCreateModal(false)
        resetForm()
        fetchHostels()
        toast.success(isEdit ? 'Hostel updated' : 'Hostel created')
      } else {
        const errorData = await response.json()
        if (errorData.details && Array.isArray(errorData.details)) {
          const messages = errorData.details.map((d: any) => `${d.path.join('.')} - ${d.message}`).join(', ')
          toast.error(`Validation Error: ${messages}`)
        } else {
          toast.error(errorData.error || `Failed to ${isEdit ? 'update' : 'create'} hostel`)
        }
      }
    } catch (error) {
      toast.error(`Failed to ${editingHostel ? 'update' : 'create'} hostel`)
    }
  }

  const resetForm = () => {
    setEditingHostel(null)
    setFormData({
      name: '', code: '', address: '', totalFloors: '', warden: '', contact: '',
      status: 'active',
      gender: 'Mixed', amenities: '', description: '', images: [],
      roomTypes: [] as RoomType[]
    })
  }

  const handleEditHostel = (hostel: Hostel) => {
    setEditingHostel(hostel)
    setFormData({
      name: hostel.name, code: hostel.code, address: hostel.address,
      totalFloors: hostel.totalFloors.toString(), warden: hostel.warden, contact: hostel.contact,
      status: hostel.status,
      gender: (hostel.gender && typeof hostel.gender === 'string') ? (hostel.gender.toLowerCase() === 'mixed' ? 'Mixed' : hostel.gender.charAt(0).toUpperCase() + hostel.gender.slice(1).toLowerCase()) as any : 'Mixed',
      amenities: hostel.amenities?.join(', ') || '', description: hostel.description || '',
      images: hostel.images || [],
      roomTypes: hostel.roomTypes || []
    })
    setShowCreateModal(true)
  }

  const handleDeleteHostel = async (id: string) => {
    if (!confirm('Permanently remove this hostel and all linked rooms?')) return
    try {
      const response = await fetchApi(`/api/hostels?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchHostels()
        toast.success('Hostel removed')
      } else {
        toast.error('Failed to delete hostel')
      }
    } catch (error) {
      toast.error('Failed to delete hostel')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setFormData(prev => ({ ...prev, images: [base64String] }))
    }
    reader.readAsDataURL(file)
  }

  const columns: TableColumn[] = [
    {
      key: 'name',
      title: 'Property',
      render: (value: string, row: Hostel) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#E8F1F8] rounded-2xl flex items-center justify-center shrink-0">
            <Building className="w-6 h-6 text-[#003366]" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-slate-900 text-sm">{value}</div>
            <div className="text-[10px] font-black text-[#1A5F9E] uppercase tracking-widest">{row.code}</div>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(row.address || 'UPSA Campus')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-[10px] text-slate-400 mt-0.5 hover:text-blue-500 transition-colors"
            >
              <MapPin className="w-3 h-3 mr-1 shrink-0" />
              <span className="truncate">{row.address}</span>
            </a>
          </div>
        </div>
      )
    },
    {
      key: 'capacity',
      title: 'Capacity',
      render: (_value: any, row: Hostel) => {
        const pct = row.totalBeds > 0 ? Math.round((row.occupiedBeds / row.totalBeds) * 100) : 0
        return (
          <div className="space-y-3 py-1 min-w-[160px]">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beds</span>
              <span className="text-sm font-black text-slate-900">{row.occupiedBeds}<span className="text-slate-400">/{row.totalBeds}</span></span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-[#10B981]'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex gap-4">
              <span className="text-[10px] font-bold text-slate-400"><Users className="w-3 h-3 inline mr-1" />{row.totalRooms} Rooms</span>
              <span className="text-[10px] font-bold text-emerald-500"><Bed className="w-3 h-3 inline mr-1" />{row.availableBeds} Free</span>
            </div>
          </div>
        )
      }
    },
    {
      key: 'pricing',
      title: 'Room Types & Pricing',
      render: (_value: any, row: Hostel) => (
        <div className="space-y-1 min-w-[140px]">
          {(!row.roomTypes || row.roomTypes.length === 0) ? (
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Not configured</div>
          ) : (
            row.roomTypes.slice(0, 3).map((rt, idx) => (
              <div key={idx} className="text-xs font-bold text-slate-700 flex justify-between gap-2">
                <span className="text-slate-400 truncate max-w-[100px]">{rt.name}</span>
                <span>GH₵{rt.price}</span>
              </div>
            ))
          )}
          {row.roomTypes && row.roomTypes.length > 3 && (
            <div className="text-[10px] font-black text-[#1A5F9E] uppercase tracking-widest pt-1">+{row.roomTypes.length - 3} more</div>
          )}
          <div className="pt-2">
            <ModernBadge variant="neutral">{row.gender}</ModernBadge>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <ModernBadge variant={getStatusBadgeVariant(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </ModernBadge>
      )
    },
    {
      key: 'actions',
      title: '',
      render: (_value: any, row: Hostel) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setConfiguringHostel(row); setShowFloorConfigModal(true) }}
            className="p-2 text-slate-400 hover:text-[#003366] hover:bg-[#E8F1F8] rounded-xl transition-all"
            title="Configure Floors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditHostel(row)}
            className="p-2 text-slate-400 hover:text-[#1A5F9E] hover:bg-blue-50 rounded-xl transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteHostel(row.id)}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  const totalCapacity = hostels.reduce((sum, h) => sum + h.totalBeds, 0)
  const totalOccupied = hostels.reduce((sum, h) => sum + h.occupiedBeds, 0)

  if (loading) return <LoadingPage />

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="page-header bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#003366] tracking-tight">Property <span className="text-[#B8860B]">Portfolio</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Hostel Configuration & Capacity Management</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="bg-[#003366] hover:bg-[#1A5F9E] text-white rounded-2xl h-12 px-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-[#003366]/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Deploy Hostel
        </Button>
      </div>

      {/* KPI Row */}
      <div className="stats-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedStatCard icon={Building} label="Total Properties" value={hostels.length} iconColor="blue" />
        <AnimatedStatCard icon={Users} label="Total Capacity" value={totalCapacity} iconColor="purple" />
        <AnimatedStatCard icon={Bed} label="Global Occupancy" value={`${totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0}%`} iconColor="green" />
        <AnimatedStatCard icon={Settings} label="Active Units" value={hostels.filter(h => h.status === 'active').length} iconColor="orange" />
      </div>

      {/* Search Bar */}
      <Card className="content-section border-none shadow-sm rounded-2xl bg-white p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[#003366] transition-colors" />
              <input
                placeholder="Search name, code, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#003366]/20 transition-all placeholder:text-slate-400"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-[#003366]/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {filteredHostels.length} Properties
          </div>
        </div>
      </Card>

      {/* Hostels Table */}
      <Card className="content-section border-none shadow-sm rounded-2xl bg-white overflow-hidden p-0">
        {filteredHostels.length > 0 ? (
          <DataTable columns={columns} data={filteredHostels} pagination={true} pageSize={10} />
        ) : (
          <div className="py-20">
            <EmptyState
              icon={Building}
              title="No Hostels Defined"
              description="Start by adding your first hostel property to the system."
              actionLabel="Create Hostel"
              onAction={() => setShowCreateModal(true)}
            />
          </div>
        )}
      </Card>

      {/* Floor Config Modal */}
      {showFloorConfigModal && configuringHostel && (
        <div className="fixed inset-0 z-[100] overflow-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-transparent" onClick={() => setShowFloorConfigModal(false)} />
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 relative z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#003366] to-[#003366]/80" />
            <div className="p-8 pt-6">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-black text-[#003366]">Floor Configuration</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{configuringHostel.name} — Gender rules per floor</p>
                </div>
                <button onClick={() => setShowFloorConfigModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <FloorGenderConfig hostelId={configuringHostel.id} totalFloors={configuringHostel.totalFloors} />
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <Button onClick={() => setShowFloorConfigModal(false)} className="bg-[#003366] text-white rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest">Done</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] overflow-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-transparent" onClick={() => { setShowCreateModal(false); setEditingHostel(null) }} />
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 relative z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#003366] to-[#003366]/80" />
            <div className="p-8 pt-6">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-black text-[#003366]">
                    {editingHostel ? 'Update Property' : 'Deploy New Hostel'}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Property configuration form</p>
                </div>
                <button onClick={() => { setShowCreateModal(false); setEditingHostel(null) }} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="space-y-10">
                <section>
                  <h3 className="text-[10px] font-black text-[#1A5F9E] uppercase tracking-[0.2em] mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hostel Name *</label>
                      <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Diamond Jubilee Hall" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Code</label>
                      <Input 
                        value={formData.code} 
                        onChange={(e) => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                        placeholder={formData.name ? formData.name.substring(0, 4).toUpperCase() : 'Code (e.g. DJH1)'} 
                        className="font-mono text-sm" 
                        title="Internal Code used for identification"
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-[#1A5F9E] uppercase tracking-[0.2em]">Room Types & Pricing</h3>
                    <button 
                      type="button" 
                      onClick={() => setFormData(p => ({ ...p, roomTypes: [...(p.roomTypes || []), { name: '', capacity: 1, price: 0 }] }))}
                      className="text-[#1A5F9E] text-[10px] font-black uppercase tracking-widest hover:underline flex items-center"
                    >
                      + Add Type
                    </button>
                  </div>
                  <div className="bg-[#F8FAFC] p-6 rounded-2xl space-y-4">
                    {(!formData.roomTypes || formData.roomTypes.length === 0) ? (
                      <p className="text-xs text-slate-400 font-bold uppercase text-center py-4">No room types configured</p>
                    ) : (
                      formData.roomTypes.map((rt, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-4 items-end pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                          <div className="flex-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type Name</label>
                            <Input value={rt.name} onChange={(e) => {
                              const newTypes = [...(formData.roomTypes || [])]
                              newTypes[idx].name = e.target.value
                              setFormData(p => ({ ...p, roomTypes: newTypes }))
                            }} placeholder="e.g. Premium Single" />
                          </div>
                          <div className="w-24">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Capacity</label>
                            <Input type="number" value={rt.capacity} onChange={(e) => {
                              const newTypes = [...(formData.roomTypes || [])]
                              newTypes[idx].capacity = parseInt(e.target.value) || 1
                              setFormData(p => ({ ...p, roomTypes: newTypes }))
                            }} placeholder="1" />
                          </div>
                          <div className="w-32">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price (GH₵)</label>
                            <Input type="number" value={rt.price} onChange={(e) => {
                              const newTypes = [...(formData.roomTypes || [])]
                              newTypes[idx].price = parseFloat(e.target.value) || 0
                              setFormData(p => ({ ...p, roomTypes: newTypes }))
                            }} placeholder="0.00" />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              const newTypes = [...(formData.roomTypes || [])]
                              newTypes.splice(idx, 1)
                              setFormData(p => ({ ...p, roomTypes: newTypes }))
                            }}
                            className="bg-red-50 text-red-600 rounded-xl h-[42px] px-4 text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black text-[#1A5F9E] uppercase tracking-[0.2em] mb-4">Location & Logistics</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Physical Address *</label>
                      <Input value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} placeholder="GPS Coordinate or Local Address" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Floors</label>
                        <Input type="number" value={formData.totalFloors} onChange={(e) => setFormData(p => ({ ...p, totalFloors: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Gender</label>
                        <select value={formData.gender} onChange={(e) => setFormData(p => ({ ...p, gender: e.target.value as any }))} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#003366]/20">
                          <option value="Male">Male Only</option>
                          <option value="Female">Female Only</option>
                          <option value="Mixed">Mixed Housing</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Op Status</label>
                        <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#003366]/20">
                          <option value="active">Active / Open</option>
                          <option value="inactive">Inactive / Closed</option>
                          <option value="maintenance">Under Maintenance</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black text-[#1A5F9E] uppercase tracking-[0.2em] mb-4">Staffing & Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Warden Name</label>
                      <Input value={formData.warden} onChange={(e) => setFormData(p => ({ ...p, warden: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact</label>
                      <Input value={formData.contact} onChange={(e) => setFormData(p => ({ ...p, contact: e.target.value }))} />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amenities (Comma separated)</label>
                    <Input value={formData.amenities} onChange={(e) => setFormData(p => ({ ...p, amenities: e.target.value }))} placeholder="Wi-Fi, Gym, Laundry..." />
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black text-[#1A5F9E] uppercase tracking-[0.2em] mb-4">Property Image</h3>
                  <div className="mt-2">
                    {formData.images && formData.images.length > 0 ? (
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden group">
                        <img src={formData.images[0]} alt="Hostel Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, images: [] }))}
                            className="bg-white text-rose-500 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest shadow-lg"
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 hover:border-[#003366]/30 bg-slate-50 hover:bg-[#E8F1F8] rounded-2xl cursor-pointer transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-6 h-6 text-slate-400 mb-2" />
                          <p className="text-xs font-bold text-slate-600">Click to upload property image</p>
                          <p className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                        </div>
                        <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </section>
              </div>
              
              <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-slate-100">
                <Button variant="outline" onClick={() => { setShowCreateModal(false); setEditingHostel(null) }} className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest border-slate-200 text-slate-600">Discard</Button>
                <Button onClick={handleCreateHostel} className="bg-[#003366] text-white rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest shadow-lg shadow-[#003366]/20">
                  {editingHostel ? 'Submit Updates' : 'Launch Hostel'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
