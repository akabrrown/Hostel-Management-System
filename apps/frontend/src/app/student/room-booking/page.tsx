'use client'

import { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useSelector, useDispatch } from 'react-redux'
import { fetchProfile } from '@/store/slices/authSlice'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Button from '@/components/ui/button'
import { hostelApi, roomApi, handleApiError } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  Building, 
  Layers, 
  DoorOpen, 
  Bed as BedIcon, 
  Calendar, 
  Check, 
  Info, 
  AlertCircle,
  ChevronRight,
  MapPin,
  Users,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  CreditCard
} from 'lucide-react'
import gsap from 'gsap'
import { fetchApi } from '@/lib/apiClient';

const formatFloorName = (floorNumber: number) => {
  const names = [
    'Ground Floor', 'First Floor', 'Second Floor', 'Third Floor', 
    'Fourth Floor', 'Fifth Floor', 'Sixth Floor', 'Seventh Floor', 
    'Eighth Floor', 'Ninth Floor', 'Tenth Floor'
  ];
  return names[floorNumber] || `Floor ${floorNumber}`;
};

interface Hostel {
  id: string
  name: string
  code: string
  totalFloors: number
}

interface Floor {
  id: string
  floorNumber: number
  hostelId: string
}

interface Room {
  id: string
  roomNumber: string
  floorId: string
  roomType: string
  type?: string
  capacity: number
  availableBeds?: number
  occupiedBeds?: number
}

interface Bed {
  id: string
  bedNumber: string
  roomId: string
  isOccupied: boolean
  studentName?: string
}

const BookingSchema = Yup.object().shape({
  hostelId: Yup.string().required('Hostel selection is required'),
  floorId: Yup.string().required('Floor selection is required'),
  roomId: Yup.string().required('Room selection is required'),
  bedId: Yup.string().required('Bed selection is required'),
  academicYear: Yup.string().required('Academic year is required'),
  semester: Yup.string().required('Semester is required'),
})

