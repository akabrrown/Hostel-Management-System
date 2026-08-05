"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { fetchApi } from "@/lib/apiClient"
import { RootState } from "@/store"
import { DataTable } from "@/components/ui/dataTable"
import ModernBadge from "@/components/admin/ModernBadge"
import { LoadingPage } from '@/components/ui/loading';

export default function AdminVisitorsPage() {
  const router = useRouter()
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const [visitors, setVisitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profileFetched && !user) {
      router.replace('/login')
    } else if (user && user.role !== 'admin') {
      router.replace(`/${user.role}/dashboard`)
    }
  }, [user, profileFetched, router])

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchVisitors()
    }
  }, [user])

  const fetchVisitors = async () => {
    try {
      const res = await fetchApi('/api/admin/visitors')
      const json = await res.json()
      if (res.ok) {
        setVisitors(json.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch visitors:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'pending':
      case 'expected':
        return 'warning'
      case 'in_progress':
      case 'active':
      case 'checked_in':
      case 'issued':
        return 'info'
      case 'resolved':
      case 'closed':
      case 'completed':
      case 'checked_out':
      case 'returned':
        return 'success'
      case 'cancelled':
      case 'lost':
      case 'overdue':
        return 'danger'
      default:
        return 'neutral'
    }
  }

  const columns = [
    {
      title: 'Visitor',
      key: 'visitor_name' as const,
      render: (val: any, row: any) => (
        <div>
          <div className="font-medium">{val}</div>
          <div className="text-xs text-text-secondary">{row.phone}</div>
        </div>
      )
    },
    {
      title: 'Host Student',
      key: 'student' as const,
      render: (val: any) => val?.full_name || 'Unknown'
    },
    {
      title: 'Hostel & Room',
      key: 'room' as const,
      render: (val: any) => `${val?.hostel?.name || 'Unknown'} - Rm ${val?.room_number || '?'}`
    },
    {
      title: 'Purpose',
      key: 'visit_purpose' as const,
    },
    {
      title: 'Expected Departure',
      key: 'expected_arrival_time' as const,
      render: (val: any) => new Date(val).toLocaleString()
    },
    {
      title: 'Status',
      key: 'status' as const,
      render: (val: any) => (
        <ModernBadge variant={getStatusVariant(val)}>
          <span className="capitalize">{String(val).replace(/_/g, ' ')}</span>
        </ModernBadge>
      )
    }
  ]

  if (!profileFetched || loading) {
    return <LoadingPage />
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="page-header bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#003366] tracking-tight">Visitor <span className="text-[#1A5F9E]">Oversight</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Monitor visitor logs and activity across all hostels</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-none shadow-sm overflow-hidden p-0">
        {visitors.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-bold text-sm uppercase tracking-widest">
            No visitor records found.
          </div>
        ) : (
          <DataTable columns={columns} data={visitors} />
        )}
      </div>
    </div>
  )
}
