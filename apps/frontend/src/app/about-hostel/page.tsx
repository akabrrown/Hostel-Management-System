'use client'

import { useEffect, useRef, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import Footer from '@/components/ui/footer'
import { fetchApi } from '@/lib/apiClient'
import { MapPin, Users, Info, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import styles from './page.module.css'

interface Hostel {
  id: string
  name: string
  address: string
  description: string
  capacity?: number
  gender: 'Male' | 'Female' | 'Mixed'
  images: string[]
  totalBeds: number
  availableBeds: number
  pricePerSemester?: number
  roomTypes?: {
    id: string
    name: string
    capacity: number
    price: number
  }[]
}

export default function AboutHostel() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [loading, setLoading] = useState(true)
  
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadHostels() {
      try {
        const response = await fetchApi('/api/hostels')
        const data = await response.json()
        setHostels(data.hostels || [])
      } catch (error) {
        console.error('Failed to load hostels:', error)
      } finally {
        setLoading(false)
      }
    }
    loadHostels()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || loading) return

    const initAnimations = async () => {
      try {
        const { gsap } = await import('gsap')
        const tl = gsap.timeline()
        
        tl.fromTo(titleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        )

        if (gridRef.current && gridRef.current.children.length > 0) {
          tl.fromTo(gridRef.current.children,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
            '-=0.4'
          )
        }
      } catch (error) {
        console.warn('GSAP failed:', error)
      }
    }

    setTimeout(initAnimations, 100)
  }, [loading])

  return (
    <div className={styles.container}>
      <Navbar />
      
      <section ref={heroRef} className={styles.hero}>
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 ref={titleRef} className={styles.heroTitle}>
            Premium Living at UPSA
          </h1>
          <p className={styles.heroSubtitle}>
            Discover our world-class hostel facilities designed for comfort, security, and academic excellence.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={gridRef} className={styles.grid}>
          {loading ? (
            // Skeleton loaders
            [1, 2, 3].map((i) => (
              <div key={i} className={styles.card} style={{ height: '500px' }}>
                <div className={`${styles.imageWrapper} ${styles.skeleton}`} />
                <div className={styles.content}>
                  <div className={`${styles.skeleton}`} style={{ height: '2rem', width: '60%', marginBottom: '1rem' }} />
                  <div className={`${styles.skeleton}`} style={{ height: '1rem', width: '80%', marginBottom: '2rem' }} />
                  <div className={`${styles.skeleton}`} style={{ height: '4rem', width: '100%' }} />
                </div>
              </div>
            ))
          ) : hostels.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Info className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No Hostels Found</h3>
              <p className="text-slate-500">Check back later for available accommodation.</p>
            </div>
          ) : (
            hostels.map((hostel) => (
              <article key={hostel.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  {/* Using standard img tag with object-fit for reliable rendering of external URLs */}
                  <img
                    src={hostel.images?.[0] || '/UPSA.jpg'}
                    alt={hostel.name}
                    className={styles.image}
                    loading="lazy"
                  />
                  <div className={styles.badge}>
                    {hostel.gender} Only
                  </div>
                </div>
                
                <div className={styles.content}>
                  <h2 className={styles.hostelName}>{hostel.name}</h2>
                  
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hostel.address || 'UPSA Campus')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.locationLink}
                  >
                    <MapPin className="h-4 w-4" />
                    <span>{hostel.address || 'UPSA Campus'} - View Map</span>
                  </a>
                  
                  <p className={styles.description}>
                    {hostel.description || 'Experience premium living with modern amenities and a vibrant student community.'}
                  </p>
                  
                  <div className={styles.stats}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{hostel.totalBeds}</span>
                      <span className={styles.statLabel}>Total Capacity</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{hostel.availableBeds}</span>
                      <span className={styles.statLabel}>Available Beds</span>
                    </div>
                  </div>
                  
                  {hostel.roomTypes && hostel.roomTypes.length > 0 && (
                    <div className={styles.pricing}>
                      <h4 className={styles.pricingTitle}>Room Pricing (Per Semester)</h4>
                      <div className={styles.pricingGrid}>
                        {hostel.roomTypes.map((rt, idx) => (
                          <div key={idx} className={styles.pricingItem}>
                            <span className={styles.pricingName}>{rt.name}</span>
                            <span className={styles.pricingValue}>GH₵{rt.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