export default function RoomBooking() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [beds, setBeds] = useState<Bed[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [currentAcademicYear, setCurrentAcademicYear] = useState('2024/2025')
  const [currentSemester, setCurrentSemester] = useState('First Semester')
  const [bookingEnabled, setBookingEnabled] = useState(true)
  const [hasRoom, setHasRoom] = useState(false)
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const dispatch = useDispatch()

  const formik = useFormik({
    initialValues: {
      hostelId: '',
      floorId: '',
      roomId: '',
      bedId: '',
      academicYear: currentAcademicYear,
      semester: currentSemester,
    },
    validationSchema: BookingSchema,
    onSubmit: async (values) => {
      setIsBooking(true)
      
      try {
        await roomApi.book({
          hostelId: values.hostelId,
          floorId: values.floorId,
          roomId: values.roomId,
          bedId: values.bedId,
          academicYear: values.academicYear,
          semester: values.semester,
        })
        
        // Re-fetch profile to update bookings state globally
        dispatch(fetchProfile() as any)

        toast.success('Room booked successfully!')
        setBookingSuccess(true)
      } catch (error) {
        const message = handleApiError(error, 'Booking failed')
        toast.error(message)
        console.error('Booking failed:', error)
      } finally {
        setIsBooking(false)
      }
    },
  })

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'student')) {
      router.push('/login')
      return
    }

    const fetchInitialData = async () => {
      try {
        // Always refresh profile on this page to prevent stale booking state
        dispatch(fetchProfile() as any)
        
        // Fetch system settings
        const settingsResponse = await fetchApi('/api/settings')
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          if (settingsData.data) {
            const academicYear = settingsData.data.current_academic_year
            const semester = settingsData.data.current_semester
            const enabled = settingsData.data.booking_enabled === true
            
            setBookingEnabled(enabled)
            
            if (academicYear) {
              setCurrentAcademicYear(academicYear)
              formik.setFieldValue('academicYear', academicYear)
            }
            if (semester) {
              setCurrentSemester(semester)
              formik.setFieldValue('semester', semester)
            }
          }
        }

        // Fetch hostels
        const response: any = await hostelApi.getAll()
        setHostels(response.hostels || [])
      } catch (error) {
        toast.error('Failed to load initial data')
        console.error('Error fetching initial data:', error)
      }
    }

    fetchInitialData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user && currentAcademicYear) {
      const allBookings = [...(user.bookings || []), ...(user.reservations || [])];
      
      // The backend blocks any booking for the current academic session that is NOT 'cancelled'.
      // We must match this logic exactly.
      const hasActiveBookingThisSession = allBookings.some((b: any) => 
        b.academic_session_id === currentAcademicYear && 
        b.status?.toLowerCase() !== 'cancelled'
      );
      
      if (hasActiveBookingThisSession) {
        setHasRoom(true);
      } else {
        setHasRoom(false);
      }
    }
  }, [user, currentAcademicYear]);

  useEffect(() => {
    const fetchFloors = async () => {
      if (formik.values.hostelId) {
        try {
          const response: any = await hostelApi.getFloors(formik.values.hostelId)
          setFloors(response.floors || [])
          formik.setFieldValue('floorId', '')
          formik.setFieldValue('roomId', '')
          formik.setFieldValue('bedId', '')
          setSelectedRoom(null)
        } catch (error) {
          toast.error('Failed to load floors')
        }
      } else {
        setFloors([])
      }
    }
    fetchFloors()
  }, [formik.values.hostelId])

  useEffect(() => {
    const fetchRooms = async () => {
      if (formik.values.floorId && formik.values.hostelId) {
        try {
          const response: any = await hostelApi.getFloorRooms(formik.values.hostelId, formik.values.floorId)
          setRooms(response.rooms || [])
          formik.setFieldValue('roomId', '')
          formik.setFieldValue('bedId', '')
          setSelectedRoom(null)
        } catch (error) {
          toast.error('Failed to load rooms')
        }
      } else {
        setRooms([])
      }
    }
    fetchRooms()
  }, [formik.values.floorId, formik.values.hostelId])

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (formik.values.roomId && formik.values.hostelId && formik.values.floorId) {
        try {
          const response: any = await hostelApi.getRoomDetails(
            formik.values.hostelId,
            formik.values.floorId,
            formik.values.roomId
          )
          const roomData = response.room
          setSelectedRoom(roomData || null)
          const mappedBeds = (roomData?.beds || []).map((b: any) => ({
            ...b,
            isOccupied: !b.isAvailable
          }))
          setBeds(mappedBeds)
          formik.setFieldValue('bedId', '')
        } catch (error) {
          toast.error('Failed to load room details')
        }
      } else {
        setSelectedRoom(null)
        setBeds([])
      }
    }
    fetchRoomDetails()
  }, [formik.values.roomId, formik.values.hostelId, formik.values.floorId])

  // Real-time bed updates
  useEffect(() => {
    if (!selectedRoom) return

    const channel = supabase
      .channel('room-booking-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'beds',
          filter: `room_id=eq.${selectedRoom.id}`,
        },
        (payload: any) => {
          // Update bed state immediately
          setBeds((currentBeds) => 
            currentBeds.map((bed) => {
              if (bed.id === payload.new.id) {
                return {
                  ...bed,
                  isOccupied: !payload.new.is_available,
                }
              }
              return bed
            })
          )
          
          // If the selected bed just got taken by someone else
          if (payload.new.id === formik.values.bedId && !payload.new.is_available) {
             toast.error('This bed was just booked by another student.')
             formik.setFieldValue('bedId', '')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedRoom, formik.values.bedId])

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.booking-hero', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )
      gsap.fromTo('.step-card',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.3, ease: 'power3.out' }
      )
      gsap.fromTo('.summary-card',
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.8, delay: 0.5, ease: 'power3.out' }
      )
    })
    return () => ctx.revert()
  }, [])

  const handleBedSelect = (bedId: string) => {
    formik.setFieldValue('bedId', bedId)
    setTimeout(() => {
      document.getElementById('step-summary')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const scrollToStep = (stepId: string) => {
    setTimeout(() => {
      document.getElementById(stepId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const selectedHostel = hostels.find(h => h.id === formik.values.hostelId)
  const selectedFloor = floors.find(f => f.id === formik.values.floorId)
  const availableBeds = selectedRoom ? beds : []

  if (hasRoom) {
    const allBookings = [...(user?.bookings || []), ...(user?.reservations || [])];
    const activeBooking = allBookings.find((b: any) => 
      b.academic_session_id === currentAcademicYear && 
      b.status?.toLowerCase() !== 'cancelled'
    );
    const hostelName = activeBooking?.room?.hostel?.name || activeBooking?.hostel?.name || 'Assigned Hostel';
    const roomNumber = activeBooking?.room?.room_number || '';
    const bookingStatus = activeBooking?.status || 'pending_payment';
    const bookingDate = activeBooking?.created_at ? new Date(activeBooking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    return (
      <div className="max-w-[1600px] mx-auto py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden booking-hero">
            <div className="bg-[#003366] p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-[#B8860B]" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-[#B8860B]">Booking confirmed</h2>
              </div>
              <h1 className="text-2xl font-black tracking-tight">Your room has been reserved</h1>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-2">
                {formik.values.academicYear} &middot; {formik.values.semester}
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hostel</p>
                  <p className="font-black text-slate-900 tracking-tight">{hostelName}</p>
                </div>
                {roomNumber && (
                  <div className="bg-slate-50 p-5 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Room</p>
                    <p className="font-black text-slate-900 tracking-tight">Room {roomNumber}</p>
                  </div>
                )}
                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Status</p>
                  <p className="font-black text-amber-700 tracking-tight capitalize">{bookingStatus.replace(/_/g, ' ')}</p>
                </div>
                {bookingDate && (
                  <div className="bg-slate-50 p-5 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booked on</p>
                    <p className="font-black text-slate-900 tracking-tight">{bookingDate}</p>
                  </div>
                )}
              </div>

              {bookingStatus === 'pending_payment' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <p className="text-xs font-bold text-amber-800">
                    Complete your payment to secure this room. Unpaid reservations may be released.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  onClick={() => router.push('/student/payments')}
                  className="w-full py-5 text-xs font-black uppercase tracking-widest bg-[#003366] hover:bg-[#1A5F9E] text-white rounded-2xl shadow-lg shadow-[#003366]/20"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Go to Payments
                </Button>
                <Button 
                  onClick={() => router.push('/student/dashboard')}
                  variant="outline"
                  className="w-full py-5 text-xs font-black uppercase tracking-widest rounded-2xl border-2"
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!bookingEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center booking-hero">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">System Closed</h2>
          <p className="text-gray-600 mb-8">
            The room booking system is currently closed. Please contact administration for more information.
          </p>
          <Button 
            onClick={() => router.push('/student/dashboard')}
            className="w-full py-6"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center booking-hero">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Booking Placed!</h2>
          <p className="text-gray-600 mb-8">
            Your room has been successfully reserved. You must now complete your payment to secure the room.
          </p>
          <Button 
            onClick={() => router.push('/student/payments')}
            className="w-full py-6 text-lg bg-[#003366] hover:bg-[#1A5F9E] text-white"
          >
            Proceed to Payment
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="page-header bg-white p-10 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 booking-hero">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#003366]/5 rounded-xl">
              <Calendar className="w-5 h-5 text-[#003366]" />
            </div>
            <span className="text-[#003366] font-black uppercase tracking-widest text-[10px]">Room Booking</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Secure Your <span className="text-[#B8860B]">Space</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex flex-wrap items-center gap-2">
            Academic Year: <span className="text-slate-900">{formik.values.academicYear}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            Semester: <span className="text-slate-900">{formik.values.semester}</span>
          </p>
        </div>
      </div>

      <div>
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Panel: Booking Flow */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={formik.handleSubmit}>
              
              {/* Step 1: Hostel Selection */}
              <div id="step-1" className="step-card relative pl-8 pb-8 border-l-2 border-[#003366]/20 last:border-0">
                <div className={`absolute -left-[11px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${formik.values.hostelId ? 'border-[#003366] text-[#003366]' : 'border-slate-300 text-slate-300'}`}>
                  {formik.values.hostelId ? <Check className="w-3 h-3" /> : <span className="text-[10px] font-black">1</span>}
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-[#003366]/20 transition-all duration-300 p-0">
                  <div className="p-8 border-b-2 border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Hostel</h3>
                  </div>
                  <div className="p-8">
                    {hostels.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest">Loading hostels...</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {hostels.map((hostel) => (
                          <div
                            key={hostel.id}
                            onClick={() => {
                              formik.setFieldValue('hostelId', hostel.id)
                              scrollToStep('step-2')
                            }}
                            className={`
                              group relative p-4 rounded-3xl border-2 cursor-pointer transition-all duration-200
                              ${formik.values.hostelId === hostel.id
                                ? 'border-[#003366] bg-[#003366]/5 shadow-sm'
                                : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                              }
                            `}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={`p-3 rounded-2xl ${formik.values.hostelId === hostel.id ? 'bg-[#003366]/10 text-[#003366]' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm'}`}>
                                <Building className="w-5 h-5" />
                              </div>
                              {formik.values.hostelId === hostel.id && (
                                <span className="flex items-center text-[9px] font-black uppercase tracking-widest text-[#003366] bg-white px-2 py-1 rounded-full shadow-sm">
                                  Selected
                                </span>
                              )}
                            </div>
                            <h4 className="font-black text-slate-900 mb-1 tracking-tight">{hostel.name}</h4>
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <span>Code: {hostel.code}</span>
                              <span>{hostel.totalFloors} Floors</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Floor Selection */}
              <div id="step-2" className={`step-card relative pl-8 pb-8 border-l-2 border-[#003366]/20 last:border-0 ${!formik.values.hostelId ? 'opacity-50 grayscale' : ''}`}>
                <div className={`absolute -left-[11px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${formik.values.floorId ? 'border-[#003366] text-[#003366]' : 'border-slate-300 text-slate-300'}`}>
                  {formik.values.floorId ? <Check className="w-3 h-3" /> : <span className="text-[10px] font-black">2</span>}
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-100 overflow-hidden hover:shadow-xl hover:border-[#003366]/20 transition-all duration-300 p-0">
                  <div className="p-8 border-b-2 border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Floor</h3>
                    {user?.gender && (
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Showing {user.gender.toLowerCase() === 'female' ? 'odd' : 'even'}-numbered floors for your gender
                      </p>
                    )}
                  </div>
                  <div className="p-8">
                    {!formik.values.hostelId ? (
                      <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        Please select a hostel first to view floors
                      </div>
                    ) : floors.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest">Loading floors...</div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {floors
                          .filter(f => {
                            if (!user?.gender) return true;
                            const isOddFloor = f.floorNumber % 2 !== 0;
                            const gender = user.gender.toLowerCase().trim();
                            const isFemale = gender === 'female' || gender === 'f';
                            const isMale = gender === 'male' || gender === 'm';
                            
                            if (isFemale && !isOddFloor) return false;
                            if (isMale && isOddFloor) return false;
                            return true;
                          })
                          .map((floor) => (
                            <button
                              key={floor.id}
                              type="button"
                              onClick={() => {
                                formik.setFieldValue('floorId', floor.id)
                                scrollToStep('step-3')
                              }}
                              className={`
                                flex items-center gap-2 px-5 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all duration-200
                                ${formik.values.floorId === floor.id
                                  ? 'bg-[#003366] text-white border-[#003366] shadow-lg shadow-[#003366]/20 transform scale-105'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }
                              `}
                            >
                              <Layers className="w-4 h-4" />
                              {formatFloorName(floor.floorNumber)}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3: Room Selection */}
              <div id="step-3" className={`step-card relative pl-8 pb-8 border-l-2 border-[#003366]/20 last:border-0 ${!formik.values.floorId ? 'opacity-50 grayscale' : ''}`}>
                 <div className={`absolute -left-[11px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${formik.values.roomId ? 'border-[#003366] text-[#003366]' : 'border-slate-300 text-slate-300'}`}>
                  {formik.values.roomId ? <Check className="w-3 h-3" /> : <span className="text-[10px] font-black">3</span>}
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-100 overflow-hidden hover:shadow-xl hover:border-[#003366]/20 transition-all duration-300 p-0">
                  <div className="p-8 border-b-2 border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Room</h3>
                  </div>
                  <div className="p-8">
                    {!formik.values.floorId ? (
                      <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        Please select a floor first to view rooms
                      </div>
                    ) : rooms.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest">Loading rooms...</div>
                    ) : (
                      <div className="space-y-4">
                        {rooms.filter(room => room.availableBeds === undefined || room.availableBeds > 0).length === 0 ? (
                          <div className="text-center py-10 bg-rose-50 rounded-2xl border border-dashed border-rose-200">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                              <DoorOpen className="w-6 h-6 text-rose-400" />
                            </div>
                            <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest mb-1">Floor Fully Occupied</h4>
                            <p className="text-xs font-bold text-rose-600">There are no available spaces on this floor. Please select a different floor.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {rooms
                              .filter(room => room.availableBeds === undefined || room.availableBeds > 0)
                              .map((room) => (
                                <div
                                  key={room.id}
                                  onClick={() => {
                                    formik.setFieldValue('roomId', room.id)
                                    scrollToStep('step-4')
                                  }}
                                  className={`
                                    group relative p-4 rounded-3xl border-2 cursor-pointer transition-all duration-200 overflow-hidden
                                    ${formik.values.roomId === room.id
                                      ? 'border-[#003366] bg-[#003366]/5 shadow-sm'
                                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                    }
                                  `}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="font-black text-slate-900 tracking-tight">Room {room.roomNumber}</span>
                                    <DoorOpen className={`w-5 h-5 ${formik.values.roomId === room.id ? 'text-[#003366]' : 'text-slate-400 group-hover:text-[#003366]'}`} />
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-1 mt-2">
                                    <span className={
                                      room.capacity === 4 ? "text-[#003366] bg-[#003366]/10 px-2 py-1 rounded-full" : 
                                      room.capacity === 2 ? "text-orange-600 bg-orange-100 px-2 py-1 rounded-full" : 
                                      "text-slate-600 bg-slate-100 px-2 py-1 rounded-full"
                                    }>
                                      {room.capacity} in 1 ({room.type || room.roomType || 'Standard'})
                                    </span>
                                    {room.availableBeds !== undefined && (
                                      <span className={`px-2 py-1 rounded-full ${
                                        room.availableBeds === 0 
                                          ? "text-rose-600 bg-rose-50" 
                                          : room.availableBeds === 1
                                            ? "text-amber-600 bg-amber-50"
                                            : "text-emerald-600 bg-emerald-50"
                                      }`}>
                                        {room.availableBeds} / {room.capacity} Available
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 4: Bed Selection */}
              <div id="step-4" className={`step-card relative pl-8 pb-8 border-l-2 border-[#003366]/20 last:border-0 ${!formik.values.roomId ? 'opacity-50 grayscale' : ''}`}>
                 <div className={`absolute -left-[11px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${formik.values.bedId ? 'border-[#003366] text-[#003366]' : 'border-slate-300 text-slate-300'}`}>
                  {formik.values.bedId ? <Check className="w-3 h-3" /> : <span className="text-[10px] font-black">4</span>}
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-100 overflow-hidden hover:shadow-xl hover:border-[#003366]/20 transition-all duration-300 p-0">
                  <div className="p-8 border-b-2 border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Bed</h3>
                  </div>
                  <div className="p-8">
                    {!formik.values.roomId ? (
                      <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-widest">
                         Select a room to see available beds
                      </div>
                    ) : beds.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest">No beds information available</div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {availableBeds.map((bed) => (
                          <div
                            key={bed.id}
                            onClick={() => !bed.isOccupied && handleBedSelect(bed.id)}
                            className={`
                              relative p-8 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3
                              ${bed.isOccupied 
                                ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' 
                                : formik.values.bedId === bed.id
                                ? 'border-[#003366] bg-[#003366]/5 shadow-md transform scale-105 z-10'
                                : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md hover:-translate-y-1 cursor-pointer'
                              }
                            `}
                          >
                            <div className={`p-3 rounded-2xl ${
                               bed.isOccupied ? 'bg-slate-100 text-slate-400' : 
                               formik.values.bedId === bed.id ? 'bg-[#003366]/10 text-[#003366]' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              <BedIcon className="w-6 h-6" />
                            </div>
                            
                            <div className="text-center">
                              <div className="font-black text-slate-900 text-lg tracking-tight">Bed {bed.bedNumber}</div>
                              
                              {['1', '3'].includes(bed.bedNumber) && (
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Down Bed</div>
                              )}
                              {['2', '4'].includes(bed.bedNumber) && (
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Top Bed</div>
                              )}

                              {bed.isOccupied ? (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 rounded-md">
                                  Occupied
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md ${
                                  formik.values.bedId === bed.id ? 'text-[#003366] bg-white shadow-sm' : 'text-emerald-600 bg-emerald-100'
                                }`}>
                                  Available
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Right Panel: Summary & Action */}
          <div id="step-summary" className="lg:col-span-4 mt-8 lg:mt-0 summary-card">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 bg-[#003366] text-white">
                  <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#B8860B]" />
                    Booking Summary
                  </h3>
                  <p className="text-white/70 text-xs mt-1 font-bold">Review your selection</p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Selection Summary */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border-none">
                      <Building className={`w-5 h-5 mt-0.5 ${selectedHostel ? 'text-[#003366]' : 'text-slate-300'}`} />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Hostel</p>
                        <p className="text-sm font-bold text-slate-900">{selectedHostel?.name || 'Not Selected'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border-none">
                      <Layers className={`w-5 h-5 mt-0.5 ${selectedFloor ? 'text-[#003366]' : 'text-slate-300'}`} />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Floor</p>
                        <p className="text-sm font-bold text-slate-900">{selectedFloor ? `Floor ${selectedFloor.floorNumber}` : 'Not Selected'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border-none">
                      <DoorOpen className={`w-5 h-5 mt-0.5 ${selectedRoom ? 'text-[#003366]' : 'text-slate-300'}`} />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Room</p>
                        <p className="text-sm font-bold text-slate-900">{selectedRoom ? `Room ${selectedRoom.roomNumber}` : 'Not Selected'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border-none">
                      <BedIcon className={`w-5 h-5 mt-0.5 ${formik.values.bedId ? 'text-[#003366]' : 'text-slate-300'}`} />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Bed</p>
                        <p className="text-sm font-bold text-slate-900">
                           {formik.values.bedId 
                             ? `Bed ${availableBeds.find(b => b.id === formik.values.bedId)?.bedNumber}` 
                             : 'Not Selected'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <Button
                    type="button"
                    onClick={() => formik.handleSubmit()}
                    disabled={isBooking || !formik.values.bedId}
                    className="w-full py-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-[#003366]/20 hover:shadow-[#003366]/40 transition-all hover:-translate-y-0.5 rounded-2xl bg-[#003366] text-white hover:bg-[#1A5F9E]"
                  >
                    {isBooking ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                  {!formik.values.bedId && (
                    <p className="text-[10px] font-bold text-center text-slate-400 mt-3 flex items-center justify-center gap-1 uppercase tracking-widest">
                      <Info className="w-3 h-3" /> Complete all steps to enable booking
                    </p>
                  )}
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-[#B8860B]/10 rounded-2xl p-4 border-none flex gap-3">
                <ShieldCheck className="w-5 h-5 text-[#B8860B] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-slate-900 text-xs mb-1 uppercase tracking-widest">
                    Secure Booking
                  </h4>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    Your booking is secured immediately upon confirmation. Room fees will be correctly calculated and added to your bill for the {currentAcademicYear} academic year.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
