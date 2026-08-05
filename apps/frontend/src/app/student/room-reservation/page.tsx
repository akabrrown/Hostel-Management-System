'use client'

import { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Button from '@/components/ui/button'
import { hostelApi, roomApi, handleApiError } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { AlertCircle, Info, CreditCard, CheckCircle2 } from 'lucide-react'
import { fetchApi } from '@/lib/apiClient';
import { LoadingPage } from '@/components/ui/loading';

interface Hostel {
  id: string
  name: string
  code: string
  totalFloors: number
  availableRooms: number
}

interface Floor {
  id: string
  floorNumber: number
  totalRooms: number
  availableRooms: number
}

interface RoomType {
  id: string
  name: string
  capacity: number
  pricePerSemester: number
  description: string
}

const ReservationSchema = Yup.object().shape({
  hostelId: Yup.string().required('Hostel selection is required'),
  floorId: Yup.string().required('Floor selection is required'),
  roomTypeId: Yup.string().required('Room type selection is required'),
  specialRequests: Yup.string().optional(),
})

export default function RoomReservation() {
  const [currentStep, setCurrentStep] = useState(1)
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [reservationEnabled, setReservationEnabled] = useState(true)
  const [currentAcademicYear, setCurrentAcademicYear] = useState('')
  const [hasRoom, setHasRoom] = useState(false)
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      hostelId: '',
      floorId: '',
      roomTypeId: '',
      academicYear: '2023/2024',
      semester: 'First Semester',
      specialRequests: '',
    },
    validationSchema: ReservationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true)
      
      try {
        await roomApi.reserve({
          hostelId: values.hostelId,
          floorId: values.floorId,
          roomTypeId: values.roomTypeId,
          academicYear: values.academicYear,
          semester: values.semester,
          specialRequests: values.specialRequests,
        })
        
        toast.success('Reservation submitted successfully!')
        setReservationSuccess(true)
      } catch (error) {
        const message = handleApiError(error, 'Reservation failed')
        toast.error(message)
        console.error('Reservation failed:', error)
      } finally {
        setIsSubmitting(false)
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
        setIsLoading(true)
        
        // Always refresh profile on this page to prevent stale booking state
        dispatch(fetchProfile() as any)
        
        // Fetch system settings
        const settingsResponse = await fetchApi('/api/settings')
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          if (settingsData.data) {
            setReservationEnabled(settingsData.data.reservation_enabled === true)
            
            if (settingsData.data.current_academic_year) {
              setCurrentAcademicYear(settingsData.data.current_academic_year)
              formik.setFieldValue('academicYear', settingsData.data.current_academic_year)
            }
            if (settingsData.data.current_semester) {
              formik.setFieldValue('semester', settingsData.data.current_semester)
            }
          }
        }



        const response: any = await hostelApi.getAll()
        setHostels(response.hostels || [])
      } catch (error) {
        toast.error('Failed to load initial data')
        console.error('Error fetching initial data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user && currentAcademicYear) {
      const allBookings = [...(user.bookings || []), ...(user.reservations || [])];
      
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
  }, [user, currentAcademicYear])

  const handleHostelChange = async (hostelId: string) => {
    formik.setFieldValue('hostelId', hostelId)
    formik.setFieldValue('floorId', '')
    formik.setFieldValue('roomTypeId', '')
    
    try {
      const response: any = await hostelApi.getFloors(hostelId)
      setFloors(response.floors || [])
      
      // Also set room types based on hostel pricing
      const selectedHostel = hostels.find(h => h.id === hostelId)
      if (selectedHostel && (selectedHostel as any).roomPricing) {
        const pricing = (selectedHostel as any).roomPricing
        const types: RoomType[] = [
          { id: 'single', name: 'Single Room', capacity: 1, pricePerSemester: pricing.single, description: 'Private room' },
          { id: 'double', name: 'Double Room', capacity: 2, pricePerSemester: pricing.double, description: 'Shared with 1 person' },
          { id: 'quadruple', name: 'Quadruple Room', capacity: 4, pricePerSemester: pricing.quadruple, description: 'Shared with 3 people' }
        ].filter(t => t.pricePerSemester > 0)
        setRoomTypes(types)
      }

      if (currentStep === 1) {
        setCurrentStep(2)
      }
    } catch (error) {
      toast.error('Failed to load floors')
    }
  }

  const handleFloorChange = (floorId: string) => {
    formik.setFieldValue('floorId', floorId)
    if (currentStep === 2) {
      setCurrentStep(3)
    }
  }

  const handleRoomTypeChange = (roomTypeId: string) => {
    formik.setFieldValue('roomTypeId', roomTypeId)
    if (currentStep === 3) {
      setCurrentStep(4)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formik.values.hostelId !== ''
      case 2:
        return formik.values.floorId !== ''
      case 3:
        return formik.values.roomTypeId !== ''
      default:
        return false
    }
  }

  const selectedHostel = hostels.find(h => h.id === formik.values.hostelId)
  const selectedFloor = floors.find(f => f.id === formik.values.floorId)
  const selectedRoomType = roomTypes.find(rt => rt.id === formik.values.roomTypeId)

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
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#003366] p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-[#B8860B]" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-[#B8860B]">Booking active</h2>
              </div>
              <h1 className="text-2xl font-black tracking-tight">You already have a room</h1>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-2">
                A separate reservation is not needed
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

  if (!reservationEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">System Closed</h2>
          <p className="text-gray-600 mb-8 text-lg">
            The room reservation system is currently closed. Please check back later or contact administration.
          </p>
          <Button 
            onClick={() => router.push('/student/dashboard')}
            className="w-full py-3"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (reservationSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="flex justify-center items-center min-h-screen">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reservation Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your room reservation has been submitted successfully. You will be notified once it&apos;s approved.
            </p>
            <Button onClick={() => router.push('/student/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <LoadingPage />
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      {/* Editorial Header */}
      <div className="page-header bg-white p-10 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Room <span className="text-[#003366]">Reservation</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex flex-wrap items-center gap-2">
            Reserve your spot for next semester
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black transition-all
                  ${currentStep >= step ? 'bg-[#003366] text-white shadow-lg shadow-[#003366]/20' : 'bg-slate-50 text-slate-400 border-2 border-slate-200'}
                `}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-full h-1.5 mx-3 rounded-full transition-all ${currentStep > step ? 'bg-[#003366]' : 'bg-slate-100'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 px-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hostel</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Floor</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Type</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Review</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10">
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8">Select Hostel</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hostels.map((hostel) => (
                  <div
                    key={hostel.id}
                    onClick={() => handleHostelChange(hostel.id)}
                    className={`
                      p-8 border rounded-xl cursor-pointer transition-all duration-300
                      ${formik.values.hostelId === hostel.id ? 'border-[#003366] bg-[#003366]/5' : 'border-slate-100 hover:border-[#003366]/20 hover:shadow-lg hover:bg-slate-50'}
                    `}
                  >
                    <h3 className="font-black text-slate-900 tracking-tight mb-2 text-lg">{hostel.name}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{hostel.code}</p>
                    <p className="text-[10px] font-bold text-[#003366] uppercase tracking-widest">{hostel.availableRooms} rooms available</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="mb-8">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Select Floor</h2>
                {user?.gender && (
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Showing {user.gender.toLowerCase() === 'female' ? 'odd' : 'even'}-numbered floors for your gender
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {floors
                  .filter(f => {
                    if (!user?.gender) return true;
                    const isOddFloor = f.floorNumber % 2 !== 0;
                    const gender = user.gender.toLowerCase();
                    if (gender === 'female' && !isOddFloor) return false;
                    if (gender === 'male' && isOddFloor) return false;
                    return true;
                  })
                  .map((floor) => (
                  <div
                    key={floor.id}
                    onClick={() => handleFloorChange(floor.id)}
                    className={`
                      p-8 border rounded-xl cursor-pointer text-center transition-all duration-300
                      ${formik.values.floorId === floor.id ? 'border-[#003366] bg-[#003366]/5' : 'border-slate-100 hover:border-[#003366]/20 hover:shadow-lg hover:bg-slate-50'}
                    `}
                  >
                    <div className="text-4xl font-black text-slate-900 tracking-tight mb-2">{floor.floorNumber}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Floor</div>
                    <div className="text-[10px] font-bold text-[#003366] uppercase tracking-widest">{floor.availableRooms} available</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8">Select Room Type</h2>
              <div className="space-y-4">
                {roomTypes.map((roomType) => (
                  <div
                    key={roomType.id}
                    onClick={() => handleRoomTypeChange(roomType.id)}
                    className={`
                      p-8 border rounded-xl cursor-pointer transition-all duration-300
                      ${formik.values.roomTypeId === roomType.id ? 'border-[#003366] bg-[#003366]/5' : 'border-slate-100 hover:border-[#003366]/20 hover:shadow-lg hover:bg-slate-50'}
                    `}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">{roomType.name}</h3>
                        <p className="text-sm font-medium text-slate-500 mb-4">{roomType.description}</p>
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">Capacity: {roomType.capacity} students</span>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-2xl font-black text-[#B8860B] tracking-tight">GHS {roomType.pricePerSemester}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">per semester</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8">Review Your Selection</h2>
              <form onSubmit={formik.handleSubmit}>
                <div className="space-y-8">
                  <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Selected Details</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hostel</span>
                        <span className="font-bold text-slate-900">{selectedHostel?.name}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Floor</span>
                        <span className="font-bold text-slate-900">Floor {selectedFloor?.floorNumber}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Room Type</span>
                        <span className="font-bold text-slate-900">{selectedRoomType?.name}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price</span>
                        <span className="font-black text-[#B8860B]">GHS {selectedRoomType?.pricePerSemester} <span className="text-slate-400 font-bold text-[10px]">/ semester</span></span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Academic Year</span>
                        <span className="font-bold text-slate-900">{formik.values.academicYear}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Semester</span>
                        <span className="font-bold text-slate-900">{formik.values.semester}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 px-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      {...formik.getFieldProps('specialRequests')}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#003366] focus:ring-4 focus:ring-[#003366]/10 transition-all font-medium text-slate-900"
                      placeholder="Any special requirements or preferences..."
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 text-xs font-black uppercase tracking-widest bg-[#003366] text-white hover:bg-[#1A5F9E] rounded-xl shadow-lg shadow-[#003366]/20 transition-all hover:-translate-y-0.5"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Reservation'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-8 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className="py-3 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={!canProceedToNext()}
                className="py-3 px-8 text-[10px] font-black uppercase tracking-widest rounded-xl bg-[#003366] text-white hover:bg-[#1A5F9E] shadow-md shadow-[#003366]/10 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
