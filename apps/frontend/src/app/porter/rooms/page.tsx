'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { fetchProfile } from '@/store/slices/authSlice'
import { 
  Building, 
  DoorOpen, 
  Bed as BedIcon, 
  Users, 
  Search,
  AlertCircle,
  LayoutGrid
} from 'lucide-react'
import { fetchApi } from '@/lib/apiClient'
import { LoadingPage } from '@/components/ui/loading'
import { formatIndexNumber } from '@/lib/formatters'
import gsap from 'gsap'

interface Occupant {
  firstName: string
  lastName: string
  indexNumber: string
  phone: string
  gender: string
}

interface Bed {
  id: string
  bedNumber: string
  isAvailable: boolean
  occupant: Occupant | null
}

interface Room {
  id: string
  roomNumber: string
  capacity: number
  currentOccupancy: number
  beds: Bed[]
}

interface Floor {
  floorNumber: number
  rooms: Room[]
}

export default function PorterRoomView() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFloor, setActiveFloor] = useState<number | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'porter')) {
      router.push('/login')
      return
    }

    const loadData = async () => {
      try {
        setIsLoading(true)
        await dispatch(fetchProfile() as any)

        const res = await fetchApi('/api/porter/rooms')
        if (res.ok) {
          const data = await res.json()
          setFloors(data.data || [])
          if (data.data && data.data.length > 0) {
            setActiveFloor(data.data[0].floorNumber)
          }
        }
      } catch (error) {
        console.error('Failed to load room matrix:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, dispatch])

  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.matrix-header', 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
        )
        gsap.fromTo('.floor-tab',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, delay: 0.2, ease: 'power2.out' }
        )
        gsap.fromTo('.room-card',
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.05, delay: 0.4, ease: 'back.out(1.2)' }
        )
      })
      return () => ctx.revert()
    }
  }, [isLoading, activeFloor])

  if (isLoading) return <LoadingPage />

  const activeFloorData = floors.find(f => f.floorNumber === activeFloor)
  
  // Apply search filter if active
  const displayedRooms = activeFloorData?.rooms.filter(room => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    
    // Check room number
    if (room.roomNumber.toLowerCase().includes(searchLower)) return true
    
    // Check occupants
    return room.beds.some(bed => {
      if (!bed.occupant) return false
      return (
        bed.occupant.firstName.toLowerCase().includes(searchLower) ||
        bed.occupant.lastName.toLowerCase().includes(searchLower) ||
        bed.occupant.indexNumber.toLowerCase().includes(searchLower)
      )
    })
  }) || []

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 px-6 relative">
      {/* Header */}
      <div className="matrix-header bg-white p-10 rounded-2xl shadow-sm border-2 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#003366]/5 rounded-xl">
              <LayoutGrid className="w-5 h-5 text-[#003366]" />
            </div>
            <span className="text-[#003366] font-black uppercase tracking-widest text-[10px]">Hostel Matrix</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Room <span className="text-[#B8860B]">View</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Real-time occupancy and allocation map
          </p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-0 bg-[#003366]/5 rounded-2xl blur-xl group-focus-within:bg-[#003366]/10 transition-all opacity-0 group-focus-within:opacity-100" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#003366] transition-colors" />
            <input
              type="text"
              placeholder="Search Room or Student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all placeholder:text-slate-400 placeholder:font-bold outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Matrix Area */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Floor Navigation */}
          {floors.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {floors.map(floor => (
                <button
                  key={floor.floorNumber}
                  onClick={() => setActiveFloor(floor.floorNumber)}
                  className={`floor-tab flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all duration-300
                    ${activeFloor === floor.floorNumber
                      ? 'bg-[#003366] text-white border-[#003366] shadow-lg shadow-[#003366]/20 transform scale-105'
                      : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }
                  `}
                >
                  <Building className="w-4 h-4" />
                  Floor {floor.floorNumber}
                </button>
              ))}
            </div>
          )}

          {/* Room Grid */}
          {displayedRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedRooms.map(room => {
                const isFull = room.currentOccupancy >= room.capacity
                const isSelected = selectedRoom?.id === room.id
                
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`room-card relative p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 overflow-hidden
                      ${isSelected 
                        ? 'border-[#003366] bg-[#003366]/5 shadow-xl shadow-[#003366]/10 scale-105 z-10' 
                        : 'border-slate-100 bg-white hover:border-[#003366]/30 hover:shadow-lg'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <div className={`text-xl font-black tracking-tight ${isSelected ? 'text-[#003366]' : 'text-slate-900'}`}>
                          {room.roomNumber}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Users className="w-3 h-3" /> {room.currentOccupancy}/{room.capacity}
                        </div>
                      </div>
                      
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center
                        ${isFull ? 'bg-rose-50 text-rose-500' : 
                          room.currentOccupancy > 0 ? 'bg-amber-50 text-amber-600' : 
                          'bg-emerald-50 text-emerald-500'}
                      `}>
                        <DoorOpen className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Miniature Bed Indicators */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {room.beds.map((bed, idx) => (
                        <div 
                          key={bed.id}
                          title={`Bed ${bed.bedNumber}`}
                          className={`h-8 rounded-lg flex items-center justify-center border
                            ${bed.occupant 
                              ? 'bg-slate-900 border-slate-900 text-white' 
                              : bed.isAvailable 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-500' 
                                : 'bg-slate-100 border-slate-200 text-slate-400'
                            }
                          `}
                        >
                          <span className="text-[9px] font-black uppercase tracking-widest">B{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-24 text-center bg-white rounded-2xl border-2 border-slate-100 border-dashed">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">No Rooms Found</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Try adjusting your search or selecting a different floor
              </p>
            </div>
          )}
        </div>

        {/* Side Panel: Room Details */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-8">
            {selectedRoom ? (
              <div className="bg-white rounded-2xl shadow-xl shadow-[#003366]/5 border-2 border-slate-100 overflow-hidden">
                <div className="p-8 bg-[#003366] text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <DoorOpen className="w-5 h-5 text-[#B8860B]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#B8860B]">Room Details</span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tight mb-2">Room {selectedRoom.roomNumber}</h2>
                  <div className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase tracking-widest">
                    <Users className="w-4 h-4" /> Capacity: {selectedRoom.capacity}
                  </div>
                </div>

                <div className="p-8 space-y-6 bg-slate-50 border-t border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-200 pb-2">
                    Bed Allocations
                  </h3>
                  
                  <div className="space-y-4">
                    {selectedRoom.beds.map((bed) => (
                      <div key={bed.id} className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-xl ${bed.occupant ? 'bg-[#003366]/10 text-[#003366]' : 'bg-emerald-50 text-emerald-500'}`}>
                              <BedIcon className="w-4 h-4" />
                            </div>
                            <span className="font-black text-slate-900 text-sm">Bed {bed.bedNumber}</span>
                          </div>
                          {bed.occupant ? (
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-50 bg-slate-900 px-2 py-1 rounded-lg">
                              Occupied
                            </span>
                          ) : bed.isAvailable ? (
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
                              Available
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                              Maintenance
                            </span>
                          )}
                        </div>

                        {bed.occupant ? (
                          <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                            <div className="font-bold text-slate-900 text-sm">
                              {bed.occupant.firstName} {bed.occupant.lastName}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                                {formatIndexNumber(bed.occupant.indexNumber)}
                              </span>
                              <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                                {bed.occupant.gender}
                              </span>
                            </div>
                            {bed.occupant.phone && (
                              <div className="text-xs font-bold text-slate-400 mt-2">
                                {bed.occupant.phone}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-3 pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            No student allocated
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl border-2 border-slate-100 border-dashed p-10 flex flex-col items-center justify-center text-center h-96">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                  <DoorOpen className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Select a Room</h3>
                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                  Click on any room card in the matrix to view detailed bed allocations and student information.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
