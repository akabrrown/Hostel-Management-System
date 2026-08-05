'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchProfile } from '@/store/slices/authSlice'
import Button from '@/components/ui/button'
import { User, Mail, Phone, MapPin, BookOpen, Calendar, Shield, CreditCard, Bed, AlertCircle } from 'lucide-react'
import { formatIndexNumber } from '@/lib/formatters'
import gsap from 'gsap'
import { LoadingPage } from '@/components/ui/loading';

export default function StudentProfile() {
  const router = useRouter()
  const { user, loading, profileFetched } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('personal')

  useEffect(() => {
    if (!profileFetched) {
      dispatch(fetchProfile() as any)
    }
  }, [dispatch, profileFetched])

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'student')) {
      router.push('/login')
    }
  }, [user, profileFetched, router])

  // GSAP Entry Animation
  useEffect(() => {
    if (!loading && user) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.profile-header-card',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        )
        gsap.fromTo('.profile-section-card',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, delay: 0.2, ease: 'power3.out' }
        )
      })
      return () => ctx.revert()
    }
  }, [loading, user])

  if (loading || (!profileFetched)) {
    return (
      <LoadingPage />
    )
  }

  if (!user) return null

  const studentProfile = {
    firstName: user.firstName || 'Not Available',
    lastName: user.lastName || 'Not Available',
    student_id: user.indexNumber || 'Not Available',
    gender: user.gender || 'Not Available',
    phoneNumber: user.phoneNumber || 'Not Available',
    email: user.email || 'Not Available',
    emergencyContact: {
      name: user.emergencyContact?.name || 'Not Available',
      phone: user.emergencyContact?.phone || 'Not Available',
      relationship: user.emergencyContact?.relationship || 'Not Available'
    },
    programOfStudy: user.programOfStudy || 'Not Available',
    yearOfStudy: user.yearOfStudy || null,
    academicYear: user.academicYear || 'Not Available',
    accommodation: user.accommodation
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 pt-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header Card */}
        <div className="profile-header-card bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-[#003366]/5 flex items-center justify-center text-4xl font-black text-[#003366] tracking-tight border border-slate-200">
                {studentProfile.firstName.charAt(0)}{studentProfile.lastName.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-white w-8 h-8 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                {studentProfile.firstName} {studentProfile.lastName}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <span className="px-3 py-1 bg-[#003366]/5 text-[#003366] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#003366]/10">
                  Student
                </span>
                <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                  {formatIndexNumber(studentProfile.student_id)}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {studentProfile.email}
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {studentProfile.phoneNumber}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
               <Button 
                onClick={() => router.push('/student/settings')}
                variant="outline"
                className="w-full justify-center text-xs font-black uppercase tracking-widest py-6 rounded-2xl border-2 hover:bg-slate-50"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity / Quick Stats Column */}
          <div className="space-y-6">
             {/* Quick Actions Card */}
             <div className="profile-section-card bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase tracking-widest mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <button 
                  onClick={() => router.push('/student/payments')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-[#003366]/5 hover:text-[#003366] transition-colors group text-left border border-transparent hover:border-slate-200"
                >
                  <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-shadow group-hover:text-[#003366]">
                    <CreditCard className="w-5 h-5 text-slate-400 group-hover:text-[#003366]" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight group-hover:text-[#003366]">Payment History</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">View transactions</p>
                  </div>
                </button>

                <button 
                  onClick={() => router.push('/student/room-booking')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-[#003366]/5 hover:text-[#003366] transition-colors group text-left border border-transparent hover:border-slate-200"
                >
                  <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-shadow group-hover:text-[#003366]">
                    <Bed className="w-5 h-5 text-slate-400 group-hover:text-[#003366]" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight group-hover:text-[#003366]">Room Booking</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage allocation</p>
                  </div>
                </button>

                <button 
                  onClick={() => router.push('/student/settings')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-[#003366]/5 hover:text-[#003366] transition-colors group text-left border border-transparent hover:border-slate-200"
                >
                  <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-shadow group-hover:text-[#003366]">
                    <Shield className="w-5 h-5 text-slate-400 group-hover:text-[#003366]" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight group-hover:text-[#003366]">Security</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Password & privacy</p>
                  </div>
                </button>
              </div>
            </div>


          </div>

          {/* Detailed Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Accommodation Summary */}
            <div className="profile-section-card bg-[#003366] rounded-2xl p-8 text-white shadow-sm overflow-hidden relative">
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <Bed className="w-5 h-5 text-[#B8860B]" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-[#B8860B]">Accommodation</h2>
              </div>
              
              {studentProfile.accommodation ? (
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Hostel</span>
                    <span className="font-bold">{studentProfile.accommodation.room?.hostel?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Room</span>
                    <span className="font-bold">Room {studentProfile.accommodation.room?.room_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Status</span>
                    <span className="font-black text-[#B8860B] capitalize">{(studentProfile.accommodation.status || 'allocated').replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Bed</span>
                    <span className="font-black text-[#B8860B]">Bed {studentProfile.accommodation.bed_number || 'N/A'}</span>
                  </div>
                </div>
              ) : (() => {
                const activeBooking = (user.bookings || []).find((b: any) => 
                  ['pending_payment', 'allocated', 'checked_in', 'pending', 'approved'].includes(b.status?.toLowerCase())
                );
                if (activeBooking) {
                  return (
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-center pb-4 border-b border-white/10">
                        <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Hostel</span>
                        <span className="font-bold">{activeBooking.room?.hostel?.name || 'Assigned'}</span>
                      </div>
                      {activeBooking.room?.room_number && (
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                          <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Room</span>
                          <span className="font-bold">Room {activeBooking.room.room_number}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Status</span>
                        <span className="font-black text-amber-400 capitalize">{(activeBooking.status || '').replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="text-center py-6 relative z-10">
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-6">No accommodation assigned yet.</p>
                    <Button 
                      onClick={() => router.push('/student/room-booking')}
                      className="w-full max-w-sm bg-[#B8860B] text-white hover:bg-[#966D09] border-none rounded-2xl py-6 text-xs font-black uppercase tracking-widest shadow-lg"
                    >
                      Apply Now
                    </Button>
                  </div>
                );
              })()}
            </div>

            {/* Academic Info */}
            <div className="profile-section-card bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <BookOpen className="w-5 h-5 text-slate-400" />
                </div>
                <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase tracking-widest">Academic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Program of Study</p>
                  <p className="font-bold text-slate-900 leading-tight">{studentProfile.programOfStudy}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Level</p>
                  <p className="font-bold text-slate-900">Year {studentProfile.yearOfStudy || 'N/A'}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Academic Year</p>
                  <p className="font-bold text-slate-900">{studentProfile.academicYear}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
