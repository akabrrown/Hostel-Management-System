'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { gsap } from 'gsap'
import Button from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, CreditCard, AlertCircle, CheckCircle2, Clock, Wallet, History, Search, Filter, ArrowUpRight, Download } from 'lucide-react'
import apiClient from '@/lib/api'
import { toast } from 'react-hot-toast'
import { LoadingPage } from '@/components/ui/loading';
import ReceiptDocument from '@/components/ReceiptDocument';
import { fetchApi } from '@/lib/apiClient';

interface Payment {
  id: number
  type: string
  description: string
  amount: number
  dueDate: string
  status: string
  paymentDate?: string
  method?: string
  reference?: string
  semester: string
  academicYear: string
}

export default function StudentPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const { user, profileFetched } = useSelector((state: RootState) => state.auth)

  const loadPayments = async () => {
    setLoading(true)
    try {
      const response = await fetchApi('/api/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(Array.isArray(data) ? data : data.payments || [])
      } else {
        setError('Failed to load payments')
      }
    } catch (error) {
      console.error('Failed to load payments:', error)
      setError('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [])

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.page-header',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        )
        gsap.fromTo('.stat-card',
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, delay: 0.2, ease: 'power3.out' }
        )
        gsap.fromTo('.payment-card',
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.4, ease: 'power3.out' }
        )
      })
      return () => ctx.revert()
    }
  }, [loading])

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 }
      case 'pending': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock }
      case 'overdue': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: AlertCircle }
      default: return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', icon: History }
    }
  }

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0)

  const handlePayment = (paymentId: number) => {
    toast.success('Redirecting to payment gateway...')
    // Implement actual payment gateway integration here
  }

  if (loading) {

    return (
      <LoadingPage />
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border-2 border-slate-100 page-header">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 bg-[#003366]/10 rounded-xl">
                   <Wallet className="w-6 h-6 text-[#003366]" />
                 </div>
                 <span className="text-[#003366] font-black uppercase tracking-widest text-[10px]">Finances</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Payment <span className="text-[#003366]">Center</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Manage your payments, view history, and download receipts securely.
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-[#003366] text-white hover:bg-[#1A5F9E] text-xs font-black uppercase tracking-widest py-6 rounded-2xl shadow-lg shadow-[#003366]/20 transition-all hover:-translate-y-0.5">
                <CreditCard className="w-4 h-4 mr-2" />
                Make Payment
              </Button>
            </div>
          </div>

          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="stat-card bg-[#003366] rounded-[2.5rem] p-8 text-white shadow-lg overflow-hidden relative border-2 border-[#003366]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <CheckCircle2 className="w-6 h-6 text-[#B8860B]" />
                </div>
                <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Total Paid</span>
              </div>
              <div className="text-3xl font-black mb-2 relative z-10">GHS {totalPaid.toLocaleString()}</div>
              <div className="text-[#B8860B] text-[10px] font-bold uppercase tracking-widest relative z-10">Fully settled payments</div>
            </div>

            <div className="stat-card bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-amber-600 text-[10px] font-black uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">Pending</span>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight mb-2 relative z-10">GHS {totalPending.toLocaleString()}</div>
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest relative z-10">Outstanding balance</div>
            </div>

            <div className="stat-card bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="p-3 bg-rose-50 rounded-2xl">
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                </div>
                <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">Overdue</span>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight mb-2 relative z-10">GHS {totalOverdue.toLocaleString()}</div>
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest relative z-10">Requires immediate attention</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search and List */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-slate-100 mb-8 flex flex-col md:flex-row gap-4 page-header relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search payments by description or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm font-medium text-slate-900"
            />
          </div>
          <div className="md:w-64 relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Payment List */}
        <div className="space-y-4">
          {filteredPayments.length > 0 ? (
            filteredPayments.map((payment) => {
               const statusConfig = getStatusConfig(payment.status)
               const StatusIcon = statusConfig.icon
               return (
                  <div key={payment.id} className="group payment-card bg-white rounded-[2rem] p-6 border-2 border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-4 rounded-2xl ${statusConfig.bg}`}>
                          <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">{payment.type}</h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{payment.description}</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Due: {new Date(payment.dueDate).toLocaleDateString()}
                            </span>
                            {payment.paymentDate && (
                              <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Paid: {new Date(payment.paymentDate).toLocaleDateString()}
                              </span>
                            )}
                            {payment.reference && (
                              <span className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">REF: {payment.reference}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4 min-w-[150px]">
                        <div className="text-2xl font-black text-[#B8860B] tracking-tight">GHS {payment.amount.toLocaleString()}</div>
                        <Badge className={`${statusConfig.bg} ${statusConfig.color} border-2 ${statusConfig.border} uppercase tracking-widest font-black text-[10px] px-3 shadow-none rounded-xl`}>
                           {payment.status}
                        </Badge>
                        
                        <div className="flex gap-2 mt-1 w-full md:w-auto">
                           {payment.status === 'paid' ? (
                             <ReceiptDocument payment={payment as any} user={user as any} />
                           ) : (
                             <Button size="sm" onClick={() => handlePayment(payment.id)} className="w-full text-[10px] font-black uppercase tracking-widest rounded-xl bg-[#003366] text-white hover:bg-[#1A5F9E] h-10 px-6 shadow-md shadow-[#003366]/10">
                               Pay Now <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
                             </Button>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
               )
            })
          ) : (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-slate-100 shadow-sm payment-card">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Payments Found</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto">
                 We couldn&apos;t find any payment records matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
