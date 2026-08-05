'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { ArrowLeft, MapPin, Users, Bed, Phone, Mail, Building } from 'lucide-react'
import { fetchApi } from '@/lib/apiClient';

interface Hostel {
  id: string
  name: string
  address: string
  total_floors: number
  total_rooms: number
  total_beds: number
  occupied_beds: number
  available_beds: number
  warden_name: string
  warden_phone: string
  warden_email: string
  is_active: boolean
  gender: string
  amenities: string[]
  description: string
  room_pricing?: any
  room_types?: {
    id: string
    name: string
    capacity: number
    price: number
  }[]
  created_at: string
}

export default function HostelDetails() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  const [hostel, setHostel] = useState<Hostel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHostel = useCallback(async () => {
    try {
      const response = await fetchApi(`/api/hostels/${id}`)
      if (response.ok) {
        const data = await response.json()
        setHostel(data.hostel)
      } else {
        setError('Failed to load hostel details')
      }
    } catch (error) {
      setError('Error loading hostel details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchHostel()
  }, [id, user, router, fetchHostel])

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'secondary'
  }

  const getGenderColor = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male': return 'bg-blue-100 text-blue-800'
      case 'female': return 'bg-pink-100 text-pink-800'
      case 'mixed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !hostel) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-8">{error || 'Hostel not found'}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{hostel.name}</h1>
              <p className="text-gray-600">Hostel Details</p>
            </div>
          </div>
          <Badge className={getStatusColor(hostel.is_active)}>
            {hostel.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium">Address</p>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hostel.address || 'UPSA Campus')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline transition-colors"
                    >
                      {hostel.address}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Building className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-gray-600">
                      {hostel.total_floors} floors, {hostel.total_rooms} rooms, {hostel.total_beds} beds
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium">Occupancy</p>
                    <p className="text-gray-600">
                      {hostel.occupied_beds} occupied, {hostel.available_beds} available
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(hostel.occupied_beds / hostel.total_beds) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-gray-400 mt-1 flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${getGenderColor(hostel.gender).split(' ')[1]}`}></div>
                  </div>
                  <div>
                    <p className="font-medium">Gender Type</p>
                    <p className="text-gray-600 capitalize">{hostel.gender}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600">{hostel.description || 'No description available.'}</p>
            </Card>

            {/* Amenities */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {hostel.amenities.length > 0 ? (
                  hostel.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">
                      {amenity}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-600">No amenities listed.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Warden Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Warden Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{hostel.warden_name}</p>
                    <p className="text-sm text-gray-600">Hostel Warden</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-600">{hostel.warden_phone}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-600">{hostel.warden_email}</p>
                </div>
              </div>
            </Card>

            {/* Room Pricing */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Room Pricing (Per Semester)</h2>
              <div className="space-y-3">
                {(!hostel.room_types || hostel.room_types.length === 0) ? (
                  <p className="text-gray-500 text-sm">Pricing not configured.</p>
                ) : (
                  hostel.room_types.map((rt: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-600">{rt.name}:</span>
                      <span className="font-medium">GH₵{rt.price}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                <Button className="w-full" variant="outline">
                  Edit Hostel
                </Button>
                <Button className="w-full" variant="outline">
                  View Rooms
                </Button>
                <Button className="w-full" variant="outline">
                  Export Report
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}