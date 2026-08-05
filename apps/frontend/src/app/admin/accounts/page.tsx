'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { DataTable } from '@/components/ui/dataTable'
import ModernBadge from '@/components/admin/ModernBadge'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import EmptyState from '@/components/admin/EmptyState'
import { Search, Plus, Edit, Trash2, User, Mail, Shield, Calendar, Lock, Unlock, X, Filter, Users, UserCheck, UserMinus, UserX, Download } from 'lucide-react'
import { formatIndexNumber } from '@/lib/formatters'
import { TableColumn } from '@/types'
import { initPageAnimations } from '@/lib/animations'

interface Account {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  indexNumber: string
  hostel: string
  room: string
  phone: string
  emergencyContact: string
  status: string
  lastLogin: string
  createdAt: string
  isLocked: boolean
}

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student',
    indexNumber: '',
    hostel: '',
    room: '',
    phone: '',
    emergencyContact: ''
  })

  const loadAccounts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { adminUserApi } = await import('@/lib/api')
      const response = await adminUserApi.getAll({
        role: selectedRole,
        status: selectedStatus,
        search: searchTerm
      })
      setAccounts(response as Account[])
    } catch (error: any) {
      console.error('Failed to load accounts:', error)
      setError(error.message || 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }, [selectedRole, selectedStatus, searchTerm])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  useEffect(() => {
    if (!loading) {
      initPageAnimations(150)
    }
  }, [loading])

  const roles = [
    { id: 'all', name: 'All Roles' },
    { id: 'student', name: 'Student' },
    { id: 'admin', name: 'Admin' },
    { id: 'porter', name: 'Porter' },
    { id: 'director', name: 'Director' }
  ]

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
    { id: 'suspended', name: 'Suspended' }
  ]

  const getRoleVariant = (role: string): 'info' | 'danger' | 'success' | 'warning' | 'neutral' => {
    switch (role) {
      case 'student': return 'info'
      case 'admin': return 'danger'
      case 'porter': return 'success'
      case 'director': return 'warning'
      default: return 'neutral'
    }
  }

  const getStatusVariant = (status: string): 'success' | 'neutral' | 'danger' => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'neutral'
      case 'suspended': return 'danger'
      default: return 'neutral'
    }
  }

  const handleEditClick = (account: Account) => {
    setSelectedAccount(account)
    setFormData({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      role: account.role,
      indexNumber: account.indexNumber || '',
      hostel: account.hostel || '',
      room: account.room || '',
      phone: account.phone || '',
      emergencyContact: account.emergencyContact || ''
    })
    setShowCreateModal(true)
  }

  const handleCreateAccount = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in required fields')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      const { adminUserApi } = await import('@/lib/api')
      if (selectedAccount) {
        await adminUserApi.update(selectedAccount.id.toString(), formData)
      } else {
        await adminUserApi.create(formData)
      }
      setShowCreateModal(false)
      loadAccounts()
      resetForm()
    } catch (error: any) {
      setError(error.message || `Failed to ${selectedAccount ? 'update' : 'create'} account`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = async (id: number | string) => {
    if (!confirm('Permanently delete this account?')) return
    try {
      const { adminUserApi } = await import('@/lib/api')
      await adminUserApi.delete(id.toString())
      loadAccounts()
    } catch (error) {
      console.error('Failed to delete account:', error)
    }
  }

  const handleToggleLock = async (id: number | string) => {
    try {
      const account = accounts.find(a => a.id === id)
      if (!account) return
      
      const { adminUserApi } = await import('@/lib/api')
      await adminUserApi.toggleLock(id.toString(), !account.isLocked)
      loadAccounts()
    } catch (error) {
      console.error('Failed to toggle lock:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'student',
      indexNumber: '',
      hostel: '',
      room: '',
      phone: '',
      emergencyContact: ''
    })
    setError('')
  }

  const columns: TableColumn[] = [
    {
      key: 'firstName',
      title: 'Identity',
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
            {value.charAt(0)}{row.lastName.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-gray-900">{value} {row.lastName}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Privilege',
      render: (value: string) => (
        <ModernBadge variant={getRoleVariant(value)}>
          {value.toUpperCase()}
        </ModernBadge>
      )
    },
    {
      key: 'status',
      title: 'State',
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2">
          <ModernBadge variant={getStatusVariant(value)}>
            {value}
          </ModernBadge>
          {row.isLocked && <Lock className="w-3.5 h-3.5 text-amber-500" />}
        </div>
      )
    },
    {
      key: 'lastLogin',
      title: 'Activity',
      render: (value: string) => (
        <div className="text-xs text-gray-500 font-medium">
          {value === 'Never' ? 'Offline' : `Seen ${new Date(value).toLocaleDateString()}`}
        </div>
      )
    },
    {
      key: 'id',
      title: 'Actions',
      render: (value: string | number, row: any) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => handleEditClick(row)}><Edit className="w-3.5 h-3.5" /></Button>
          <Button variant="outline" size="sm" className={`h-8 w-8 p-0 rounded-full ${row.isLocked ? 'bg-amber-50 text-amber-600 border-amber-200' : ''}`} onClick={() => handleToggleLock(value)} title={row.isLocked ? "Unlock" : "Lock"}>
            {row.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full text-red-500 hover:bg-red-50 border-gray-100" onClick={() => handleDeleteAccount(value)}><Trash2 className="w-3.5 h-3.5" /></Button>
        </div>
      )
    }
  ]

  const totalAccounts = accounts.length
  const activeCount = accounts.filter(a => a.status === 'active').length
  const suspendedCount = accounts.filter(a => a.status === 'suspended').length

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Editorial Header */}
        <div className="page-header bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#003366] tracking-tight">User <span className="text-[#B8860B]">Ecosystem</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Manage access control and identity lifecycle</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-slate-200 text-slate-600 rounded-2xl h-12 px-6 text-xs font-black uppercase tracking-widest hover:bg-slate-50">
               <Download className="w-4 h-4 mr-2" />
               Export Log
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="bg-[#003366] hover:bg-[#1A5F9E] text-white rounded-2xl h-12 px-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-[#003366]/20">
              <Plus className="w-4 h-4 mr-2" />
              Provision User
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <AnimatedStatCard icon={Users} label="Total Members" value={totalAccounts} iconColor="blue" />
           <AnimatedStatCard icon={UserCheck} label="Active Sessions" value={activeCount} iconColor="green" />
           <AnimatedStatCard icon={UserMinus} label="Inactive" value={totalAccounts - activeCount - suspendedCount} iconColor="orange" />
           <AnimatedStatCard icon={UserX} label="Suspended" value={suspendedCount} iconColor="red" />
        </div>

        {/* Search & Filter */}
        <div className="content-section mb-8">
           <Card className="p-4 border-none shadow-sm bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search name, email or index..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 w-64"
                      />
                    </div>
                    
                    <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="h-10 px-4 border border-gray-100 rounded-xl text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium">
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>

                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="h-10 px-4 border border-gray-100 rounded-xl text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium">
                      {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">
                    Viewing {accounts.length} Accounts
                 </div>
              </div>
           </Card>
        </div>

        {/* Table Section */}
        <div className="accounts-table">
          <Card className="p-0 border-none shadow-sm bg-white overflow-hidden">
             {accounts.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={accounts}
                  pagination={true}
                  pageSize={15}
                />
             ) : (
               <EmptyState
                 icon={Users}
                 title="No Accounts Located"
                 description="The user directory is currently empty or no results match your query."
                 actionLabel="Create First User"
                 onAction={() => setShowCreateModal(true)}
               />
             )}
          </Card>
        </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] overflow-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
           <div className="absolute inset-0 bg-transparent" onClick={() => { setShowCreateModal(false); resetForm(); }} />
           <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#003366] to-[#003366]/80" />
               <div className="p-8 space-y-8 pt-6">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                          <Plus className="w-6 h-6 text-blue-600" />
                       </div>
                       <div>
                          <h2 className="text-2xl font-bold text-gray-900">{selectedAccount ? 'Edit Account' : 'Provision Account'}</h2>
                          <p className="text-sm text-gray-500 mt-0.5">Define identity and system privileges</p>
                       </div>
                    </div>
                    <button onClick={() => { setShowCreateModal(false); resetForm(); setSelectedAccount(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                 </div>

                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">First Name</label>
                          <Input value={formData.firstName} onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
                          <Input value={formData.lastName} onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))} />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Corporate Email</label>
                       <Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} disabled={!!selectedAccount} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role Level</label>
                          <select value={formData.role} onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))} className="w-full px-4 h-11 border border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all">
                             {roles.filter(r => r.id !== 'all').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                       </div>
                       {formData.role === 'student' && (
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Index Serial</label>
                            <Input value={formData.indexNumber} onChange={(e) => setFormData(p => ({ ...p, indexNumber: e.target.value }))} />
                         </div>
                       )}
                    </div>
                 </div>

                 {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl">{error}</div>}

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                     <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); setSelectedAccount(null); }} className="rounded-xl h-11 px-6 font-bold text-gray-500">Cancel</Button>
                     <Button type="button" onClick={handleCreateAccount} disabled={isSubmitting} className="bg-[#003366] hover:bg-[#1A5F9E] text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-[#003366]/20">
                        {isSubmitting ? 'Processing...' : selectedAccount ? 'Update Account' : 'Confirm Provision'}
                     </Button>
                  </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
