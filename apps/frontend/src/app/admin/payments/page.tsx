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
import GradientCard from '@/components/admin/GradientCard'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { Search, Filter, Download, Eye, CheckCircle, Clock, AlertCircle, DollarSign, ExternalLink, User, CreditCard, TrendingUp, Calendar, X } from 'lucide-react'
import { formatIndexNumber } from '@/lib/formatters'
import { TableColumn } from '@/types'
import { initPageAnimations } from '@/lib/animations'
import { LoadingPage } from '@/components/ui/loading';

interface Payment {
  id: string
  studentId: string
  studentName: string
  indexNumber: string
  email: string
  program: string
  
  // Payment details
  type: string
  description: string
  amount: number
  currency: string
  
  // Dates and status
  dueDate: string
  paymentDate?: string
  status: 'paid' | 'pending' | 'overdue' | 'partial'
  
  // Payment method and reference
  method?: string
  reference?: string
  transactionId?: string
  
  // Academic info
  academicYear: string
  semester: string
  
  // Additional info
  receiptUrl?: string
  notes?: string
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSemester, setSelectedSemester] = useState('all')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all')
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'admin')) {
      router.push('/login')
      return
    }

    // Simulate API fetch
    setLoading(true)
    setTimeout(() => {
      setPayments([]) // Start with empty as in original, logic for fetching would be here
      setLoading(false)
    }, 800)
  }, [user, router])

  useEffect(() => {
    if (!loading) {
      initPageAnimations(200)
    }
  }, [loading])

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.indexNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus
    const matchesSemester = selectedSemester === 'all' || payment.semester === selectedSemester
    const matchesAcademicYear = selectedAcademicYear === 'all' || payment.academicYear === selectedAcademicYear
    
    const matchesDateRange = 
      (!dateRange.start || new Date(payment.dueDate) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(payment.dueDate) <= new Date(dateRange.end))
    
    return matchesSearch && matchesStatus && matchesSemester && matchesAcademicYear && matchesDateRange
  })

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
    switch (status) {
      case 'paid': return 'success'
      case 'pending': return 'warning'
      case 'overdue': return 'danger'
      case 'partial': return 'info'
      default: return 'neutral'
    }
  }

  const handleExport = () => {
    console.log('Exporting payments data...')
  }

  const handleViewReceipt = (receiptUrl: string) => {
    window.open(receiptUrl, '_blank')
  }

  const columns: TableColumn[] = [
    {
      key: 'student',
      title: 'Student & Transaction',
      render: (value: any, row: Payment) => (
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-bold text-gray-900">{row.studentName}</div>
            <div className="text-xs text-blue-600 font-bold tracking-wider">{formatIndexNumber(row.indexNumber)}</div>
            <div className="text-xs text-gray-500 mt-1">{row.type}</div>
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value: any, row: Payment) => (
        <div className="py-2">
           <div className="text-lg font-bold text-gray-900 leading-none">
             {row.currency} {row.amount.toLocaleString()}
           </div>
           {row.reference && (
             <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">Ref: {row.reference}</div>
           )}
        </div>
      )
    },
    {
      key: 'dates',
      title: 'Schedule',
      render: (value: any, row: Payment) => (
        <div className="space-y-1">
          <div className="text-xs flex items-center text-gray-700">
            <Calendar className="w-3 h-3 mr-1 text-gray-400" />
            <span className="font-medium">Due:</span> {new Date(row.dueDate).toLocaleDateString()}
          </div>
          {row.paymentDate && (
            <div className="text-xs flex items-center text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span className="font-medium">Paid:</span> {new Date(row.paymentDate).toLocaleDateString()}
            </div>
          )}
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4">
            {row.semester}
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
      key: 'method',
      title: 'Method',
      render: (value: string, row: Payment) => (
        <div className="text-xs">
          <div className="font-semibold text-gray-700">{row.method || 'Pending'}</div>
          {row.transactionId && <div className="text-[10px] text-gray-400">ID: {row.transactionId}</div>}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: Payment) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" title="Details">
            <Eye className="w-4 h-4" />
          </Button>
          {row.receiptUrl && (
            <Button size="sm" variant="outline" onClick={() => handleViewReceipt(row.receiptUrl!)} title="Receipt">
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const pendingRevenue = payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0)

  if (loading) {
    return (
      <LoadingPage />
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="page-header bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#003366] tracking-tight">Financial <span className="text-[#B8860B]">Management</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Monitor revenue flows and student account balances</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExport} className="border-slate-200 text-slate-600 rounded-2xl h-12 px-6 text-xs font-black uppercase tracking-widest hover:bg-slate-50">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button className="bg-[#003366] hover:bg-[#1A5F9E] text-white rounded-2xl h-12 px-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-[#003366]/20">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Reports
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <AnimatedStatCard
             icon={CreditCard}
             label="Total Transactions"
             value={payments.length}
             iconColor="blue"
           />
           <AnimatedStatCard
             icon={CheckCircle}
             label="Successful"
             value={payments.filter(p => p.status === 'paid').length}
             iconColor="green"
           />
           <AnimatedStatCard
             icon={Clock}
             label="Pending"
             value={payments.filter(p => p.status === 'pending').length}
             iconColor="yellow"
           />
           <AnimatedStatCard
             icon={AlertCircle}
             label="Overdue items"
             value={payments.filter(p => p.status === 'overdue').length}
             iconColor="red"
           />
        </div>

        {/* Revenue Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <GradientCard gradient="indigo" className="p-6">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-white/80 text-sm font-bold uppercase tracking-widest mb-2">Total Revenue (Paid)</h3>
                    <div className="text-3xl font-bold text-white mb-2">
                       GHS {totalRevenue.toLocaleString()}
                    </div>
                    <p className="text-indigo-100 text-xs font-medium">Accumulated successful payments this semester</p>
                 </div>
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <TrendingUp className="w-6 h-6 text-white" />
                 </div>
              </div>
           </GradientCard>

           <GradientCard gradient="rose" className="p-6">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-white/80 text-sm font-bold uppercase tracking-widest mb-2">Receivables (Outstanding)</h3>
                    <div className="text-3xl font-bold text-white mb-2">
                       GHS {pendingRevenue.toLocaleString()}
                    </div>
                    <p className="text-rose-100 text-xs font-medium">Projected revenue from pending and overdue bills</p>
                 </div>
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <DollarSign className="w-6 h-6 text-white" />
                 </div>
              </div>
           </GradientCard>
        </div>

        {/* Search & Filters */}
        <div className="content-section">
           <Card className="p-6 border-none shadow-sm rounded-2xl bg-white">
              <div className="flex flex-col gap-6">
                 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 flex-1">
                       <div className="relative group flex-1 max-w-md">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[#003366] transition-colors" />
                         <input
                           placeholder="Search student, index, or reference..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#003366]/20 transition-all placeholder:text-slate-400"
                         />
                       </div>
                       
                       <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-[#003366]/20">
                         <option value="all">All Status</option>
                         <option value="paid">Paid</option>
                         <option value="pending">Pending</option>
                         <option value="overdue">Overdue</option>
                       </select>

                       <select value={selectedAcademicYear} onChange={(e) => setSelectedAcademicYear(e.target.value)} className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-[#003366]/20">
                         <option value="all">Any Academic Year</option>
                         <option value="2023/2024">2023/2024</option>
                         <option value="2024/2025">2024/2025</option>
                       </select>
                    </div>
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="text-[10px] font-black uppercase tracking-widest text-[#1A5F9E] flex items-center gap-1 hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors">
                         <X className="w-3 h-3" /> Clear Search
                      </button>
                    )}
                 </div>

                 <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Filter by date due</span>
                       <div className="flex items-center gap-2">
                          <Input type="date" value={dateRange.start} onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))} className="h-9 text-xs py-1" />
                          <span className="text-gray-300">→</span>
                          <Input type="date" value={dateRange.end} onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))} className="h-9 text-xs py-1" />
                       </div>
                    </div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                       Showing {filteredPayments.length} of {payments.length} ledger items
                    </div>
                 </div>
              </div>
           </Card>
        </div>

        {/* Ledger Table Section */}
        <div className="payments-table">
           <Card className="p-0 border-none shadow-sm rounded-2xl bg-white overflow-hidden">
              {filteredPayments.length > 0 ? (
                 <DataTable
                   columns={columns}
                   data={filteredPayments}
                   pagination={true}
                   pageSize={15}
                 />
              ) : (
                <EmptyState
                  icon={CreditCard}
                  title="No Transactions Found"
                  description="Your current search parameters didn't return any ledger entries."
                  actionLabel="Clear Filters"
                  onAction={() => {
                    setSearchTerm('')
                    setSelectedStatus('all')
                    setSelectedAcademicYear('all')
                    setDateRange({ start: '', end: '' })
                  }}
                />
              )}
           </Card>
        </div>
    </div>
  )
}
