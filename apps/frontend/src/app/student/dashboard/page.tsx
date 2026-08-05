'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState, AppDispatch } from '@/store'
import { fetchProfile } from '@/store/slices/authSlice'
import Button from '@/components/ui/button'
import { Bed, CreditCard, Calendar, User, CheckCircle, Clock, AlertCircle, ArrowRight, Activity, Wallet } from 'lucide-react'
import { formatIndexNumber } from '@/lib/formatters'
import gsap from 'gsap'
import { fetchApi } from '@/lib/apiClient';
import { LoadingPage } from '@/components/ui/loading';

interface StudentData {
  firstName: string
  lastName: string
  indexNumber: string
  email: string
  phone: string
  accommodationStatus: 'allocated' | 'pending' | 'pending_payment' | 'none'
  room?: {
    hostel: string
    roomNumber: string
    bedNumber: string
  }
  paymentStatus: 'paid' | 'pending' | 'pending_payment' | 'overdue' | 'none'
}

interface Booking {
  id: string
  type: 'reservation' | 'booking'
  status: 'pending' | 'approved' | 'rejected' | 'active'
  createdAt: string
  details: {
    hostel?: string
    room?: string
    roomType?: string
  }
}

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({
    bookingEnabled: true,
    reservationEnabled: true
  })
  const [hasActiveRequest, setHasActiveRequest] = useState(false)
  const [keyStatus, setKeyStatus] = useState<string>('with_porter')
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    // Socket initialization
    import('@/lib/socket').then(({ initSocketClient, joinHostelRoom }) => {
      const socket = initSocketClient();
      if (user?.accommodation?.room?.hostel?.id) {
        joinHostelRoom(user.accommodation.room.hostel.id);
      }
      
      socket.on('key_status_changed', (data: any) => {
        if (data.room_id === user?.accommodation?.room?.id) {
          setKeyStatus(data.status);
        }
      });
    });
  }, [user]);

  useEffect(() => {
    if (!profileFetched) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profileFetched]);

  useEffect(() => {
    // The profileFetched guard has been moved belowloadData logic

    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Profile is fetched globally by SessionInitializer.

        // Fetch system settings
        const settingsResponse = await fetchApi('/api/settings')
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          if (settingsData.data) {
            setSettings({
              bookingEnabled: settingsData.data.booking_enabled === true,
              reservationEnabled: settingsData.data.reservation_enabled === true
            })
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (profileFetched && (!user || user.role !== 'student')) {
      setIsLoading(false)
      router.push('/login')
      return
    }

    loadData()
  }, [router, dispatch, profileFetched, user])

  useEffect(() => {
    if (user && user.role === 'student') {
      // Derive room info: first try accommodation, then fall back to the most recent booking with a room
      let roomInfo: { hostel: string; roomNumber: string; bedNumber: string } | undefined = undefined;
      
      if (user.accommodation?.room) {
        roomInfo = {
          hostel: user.accommodation.hostel?.name || user.accommodation.room?.floors?.blocks?.hostels?.name || '',
          roomNumber: user.accommodation.room.room_number || '',
          bedNumber: user.accommodation.bed_number || ''
        };
      } else if (user.bookings?.length) {
        const activeBooking = user.bookings.find((b: any) => 
          ['pending_payment', 'allocated', 'checked_in'].includes(b.status?.toLowerCase())
        );
        if (activeBooking?.room) {
          roomInfo = {
            hostel: activeBooking.hostel?.name || activeBooking.room?.floors?.blocks?.hostels?.name || '',
            roomNumber: activeBooking.room.room_number || '',
            bedNumber: ''
          };
        }
      }

      const mappedStudentData: StudentData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        indexNumber: user.indexNumber || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        accommodationStatus: user.accommodationStatus as 'pending' | 'pending_payment' | 'allocated' | 'none' || 'none',
        room: roomInfo,
        paymentStatus: user.paymentStatus as 'paid' | 'pending' | 'pending_payment' | 'overdue' | 'none' || 'none',
      }

      setStudentData(mappedStudentData)
      
      const allHistory: Booking[] = [
        ...(user.bookings || []).map((b: any) => ({
          id: b.id,
          type: 'booking' as const,
          status: b.status as any,
          createdAt: b.created_at || b.booked_at,
          details: {
            hostel: b.room?.hostel?.name,
            room: b.room?.room_number,
          }
        })),
        ...(user.reservations || []).map((r: any) => ({
          id: r.id,
          type: 'reservation' as const,
          status: r.status as any,
          createdAt: r.created_at,
          details: {
            hostel: r.room?.hostel?.name || 'Not assigned',
          }
        }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setBookings(allHistory)

      const hasRequest = 
        user.accommodationStatus === 'allocated' || 
        user.accommodationStatus === 'pending' ||
        allHistory.some(b => (b.status as string) === 'pending' || (b.status as string) === 'pending_payment' || (b.status as string) === 'approved' || (b.status as string) === 'active')
      
      setHasActiveRequest(hasRequest)
    }
  }, [user])

  // GSAP Entry Animation
  useEffect(() => {
    if (!isLoading && studentData) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.dashboard-hero', 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        )
        gsap.fromTo('.stat-card',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.2, ease: 'power3.out' }
        )
        gsap.fromTo('.dashboard-section',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, delay: 0.4, ease: 'power3.out' }
        )
      })
      return () => ctx.revert()
    }
  }, [isLoading, studentData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allocated':
      case 'active':
      case 'approved':
      case 'paid':
        return 'bg-emerald-100 text-emerald-700'
      case 'pending':
      case 'pending_payment':
        return 'bg-amber-100 text-amber-700'
      case 'none':
      case 'rejected':
        return 'bg-gray-100 text-gray-700'
      case 'overdue':
        return 'bg-rose-100 text-rose-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'allocated':
      case 'active':
      case 'approved':
      case 'paid':
        return <CheckCircle className="h-3.5 w-3.5" />
      case 'pending':
      case 'pending_payment':
        return <Clock className="h-3.5 w-3.5" />
      case 'none':
      case 'rejected':
        return <AlertCircle className="h-3.5 w-3.5" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <LoadingPage />
    )
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load student data</h2>
          <Button onClick={() => window.location.reload()} variant="outline">Refresh Page</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      {/* Editorial Hero */}
      <div className="page-header bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl dashboard-hero">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-[#003366]">{studentData?.firstName}</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Here&apos;s what&apos;s happening with your accommodation status today. Manage your bookings and payments all in one place.
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl group-hover:bg-[#003366]/5 group-hover:border-[#003366]/10 transition-colors">
              <User className="h-6 w-6 text-slate-400 group-hover:text-[#003366] transition-colors" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Index Number</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{formatIndexNumber(studentData.indexNumber)}</p>
          </div>
        </div>

        <div className="stat-card bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl border-2 transition-colors ${studentData.accommodationStatus === 'allocated' ? 'bg-emerald-50 border-emerald-100 group-hover:bg-emerald-100' : 'bg-amber-50 border-amber-100 group-hover:bg-amber-100'}`}>
              <Bed className={`h-6 w-6 transition-colors ${studentData.accommodationStatus === 'allocated' ? 'text-emerald-500 group-hover:text-emerald-600' : 'text-amber-500 group-hover:text-amber-600'}`} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Accommodation</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight capitalize">{studentData.accommodationStatus}</p>
          </div>
        </div>

        <div className="stat-card bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl border-2 transition-colors ${
              studentData.paymentStatus === 'paid' 
                ? 'bg-emerald-50 border-emerald-100 group-hover:bg-emerald-100' 
                : (studentData.paymentStatus === 'pending' || studentData.paymentStatus === 'pending_payment') 
                  ? 'bg-amber-50 border-amber-100 group-hover:bg-amber-100' 
                  : 'bg-rose-50 border-rose-100 group-hover:bg-rose-100'
            }`}>
              <Wallet className={`h-6 w-6 transition-colors ${
                studentData.paymentStatus === 'paid' 
                  ? 'text-emerald-500 group-hover:text-emerald-600' 
                  : (studentData.paymentStatus === 'pending' || studentData.paymentStatus === 'pending_payment') 
                    ? 'text-amber-500 group-hover:text-amber-600' 
                    : 'text-rose-500 group-hover:text-rose-600'
              }`} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Finance</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Status</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight capitalize">
              {studentData.paymentStatus === 'pending_payment' ? 'Pending Payment' : studentData.paymentStatus}
            </p>
          </div>
        </div>

        <div className="stat-card bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 border-2 border-indigo-100 rounded-2xl group-hover:bg-indigo-100 transition-colors">
              <Activity className="h-6 w-6 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Bookings</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {(studentData.accommodationStatus === 'allocated' ? 1 : 0) + bookings.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Room Information & Real-time Key Tracking */}
          {studentData.room && (
            <div className="dashboard-section bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="bg-[#003366] p-6 text-white border-b border-[#003366]">
                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Bed className="w-4 h-4 text-[#B8860B]" />
                  Current Allocation
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border-none">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hostel</p>
                  <p className="font-bold text-slate-900">{studentData.room.hostel}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border-none">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Room No.</p>
                  <p className="font-bold text-slate-900">{studentData.room.roomNumber}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border-none">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bed No.</p>
                  <p className="font-bold text-slate-900">{studentData.room.bedNumber}</p>
                </div>
                <div className="bg-[#B8860B]/10 p-4 rounded-2xl border-none">
                  <p className="text-[10px] font-black text-[#B8860B] uppercase tracking-widest mb-1">Key Status</p>
                  <p className="font-bold text-[#B8860B] capitalize">{keyStatus.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group relative bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:border-[#003366]/20 transition-colors overflow-hidden cursor-pointer"
                   onClick={() => {
                     if (settings.bookingEnabled && !hasActiveRequest) {
                       router.push('/student/room-booking')
                     }
                   }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:bg-[#003366]/5" />
                <div className="relative">
                  <div className="w-14 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-400 group-hover:bg-[#003366] group-hover:border-[#003366] group-hover:text-white transition-colors">
                    <Bed className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight group-hover:text-[#003366] transition-colors">Book a Room</h3>
                  <p className="text-xs font-bold text-slate-500 mb-6 max-w-[200px]">
                    {!settings.bookingEnabled 
                      ? 'System is currently closed' 
                      : hasActiveRequest 
                      ? 'You already have an active room' 
                      : 'Select and book an available room'}
                  </p>
                  <div className={`text-[10px] font-black uppercase tracking-widest flex items-center ${
                    (!settings.bookingEnabled || hasActiveRequest) ? 'text-slate-400' : 'text-[#003366] group-hover:gap-2 transition-all'
                  }`}>
                    {!settings.bookingEnabled ? 'Closed' : hasActiveRequest ? 'Allocated' : 'Start Booking'} 
                    {settings.bookingEnabled && !hasActiveRequest && <ArrowRight className="w-3 h-3 ml-1" />}
                  </div>
                </div>
              </div>

              <div className="group relative bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:border-[#B8860B]/20 transition-colors overflow-hidden cursor-pointer"
                   onClick={() => {
                      if (settings.reservationEnabled && !hasActiveRequest) {
                        router.push('/student/room-reservation')
                      }
                   }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:bg-[#B8860B]/5" />
                <div className="relative">
                  <div className="w-14 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-400 group-hover:bg-[#B8860B] group-hover:border-[#B8860B] group-hover:text-white transition-colors">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight group-hover:text-[#B8860B] transition-colors">Make Reservation</h3>
                  <p className="text-xs font-bold text-slate-500 mb-6 max-w-[200px]">
                    {!settings.reservationEnabled 
                      ? 'System is currently closed' 
                      : hasActiveRequest 
                      ? 'You already have an active room' 
                      : 'Reserve a spot for next semester'}
                  </p>
                  <div className={`text-[10px] font-black uppercase tracking-widest flex items-center ${
                    (!settings.reservationEnabled || hasActiveRequest) ? 'text-slate-400' : 'text-[#B8860B] group-hover:gap-2 transition-all'
                  }`}>
                    {!settings.reservationEnabled ? 'Closed' : hasActiveRequest ? 'Allocated' : 'Start Reservation'}
                    {settings.reservationEnabled && !hasActiveRequest && <ArrowRight className="w-3 h-3 ml-1" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Payment Quick Action */}
          <div className="dashboard-section bg-[#003366] rounded-2xl p-8 text-white shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <CreditCard className="w-6 h-6 text-[#B8860B]" />
              </div>
              <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm text-[#B8860B]">Secure</span>
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight relative z-10">Make Payment</h3>
            <p className="text-white/70 text-sm mb-8 relative z-10">Process your hostel fees securely online.</p>
            <Button onClick={() => window.open('https://student.upsa-ufis.com/#/auth/login', '_blank')} className="w-full bg-[#B8860B] text-white hover:bg-[#966D09] border-none rounded-2xl h-12 text-xs font-black uppercase tracking-widest relative z-10 shadow-lg shadow-black/20">
              Proceed to Pay
            </Button>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-section bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity</h3>
              <span className="text-[10px] text-[#003366] font-black uppercase tracking-widest cursor-pointer hover:underline">View All</span>
            </div>
            
            <div className="space-y-6">
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="p-4 bg-slate-50 rounded-2xl inline-block mb-3">
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recent activity found</p>
                </div>
              ) : (
                bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-start gap-4">
                    <div className={`mt-1 p-2.5 rounded-xl flex-shrink-0 ${
                      booking.type === 'booking' ? 'bg-[#003366]/5 text-[#003366]' : 'bg-[#B8860B]/10 text-[#B8860B]'
                    }`}>
                      {booking.type === 'booking' ? <Bed className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-900 capitalize">{booking.type}</p>
                        {/* Status Badge */}
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                        {booking.details.hostel || 'Hostel Request'}
                        {booking.details.room && ` • Room ${booking.details.room}`}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
