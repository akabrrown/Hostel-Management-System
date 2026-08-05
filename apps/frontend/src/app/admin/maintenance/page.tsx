"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { fetchApi } from "@/lib/apiClient"
import { RootState } from "@/store"
import { DataTable } from "@/components/ui/dataTable"
import ModernBadge from "@/components/admin/ModernBadge"
import { LoadingPage } from '@/components/ui/loading';

export default function AdminMaintenancePage() {
  const router = useRouter()
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const [reports, setReports] = useState<any[]>([])
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
      fetchReports()
    }
  }, [user])

  const fetchReports = async () => {
    try {
      const res = await fetchApi('/api/admin/maintenance')
      const json = await res.json()
      if (res.ok) {
        setReports(json.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch maintenance reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetchApi(`/api/admin/maintenance/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      fetchReports()
    } catch (error) {
      console.error("Failed to update status:", error)
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
      title: 'Date',
      key: 'created_at' as const,
      render: (val: any) => new Date(val).toLocaleDateString()
    },
    {
      title: 'Hostel & Room',
      key: 'room' as const,
      render: (val: any) => `${val?.hostel?.name || 'Unknown'} - Rm ${val?.room_number || '?'}`
    },
    {
      title: 'Category',
      key: 'category' as const,
      render: (val: any) => <span className="capitalize">{val}</span>
    },
    {
      title: 'Description',
      key: 'description' as const,
      render: (val: any) => (
        <div className="max-w-xs truncate" title={val}>
          {val}
        </div>
      )
    },
    {
      title: 'Priority',
      key: 'priority' as const,
      render: (val: any) => (
        <span className={`capitalize font-medium ${val === 'urgent' ? 'text-red-600' : ''}`}>
          {val}
        </span>
      )
    },
    {
      title: 'Status',
      key: 'status' as const,
      render: (val: any) => (
        <ModernBadge variant={getStatusVariant(val)}>
          <span className="capitalize">{String(val).replace(/_/g, ' ')}</span>
        </ModernBadge>
      )
    },
    {
      title: 'Actions',
      key: 'id' as const,
      render: (val: any, row: any) => (
        <select 
          value={row.status}
          onChange={(e) => updateStatus(row.id, e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
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
          <h1 className="text-3xl font-black text-[#003366] tracking-tight">Maintenance <span className="text-[#EF4444]">Oversight</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Track and triage maintenance issues across all hostels</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-none shadow-sm overflow-hidden p-0">
        {reports.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-bold text-sm uppercase tracking-widest">
            No maintenance reports found.
          </div>
        ) : (
          <DataTable columns={columns} data={reports} />
        )}
      </div>
    </div>
  )
}
