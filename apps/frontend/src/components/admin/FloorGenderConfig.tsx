'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Building2, Users, AlertCircle } from 'lucide-react'
import { fetchApi } from '@/lib/apiClient';

interface FloorGenderConfigProps {
  hostelId: string
  totalFloors: number
  onSave?: () => void
}

type Gender = 'male' | 'female' | 'mixed'

export default function FloorGenderConfig({ hostelId, totalFloors, onSave }: FloorGenderConfigProps) {
  const [floorConfig, setFloorConfig] = useState<Record<string, Gender>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFloorConfig = async () => {
      try {
        setLoading(true)
        const response = await fetchApi(`/api/admin/hostels/${hostelId}/floor-config`)
        
        if (response.ok) {
          const data = await response.json()
          setFloorConfig(data.floorGenderConfig || {})
        } else {
          setError('Failed to load floor configuration')
        }
      } catch (err) {
        setError('Error loading floor configuration')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchFloorConfig()
  }, [hostelId])

  const handleGenderChange = (floor: number, gender: Gender) => {
    setFloorConfig(prev => ({
      ...prev,
      [floor.toString()]: gender
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetchApi(`/api/admin/hostels/${hostelId}/floor-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ floorGenderConfig: floorConfig }),
      })

      if (response.ok) {
        alert('Floor gender configuration saved successfully!')
        onSave?.()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save configuration')
      }
    } catch (err) {
      setError('Error saving floor configuration')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const getGenderColor = (gender?: Gender) => {
    switch (gender) {
      case 'male':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'female':
        return 'bg-pink-100 text-pink-700 border-pink-300'
      case 'mixed':
        return 'bg-purple-100 text-purple-700 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getGenderIcon = (gender?: Gender) => {
    if (!gender) return '—'
    return gender === 'male' ? '♂' : gender === 'female' ? '♀' : '⚥'
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Loading floor configuration...</div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Floor Gender Assignment</h3>
        </div>
        <p className="text-sm text-gray-600">
          Assign gender designations to each floor. Rooms on these floors will automatically inherit the gender setting.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-3 mb-6">
        {Array.from({ length: totalFloors + 1 }, (_, i) => i).map(floor => {
          const currentGender = floorConfig[floor.toString()]
          const floorLabel = floor === 0 ? 'Ground Floor' : `Floor ${floor}`
          
          return (
            <div
              key={floor}
              className={`p-4 border-2 rounded-lg transition-all ${getGenderColor(currentGender)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-gray-700 shadow-sm">
                    {floor === 0 ? 'G' : floor}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{floorLabel}</div>
                    <div className="text-sm text-gray-600">
                      {currentGender ? (
                        <span className="flex items-center space-x-1">
                          <span>{getGenderIcon(currentGender)}</span>
                          <span className="capitalize">{currentGender}</span>
                        </span>
                      ) : (
                        'Not configured'
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={currentGender || ''}
                    onChange={(e) => handleGenderChange(floor, e.target.value as Gender)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">♂ Male</option>
                    <option value="female">♀ Female</option>
                    <option value="mixed">⚥ Mixed</option>
                  </select>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-600">
          <Users className="w-4 h-4 inline mr-1" />
          {Object.keys(floorConfig).length} of {totalFloors + 1} floors configured
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </Card>
  )
}
