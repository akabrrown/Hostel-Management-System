'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { RootState } from '@/store'
import { fetchNotifications } from '@/store/slices/notificationSlice'
import Badge from '@/components/ui/badge'
import { Porter } from '@/types'
import { formatIndexNumber } from '@/lib/formatters'
import styles from './PorterDashboard.module.css'

interface PorterDashboardProps {
  porter: Porter
}

const PorterDashboard = ({ porter }: PorterDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'checkin' | 'checkout' | 'visitors'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
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
              <p className="text-sm text-gray-600">Today&apos;s Check-ins</p>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today&apos;s Check-outs</p>
              <p className="text-2xl font-bold text-blue-600">8</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Visitors</p>
              <p className="text-2xl font-bold text-yellow-600">5</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Check-ins</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-sm">Student {formatIndexNumber((2021000 + i).toString())}</p>
                  <p className="text-xs text-gray-500">Room 10{i} • Checked in {i} hour{i > 1 ? 's' : ''} ago</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Visitors</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-sm">Visitor {i}</p>
                  <p className="text-xs text-gray-500">Visiting Student {formatIndexNumber((2021000 + i).toString())} • Arrived {i * 30} min ago</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  On-site
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )

  const renderCheckIn = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Check-in</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="searchStudent" className="block text-sm font-medium text-gray-700 mb-2">
              Search Student by Index Number or Name
            </label>
            <div className="flex space-x-2">
              <Input
                id="searchStudent"
                type="text"
                placeholder="Enter index number or name..."
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button>Search</Button>
            </div>
          </div>

          {searchQuery && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Student Search Results</p>
                  <p className="text-sm text-gray-600">Search results for &quot;{searchQuery}&quot;</p>
                  <p className="text-sm text-gray-600">No student found with this index number</p>
                </div>
                <div className="flex space-x-2">
                  <Button disabled>Check In</Button>
                  <Button variant="outline" disabled>View Details</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Check-ins</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checked In By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {8 + i}:00 AM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Student {formatIndexNumber((2021000 + i).toString())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Room 10{i}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {porter.profile.firstName} {porter.profile.lastName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )

  const renderCheckOut = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Check-out</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="checkoutSearch" className="block text-sm font-medium text-gray-700 mb-2">
              Search Student for Check-out
            </label>
            <div className="flex space-x-2">
              <Input
                id="checkoutSearch"
                type="text"
                placeholder="Enter index number or name..."
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button>Search</Button>
            </div>
          </div>

          {searchQuery && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Student Search Results</p>
                  <p className="text-sm text-gray-600">Search results for &quot;{searchQuery}&quot;</p>
                  <p className="text-sm text-gray-600">No student found with this index number</p>
                </div>
                <div className="flex space-x-2">
                  <Button disabled>Check Out</Button>
                  <Button variant="outline" disabled>View Details</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Check-outs</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text
                 
               .
                . . .
                uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checked Out By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {10 + i}:30 AM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Student {formatIndexNumber((2021000 + i).toString())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Room 10{i}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {porter.profile.firstName} {porter.profile.lastName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )

  const renderVisitors = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Visitor Management</h3>
          <Button>Register New Visitor</Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="visitorSearch" className="block text-sm font-medium text-gray-700 mb-2">
              Search Visitor or Student Being Visited
            </label>
            <div className="flex space-x-2">
              <Input
                id="visitorSearch"
                type="text"
                placeholder="Enter visitor name or student index..."
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button>Search</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Visitors</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Visitor {i}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Student {formatIndexNumber((2021000 + i).toString())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Room 10{i}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {9 + i}:00 AM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="outline" size="sm">Check Out</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Porter Dashboard - {porter.profile.assignedHostel}
          </h1>
          <p className="text-gray-600 mt-2">Manage check-ins, check-outs, and visitor access.</p>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'checkin', label: 'Check-in' },
              { id: 'checkout', label: 'Check-out' },
              { id: 'visitors', label: 'Visitors' },
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
        {activeTab === 'checkin' && renderCheckIn()}
        {activeTab === 'checkout' && renderCheckOut()}
        {activeTab === 'visitors' && renderVisitors()}
      </div>
    </div>
  )
}

export default PorterDashboard
