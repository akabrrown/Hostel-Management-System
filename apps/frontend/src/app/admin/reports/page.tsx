'use client'

import { useState, useEffect } from 'react'
import { fetchApi } from '@/lib/apiClient'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import EmptyState from '@/components/admin/EmptyState'
import { LoadingPage } from '@/components/ui/loading'
import { initPageAnimations } from '@/lib/animations'
import toast from 'react-hot-toast'
import {
  BarChart3, Building, Users, Key, Eye, Download,
  TrendingUp, Activity
} from 'lucide-react'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const CHART_COLORS = ['#003366', '#1A5F9E', '#B8860B', '#10B981', '#F59E0B', '#EF4444']

export default function AdminReportsPage() {
  const [occupancyData, setOccupancyData] = useState<any[]>([])
  const [paymentData, setPaymentData] = useState<any[]>([])
  const [activityData, setActivityData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'occupancy' | 'payments' | 'activities'>('occupancy')

  useEffect(() => {
    fetchAllReports()
    initPageAnimations(150)
  }, [])

  const fetchAllReports = async () => {
    try {
      setLoading(true)
      const [occRes, payRes, actRes] = await Promise.all([
        fetchApi(`/api/admin/reports/occupancy?_t=${Date.now()}`),
        fetchApi(`/api/admin/reports/payments?_t=${Date.now()}`),
        fetchApi(`/api/admin/reports/activities?_t=${Date.now()}`)
      ])
      if (occRes.ok) setOccupancyData((await occRes.json()).data || [])
      if (payRes.ok) setPaymentData((await payRes.json()).data || [])
      if (actRes.ok) setActivityData((await actRes.json()).data || [])
    } catch (e) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const totalCapacity = occupancyData.reduce((s, d) => s + d.totalCapacity, 0)
  const totalOccupied = occupancyData.reduce((s, d) => s + d.totalOccupied, 0)
  const globalRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0

  const tabs = [
    { id: 'occupancy' as const, label: 'Occupancy', icon: Building },
    { id: 'payments' as const, label: 'Payments', icon: TrendingUp },
    { id: 'activities' as const, label: 'Activities', icon: Activity },
  ]

  if (loading) return <LoadingPage />

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="page-header bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#003366] tracking-tight">Analytics <span className="text-[#B8860B]">Hub</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Operational intelligence across all hostels</p>
        </div>
        <Button variant="outline" className="border-slate-200 text-slate-600 rounded-xl h-12 px-6 text-xs font-black uppercase tracking-widest hover:bg-slate-50">
          <Download className="w-4 h-4 mr-2" /> Export Report
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedStatCard icon={Building} label="Properties" value={occupancyData.length} iconColor="blue" />
        <AnimatedStatCard icon={Users} label="Global Capacity" value={totalCapacity} iconColor="purple" />
        <AnimatedStatCard icon={Eye} label="Occupancy Rate" value={`${globalRate}%`} iconColor="green" />
        <AnimatedStatCard icon={Key} label="Avg. Activity" value={Math.round(activityData.reduce((s, d) => s + d.keyMovements, 0) / (activityData.length || 1))} iconColor="orange" />
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-white rounded-xl p-2 shadow-sm border border-slate-100 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'bg-[#003366] text-white shadow-lg shadow-[#003366]/20'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Charts Area */}
      {activeTab === 'occupancy' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bar Chart */}
          <Card className="lg:col-span-2 border-none shadow-sm rounded-xl bg-white overflow-hidden p-8">
            <div className="mb-8">
              <h2 className="text-xl font-black text-[#003366] leading-none">Occupancy by Hostel</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Capacity vs occupied beds</p>
            </div>
            <div className="h-[350px]">
              {occupancyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 800 }}
                    />
                    <Bar dataKey="totalCapacity" name="Capacity" fill="#E8F1F8" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="totalOccupied" name="Occupied" fill="#003366" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <EmptyState icon={Building} title="No Data" description="Occupancy data will appear when hostels have rooms." />
                </div>
              )}
            </div>
          </Card>

          {/* Donut Chart */}
          <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden p-8 flex flex-col">
            <div className="mb-8">
              <h2 className="text-lg font-black text-[#003366] leading-none">Rate Breakdown</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Per-hostel occupancy %</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {occupancyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      dataKey="rate"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      strokeWidth={0}
                    >
                      {occupancyData.map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 800 }}
                      formatter={(val: any) => `${val}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : null}
            </div>
            {/* Legend */}
            <div className="space-y-3 mt-4">
              {occupancyData.map((d: any, i: number) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-600 truncate max-w-[140px]">{d.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{d.rate}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'payments' && (
        <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden p-8">
          <div className="mb-8">
            <h2 className="text-xl font-black text-[#003366] leading-none">Revenue Trends</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Paid vs pending across billing cycles</p>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={paymentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPaidR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPendingR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }} tickFormatter={(val) => `GH₵${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 800 }}
                />
                <Area type="monotone" dataKey="paid" name="Paid" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPaidR)" />
                <Area type="monotone" dataKey="pending" name="Pending" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorPendingR)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {activeTab === 'activities' && (
        <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden p-8">
          <div className="mb-8">
            <h2 className="text-xl font-black text-[#003366] leading-none">Weekly Activity Density</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Visitor flow, key movements, and maintenance tasks by day</p>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 800 }}
                />
                <Bar dataKey="visitors" name="Visitors" fill="#1A5F9E" radius={[8, 8, 0, 0]} />
                <Bar dataKey="keyMovements" name="Key Movements" fill="#B8860B" radius={[8, 8, 0, 0]} />
                <Bar dataKey="maintenance" name="Maintenance" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  )
}
