"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { fetchApi } from "@/lib/apiClient"
import { RootState } from "@/store"
import { DataTable } from "@/components/ui/dataTable"
import ModernBadge from "@/components/admin/ModernBadge"
import { LoadingPage } from '@/components/ui/loading';

export default function AdminRoomKeysPage() {
  const router = useRouter()
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const [activities, setActivities] = useState<any[]>([])
  const [statuses, setStatuses] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'status' | 'activity'>('status')
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
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [activityRes, statusRes] = await Promise.all([
        fetchApi('/api/admin/room-keys/activity'),
        fetchApi('/api/admin/room-keys/status')
      ])
      const activityJson = await activityRes.json()
      const statusJson = await statusRes.json()
      if (activityRes.ok) setActivities(activityJson.data || [])
      if (statusRes.ok) setStatuses(statusJson.data || [])
    } catch (error) {
      console.error("Failed to fetch room key data:", error)
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

  const statusColumns = [
    {
      title: 'Hostel',
      key: 'room' as const,
      render: (val: any) => val?.hostel?.name || 'Unknown'
    },
    {
      title: 'Room',
      key: 'room' as const,
      render: (val: any) => val?.room_number || '?'
    },
    {
      title: 'Key Code',
      key: 'key_code' as const,
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
      title: 'Current Holder',
      key: 'student' as const,
      render: (val: any) => val?.full_name || 'Porter'
    },
    {
      title: 'Last Updated',
      key: 'updated_at' as const,
      render: (val: any) => new Date(val).toLocaleString()
    }
  ]

  const activityColumns = [
    {
      title: 'Date & Time',
      key: 'transaction_date' as const,
      render: (val: any, row: any) => `${row.transaction_date} ${row.transaction_time}`
    },
    {
      title: 'Hostel',
      key: 'room' as const,
      render: (val: any) => val?.hostel?.name || 'Unknown'
    },
    {
      title: 'Room',
      key: 'room' as const,
      render: (val: any) => val?.room_number || '?'
    },
    {
      title: 'Transaction Type',
      key: 'transaction_type' as const,
      render: (val: any) => <span className="capitalize">{String(val).replace(/_/g, ' ')}</span>
    },
    {
      title: 'Student',
      key: 'student' as const,
      render: (val: any) => val?.full_name || 'N/A'
    },
    {
      title: 'Porter',
      key: 'porter' as const,
      render: (val: any) => val?.full_name || 'N/A'
    }
  ]

  if (!profileFetched || loading) {
    return <LoadingPage />
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Room Key Monitoring</h1>
          <p className="text-text-secondary mt-2 text-lg">
            Monitor real-time key status and view the immutable transaction log across all hostels.
          </p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'status' ? 'bg-primary-deep text-white' : 'bg-surface border border-border text-text-secondary hover:bg-gray-50'}`}
          >
            Current Status
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'activity' ? 'bg-primary-deep text-white' : 'bg-surface border border-border text-text-secondary hover:bg-gray-50'}`}
          >
            Activity Log
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm p-6 overflow-hidden">
        {activeTab === 'status' ? (
          statuses.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">No room keys found in the system.</div>
          ) : (
            <DataTable columns={statusColumns} data={statuses} />
          )
        ) : (
          activities.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">No key transactions found.</div>
          ) : (
            <DataTable columns={activityColumns} data={activities} />
          )
        )}
      </div>
    </div>
  )
}
