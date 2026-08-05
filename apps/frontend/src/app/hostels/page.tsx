'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { hostelApi } from '@/lib/api'
import { Search, Filter, MapPin, Users, Building, LayoutGrid, List, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/button'
import gsap from 'gsap'

interface Hostel {
  id: string
  name: string
  code: string
  totalFloors: number
  gender?: string
  description?: string
  address?: string
}

export default function HostelDiscoveryPage() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [filteredHostels, setFilteredHostels] = useState<Hostel[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [genderFilter, setGenderFilter] = useState('all')

  const router = useRouter()

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response: any = await hostelApi.getAll()
        const data = response.hostels || []
        setHostels(data)
        setFilteredHostels(data)
      } catch (error) {
        console.error('Failed to load hostels:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchHostels()
  }, [])

  useEffect(() => {
    let result = hostels

    if (searchQuery) {
      result = result.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.code.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (genderFilter !== 'all') {
      result = result.filter(h => h.gender?.toLowerCase() === genderFilter.toLowerCase())
    }

    setFilteredHostels(result)
  }, [searchQuery, genderFilter, hostels])

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.hostel-card', 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
        )
      })
      return () => ctx.revert()
    }
  }, [loading, filteredHostels, viewMode])

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#003366] py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://upsa.edu.gh/wp-content/uploads/2020/08/slide-7.jpg')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Discover Your <span className="text-[#B8860B]">Perfect Space</span>
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto font-medium mb-8">
            Browse through UPSA's modern hostel facilities and find the ideal accommodation for your academic journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search hostels by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-0 shadow-lg focus:ring-4 focus:ring-[#B8860B]/30 outline-none text-slate-900 font-medium"
              />
            </div>
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-0 shadow-lg focus:ring-4 focus:ring-[#B8860B]/30 outline-none text-slate-900 font-bold appearance-none cursor-pointer"
              >
                <option value="all">All Genders</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Available Hostels ({filteredHostels.length})
          </h2>
          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#003366]/5 text-[#003366]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#003366]/5 text-[#003366]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#003366]/20 border-t-[#003366] rounded-full animate-spin"></div>
          </div>
        ) : filteredHostels.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-slate-200">
            <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Hostels Found</h3>
            <p className="text-slate-500 font-medium">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
            {filteredHostels.map((hostel) => (
              <div 
                key={hostel.id} 
                className={`hostel-card bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 ${
                  viewMode === 'list' ? 'flex flex-col md:flex-row' : 'flex flex-col'
                }`}
              >
                <div className={`relative bg-slate-100 ${viewMode === 'list' ? 'md:w-1/3 min-h-[200px]' : 'h-48'} flex items-center justify-center p-8`}>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                   <Building className="w-16 h-16 text-slate-300 relative z-0 mix-blend-multiply" />
                   <div className="absolute top-4 right-4 z-20">
                     <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#003366] text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm">
                       {hostel.code}
                     </span>
                   </div>
                   <div className="absolute bottom-4 left-4 z-20">
                     <h3 className="text-white font-black text-xl tracking-tight">{hostel.name}</h3>
                   </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                    {hostel.description || 'Modern student accommodation located on UPSA campus offering secure and comfortable living spaces.'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-slate-700">
                        {hostel.address || 'UPSA Campus'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-slate-700 capitalize">
                        {hostel.gender || 'Mixed'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-3">
                    <Link href={`/hostels/${hostel.id}`} className="flex-1">
                      <Button variant="outline" className="w-full py-6 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] text-slate-600">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/student/room-booking?hostelId=${hostel.id}`} className="flex-1">
                      <Button className="w-full py-6 rounded-xl bg-[#003366] hover:bg-[#1A5F9E] text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#003366]/20 group">
                        Book Now
                        <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
