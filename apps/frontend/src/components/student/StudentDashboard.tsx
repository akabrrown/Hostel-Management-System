'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { RootState } from '@/store'
import { fetchNotifications } from '@/store/slices/notificationSlice'
import { Student } from '@/types'
import { formatIndexNumber } from '@/lib/formatters'
import styles from './StudentDashboard.module.css'

interface StudentDashboardProps {
  student: Student
}

const StudentDashboard = ({ student }: StudentDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'booking' | 'payments' | 'announcements'>('overview')
  const dispatch = useDispatch()
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications) as any

  useEffect(() => {
    dispatch(fetchNotifications() as any)
  }, [dispatch])

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Accommodation</p>
              <p className="text-2xl font-bold text-navy-primary">
                {student.accommodation ? student.accommodation.hostel.name : 'Not Assigned'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className="text-2xl font-bold text-green-600">
                {student.accommodation?.paymentStatus || 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Full Name</p>
            <p className="font-medium">{student.profile.firstName} {student.profile.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Index Number</p>
            <p className="font-medium">{formatIndexNumber(student.profile.indexNumber)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Program of Study</p>
            <p className="font-medium">{student.profile.programOfStudy}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Year of Study</p>
            <p className="font-medium">Year {student.profile.yearOfStudy}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{student.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{student.profile.phoneNumber || 'Not provided'}</p>
          </div>
        </div>
      </Card>

      {student.accommodation && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Accommodation Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Hostel</p>
              <p className="font-medium">{student.accommodation.hostel.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Room</p>
              <p className="font-medium">{student.accommodation.room.roomNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Floor</p>
              <p className="font-medium">Floor {student.accommodation.floor.floorNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bed Number</p>
              <p className="font-medium">{student.accommodation.bed.bedNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Room Type</p>
              <p className="font-medium capitalize">{student.accommodation.room.roomType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Fee</p>
              <p className="font-medium">GHS {student.accommodation.room.monthlyFee}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )

  const renderBooking = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Booking</h3>
        {student.accommodation ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <p>You have been assigned accommodation in {student.accommodation.hostel.name}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Room</p>
                <p className="font-medium">{student.accommodation.room.roomNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bed Number</p>
                <p className="font-medium">{student.accommodation.bed.bedNumber}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
              <p>You don&apos;t have accommodation assigned yet. Start the booking process below.</p>
            </div>
            <Button className="w-full md:w-auto">
              Start Booking Process
            </Button>
          </div>
        )}
      </Card>
    </div>
  )

  const renderPayments = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No payment records available yet.</p>
        </div>
      </Card>
    </div>
  )

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Announcements</h3>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <p>No announcements available.</p>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {student.profile.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">Manage your hostel accommodation and stay updated.</p>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'booking', label: 'Booking' },
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
        {activeTab === 'booking' && renderBooking()}
        {activeTab === 'payments' && renderPayments()}
        {activeTab === 'announcements' && renderAnnouncements()}
      </div>
    </div>
  )
}

export default StudentDashboard
