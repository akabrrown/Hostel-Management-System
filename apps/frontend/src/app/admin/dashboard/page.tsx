'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { fetchProfile } from '@/store/slices/authSlice'
import { formatIndexNumber } from '@/lib/formatters'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { Users, Bed, CreditCard, Calendar, Activity, Eye, ChevronRight } from 'lucide-react'
import { initPageAnimations } from '@/lib/animations'
import { fetchApi } from '@/lib/apiClient'
import { LoadingPage } from '@/components/ui/loading'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [recentStudents, setRecentStudents] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'admin')) {
      router.push('/login')
      return
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        await dispatch(fetchProfile() as any)

        const [statsRes, studentsRes, chartRes] = await Promise.all([
          fetchApi('/api/admin/stats'),
          fetchApi('/api/admin/students?limit=5'),
          fetchApi('/api/admin/reports/payments') // Using our new mock endpoint for chart data
        ])

        if (statsRes.ok) setStats(await statsRes.json())
        if (studentsRes.ok) {
           const sData = await studentsRes.json()
           setRecentStudents(sData.data || [])
        }
        if (chartRes.ok) {
           const cData = await chartRes.json()
           setChartData(cData.data || [])
        }

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [router, dispatch])

  useEffect(() => {
    if (!isLoading) {
      initPageAnimations(150)
    }
  }, [isLoading])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student_added': return <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Users className="w-4 h-4" /></div>
      case 'payment_received': return <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><CreditCard className="w-4 h-4" /></div>
      case 'room_allocated': return <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><Bed className="w-4 h-4" /></div>
      default: return <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><Activity className="w-4 h-4" /></div>
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'allocated':
      case 'paid':
        return 'success'
      case 'pending':
        return 'warning'
      case 'overdue':
        return 'danger'
      default:
        return 'neutral'
    }
  }

  if (isLoading) return <LoadingPage />

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="page-header bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#003366] tracking-tight">System <span className="text-[#B8860B]">Overview</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Administrator Operations Center</p>
        </div>
        <div className="flex gap-3 items-center px-5 py-3 bg-[#E8F1F8] rounded-2xl border border-blue-100">
           <Activity className="w-5 h-5 text-[#003366]" />
           <div className="text-right">
              <div className="text-[10px] font-black text-[#1A5F9E] uppercase tracking-tighter leading-none">System Status</div>
              <div className="text-xs font-black text-[#003366] mt-1">All Systems Operational</div>
           </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedStatCard
          icon={Users}
          label="Total Students"
          value={stats?.totalStudents || 0}
          iconColor="blue"
        />
        <AnimatedStatCard
          icon={Bed}
          label="Occupancy Rate"
          value={`${stats?.occupancyRate || 0}%`}
          iconColor="green"
        />
        <AnimatedStatCard
          icon={CreditCard}
          label="Pending Payments"
          value={stats?.pendingPayments || 0}
          iconColor="yellow"
        />
        <AnimatedStatCard
          icon={Calendar}
          label="Pending Apps"
          value={stats?.pendingApplications || 0}
          iconColor="purple"
        />
      </div>

      {/* Bento Grid: Charts & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl bg-white overflow-hidden p-8">
           <div className="flex justify-between items-center mb-8">
              <div>
                 <h2 className="text-xl font-black text-[#003366] leading-none">Revenue Trends</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">6 Month Payment History</p>
              </div>
           </div>
           
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }} tickFormatter={(val) => `GH₵${val/1000}k`} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                       itemStyle={{ fontWeight: 800 }}
                       labelStyle={{ fontWeight: 800, color: '#64748B', marginBottom: '8px' }}
                    />
                    <Area type="monotone" dataKey="paid" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPaid)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </Card>

        {/* Activity Feed */}
        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden flex flex-col">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                 <h2 className="text-lg font-black text-[#003366] leading-none">Activity Stream</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Recent System Events</p>
              </div>
           </div>
           
           <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-6">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                 stats.recentActivities.slice(0, 5).map((activity: any) => (
                    <div key={activity.id} className="flex gap-4 group">
                       <div className="shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-700 leading-relaxed group-hover:text-[#1A5F9E] transition-colors">{activity.description}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                             {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    </div>
                 ))
              ) : (
                 <div className="h-full flex items-center justify-center">
                    <EmptyState
                       icon={Activity}
                       title="No Activities"
                       description="System is quiet."
                    />
                 </div>
              )}
           </div>
           
           <div className="p-4 border-t border-slate-50">
              <Button variant="outline" className="w-full text-xs font-black uppercase tracking-widest h-12 rounded-2xl border-slate-200 text-slate-600">
                 View Full Log
              </Button>
           </div>
        </Card>
      </div>

      {/* Recent Students Wide Table */}
      <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden p-0">
         <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
               <h2 className="text-xl font-black text-[#003366] leading-none">New Enrollments</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Latest registered students</p>
            </div>
            <Button onClick={() => router.push('/admin/students')} className="bg-[#003366] hover:bg-[#1A5F9E] text-white rounded-xl h-12 px-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-[#003366]/20">
               Manage Students
            </Button>
         </div>
         
         <div className="overflow-x-auto">
            {recentStudents.length > 0 ? (
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-[#F8FAFC]">
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {recentStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-8 py-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-2xl bg-[#E8F1F8] text-[#003366] flex items-center justify-center font-black text-sm">
                                    {s.firstName[0]}{s.lastName[0]}
                                 </div>
                                 <div>
                                    <div className="font-black text-slate-900 group-hover:text-[#1A5F9E] transition-colors">{s.firstName} {s.lastName}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatIndexNumber(s.indexNumber)}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-4">
                              <div className="text-xs font-bold text-slate-700">{s.email}</div>
                              <div className="text-[10px] font-medium text-slate-500 mt-0.5">{s.phone}</div>
                           </td>
                           <td className="px-8 py-4">
                              <ModernBadge variant={getStatusBadgeVariant(s.accommodationStatus)}>
                                 {s.accommodationStatus}
                              </ModernBadge>
                           </td>
                           <td className="px-8 py-4 text-right">
                              <Button variant="ghost" className="w-8 h-8 p-0 rounded-xl hover:bg-slate-200">
                                 <ChevronRight className="w-4 h-4 text-slate-400" />
                              </Button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            ) : (
               <div className="py-20 flex justify-center">
                  <EmptyState
                     icon={Users}
                     title="No Students Yet"
                     description="Students will appear here once registered."
                  />
               </div>
            )}
         </div>
      </Card>
    </div>
  )
}
