'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { gsap } from 'gsap'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { formatIndexNumber } from '@/lib/formatters'
import { Users, MessageCircle, Phone, Mail } from 'lucide-react'
import ChatDrawer from '@/components/chat/ChatDrawer'
import { fetchApi } from '@/lib/apiClient';
import { LoadingPage } from '@/components/ui/loading';

interface Roommate {
  id: string
  name: string
  indexNumber: string
  program: string
  yearOfStudy: string
  email: string
  phone: string
  profileImage?: string
  bedNumber: string
  checkInDate: string
  isAvailable: boolean
  isMe?: boolean
  unreadCount?: number
}

export default function RoommateDetails() {
  const [roommates, setRoommates] = useState<Roommate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [roomInfo, setRoomInfo] = useState<{ roomNumber: string, hostelName: string } | null>(null)
  const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'student')) {
      router.push('/login')
      return
    }

    const fetchRoommates = async () => {
      try {
        setIsLoading(true)
        const response = await fetchApi('/api/roommates')
        const data = await response.json()
        
        if (response.ok) {
          setRoommates(data.roommates || [])
          setRoomInfo(data.roomInfo)
        }
      } catch (error) {
        console.error('Failed to fetch roommates:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoommates()
  }, [user, router])

  useEffect(() => {
    if (isLoading) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      
      tl.fromTo('.page-header',
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )
      .fromTo('.roommate-cards',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      )
    })

    return () => ctx.revert()
  }, [isLoading])

  const handleSendMessage = (roommate: Roommate) => {
    setSelectedRoommate(roommate)
    setIsChatOpen(true)
  }

  const handleCall = (phoneNumber: string) => {
    // Handle call functionality
    window.open(`tel:${phoneNumber}`)
  }



  const handleEmail = (email: string) => {
    // Handle email functionality
    window.open(`mailto:${email}`)
  }

  if (isLoading) {
    return (
      <LoadingPage />
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="bg-white rounded-xl p-10 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 page-header">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Roommate <span className="text-[#003366]">Details</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {roomInfo ? `View information about your roommates in ${roomInfo.hostelName}, Room ${roomInfo.roomNumber}` : 'View information about your roommates'}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
              <Users className="w-5 h-5 text-[#003366]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{roommates.length} Roommates</span>
            </div>
          </div>

          {/* Roommate Cards */}
          <div className="roommate-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roommates.map((roommate) => (
              <div 
                key={roommate.id} 
                className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 transition-colors hover:border-slate-300 overflow-hidden"
              >
                {/* Header with name */}
                <div className="bg-[#003366] p-6 text-white relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-black backdrop-blur-sm">
                      {roommate.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-lg tracking-tight leading-tight">
                        {roommate.name}
                        {roommate.isMe && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-[#B8860B] text-white">
                            You
                          </span>
                        )}
                      </h3>
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">{roommate.program}</p>
                    </div>
                  </div>
                </div>

                {/* Info grid */}
                <div className="p-6 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Room</p>
                      <p className="font-black text-slate-900 tracking-tight">{roomInfo?.roomNumber || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Bed</p>
                      <p className="font-black text-slate-900 tracking-tight">{roommate.bedNumber}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Phone</p>
                    <p className="font-black text-slate-900 tracking-tight">{roommate.phone}</p>
                  </div>

                  {/* Contact Actions */}
                  {!roommate.isMe ? (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button 
                        onClick={() => handleSendMessage(roommate)}
                        className="flex items-center justify-center px-4 py-3.5 rounded-xl bg-[#003366] text-white hover:bg-[#1A5F9E] transition-colors text-[10px] font-black uppercase tracking-widest shadow-md shadow-[#003366]/10"
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                        Message
                      </button>
                      <button 
                        onClick={() => handleCall(roommate.phone)}
                        className="flex items-center justify-center px-4 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-[#003366]/30 hover:bg-[#003366]/5 hover:text-[#003366] transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                        <Phone className="w-3.5 h-3.5 mr-1.5" />
                        Call
                      </button>
                    </div>
                  ) : (
                    <div className="w-full py-4 px-6 rounded-xl bg-slate-50 border border-slate-100 text-center mt-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Your card
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {roommates.length === 0 && (
            <div className="bg-white rounded-xl p-16 text-center border border-slate-200 shadow-sm mt-8">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Roommates Found</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto mb-6">
                You don&apos;t have any roommates assigned yet, or you haven&apos;t been allocated to a room.
              </p>
              <Button onClick={() => router.push('/student/room-booking')} className="bg-[#003366] text-white hover:bg-[#1A5F9E] text-[10px] font-black uppercase tracking-widest py-6 px-8 rounded-xl shadow-lg shadow-[#003366]/20 transition-all hover:-translate-y-0.5">
                Book a Room
              </Button>
            </div>
          )}
        </div>
      </div>
      <ChatDrawer 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        recipient={selectedRoommate ? {
          id: selectedRoommate.id,
          name: selectedRoommate.name,
          status: selectedRoommate.isAvailable ? 'online' : 'offline'
        } : null} 
      />
    </div>
  )
}
