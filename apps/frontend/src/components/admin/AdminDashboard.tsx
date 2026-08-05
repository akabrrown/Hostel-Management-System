'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useFormik } from 'formik'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { RootState } from '@/store'
import { fetchNotifications } from '@/store/slices/notificationSlice'
import { Admin } from '@/types'
import apiClient from '@/lib/api'
import { formatIndexNumber } from '@/lib/formatters'
import styles from './AdminDashboard.module.css'
import { LoadingPage } from '@/components/ui/loading';

interface AdminDashboardProps {
  admin: Admin
}

interface Student {
  id: number
  firstName: string
  lastName: string
  email: string
  indexNumber: string
  programOfStudy: string
  roomAllocation: string
  paymentStatus: string
  status: string
}

interface Hostel {
  id: number
  name: string
  type: string
  totalRooms: number
  occupiedRooms: number
  availableRooms: number
  status: string
}

interface Payment {
  id: number
  studentName: string
  amount: string
  dueDate: string
  status: string
}

interface Announcement {
  id: number
  title: string
  content: string
  targetAudience: string
  priority: string
  postedAt: string
}

const AdminDashboard = ({ admin }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'hostels' | 'payments' | 'announcements'>('overview')
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  
  const router = useRouter()
  const dispatch = useDispatch()
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications) as any

  useEffect(() => {
    dispatch(fetchNotifications() as any)
    loadDashboardData()
  }, [dispatch])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [studentsRes, hostelsRes, paymentsRes, announcementsRes] = await Promise.all([
        apiClient.get<Student[]>('/admin/students'),
        apiClient.get<Hostel[]>('/admin/hostels'),
        apiClient.get<Payment[]>('/admin/payments'),
        apiClient.get<Announcement[]>('/admin/announcements')
      ])

      setStudents(studentsRes)
      setHostels(hostelsRes)
      setPayments(paymentsRes)
      setAnnouncements(announcementsRes)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-navy-primary">{admin?.totalStudents || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-green-600">{admin?.occupancyRate || 0}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Reservations</p>
              <p className="text-2xl font-bold text-yellow-600">{admin?.pendingReservations || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread Messages</p>
              <p className="text-2xl font-bold text-goldenYellow">{unreadCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reservations</h3>
          <div className="space-y-3">
            {admin?.recentReservations?.slice(0, 3).map((reservation, index) => (
              <div key={reservation.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-sm">{reservation.studentName}</p>
                  <p className="text-xs text-gray-500">{new Date(reservation.createdAt).toLocaleString()}</p>
                </div>
                <Badge className={
                  reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  reservation.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }>
                  {reservation.status}
                </Badge>
              </div>
            )) || <p className="text-gray-500 text-sm">No recent reservations</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hostel Occupancy</h3>
          <div className="space-y-3">
            {admin?.hostelOccupancy?.map((hostel, index) => (
              <div key={hostel.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{hostel.name}</span>
                  <span>{hostel.occupancyRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-goldenYellow h-2 rounded-full" 
                    style={{ width: `${hostel.occupancyRate}%` }}
                  ></div>
                </div>
              </div>
            )) || <p className="text-gray-500 text-sm">No occupancy data available</p>}
          </div>
        </Card>
      </div>
    </div>
  )

  const renderStudents = () => {
    if (loading) {
      return (
        <Card className="p-6">
          <LoadingPage />
        </Card>
      )
    }

    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Student Management</h3>
          <Button onClick={() => router.push('/admin/students')}>Manage Students</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Index Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accommodation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatIndexNumber(student.indexNumber)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.programOfStudy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.roomAllocation}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className="bg-green-100 text-green-800">
                      {student.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="outline" size="sm" className="mr-2">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )
  }

  const renderHostels = () => {
    if (loading) {
      return (
        <Card className="p-6">
          <LoadingPage />
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Hostel Management</h3>
            <Button onClick={() => router.push('/admin/hostels')}>Manage Hostels</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map((hostel) => (
              <Card key={hostel.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{hostel.name}</h4>
                    <p className="text-sm text-gray-600">{hostel.type}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {hostel.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Rooms:</span>
                    <span className="font-medium">{hostel.totalRooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupied:</span>
                    <span className="font-medium">{hostel.occupiedRooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-medium">{hostel.availableRooms}</span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">View</Button>
                  <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  const renderPayments = () => {
    if (loading) {
      return (
        <Card className="p-6">
          <LoadingPage />
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Payment Management</h3>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.push('/admin/payments')}>Manage Payments</Button>
              <Button onClick={() => router.push('/admin/reports')}>Generate Report</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="outline" size="sm">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    )
  }

  const renderAnnouncements = () => {
    if (loading) {
      return (
        <Card className="p-6">
          <LoadingPage />
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Announcement Management</h3>
            <Button onClick={() => router.push('/admin/announcements')}>Manage Announcements</Button>
          </div>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{announcement.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{announcement.content}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Posted: {new Date(announcement.postedAt).toLocaleDateString()}</span>
                      <span>Target: {announcement.targetAudience}</span>
                      <span>Priority: {announcement.priority}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Delete</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage hostel operations and student accommodations.</p>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'students', label: 'Students' },
              { id: 'hostels', label: 'Hostels' },
              { id: 'payments', label: 'Payments' },
              { id: 'announcements', label: 'Announcements' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-goldenYellow text-goldenYellow'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'hostels' && renderHostels()}
        {activeTab === 'payments' && renderPayments()}
        {activeTab === 'announcements' && renderAnnouncements()}
      </div>
    </div>
  )
}

export default AdminDashboard
