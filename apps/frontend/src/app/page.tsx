'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import Footer from '@/components/ui/footer'
import Button from '@/components/ui/button'
import { ArrowRight, Building } from 'lucide-react'
import styles from './page.module.css'

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only run animations on client side
    if (typeof window === 'undefined') return

    const initAnimations = async () => {
      try {
        const { gsap } = await import('gsap')

        // Hero entrance animations
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

        tl.fromTo(titleRef.current,
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1.2 }
        )
          .fromTo(subtitleRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 1 },
            '-=0.8'
          )
          .fromTo(ctaRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 1 },
            '-=0.8'
          )
      } catch (error) {
        console.warn('GSAP animations failed to load:', error)
      }
    }

    initAnimations()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      {/* Enhanced Hero Section */}
      <section ref={heroRef} className={styles.heroSection}>
        <div className={styles.overlay}></div>

        <div className={styles.contentWrapper}>
          <h1 ref={titleRef} className={styles.heroTitle}>
            Your Home Away From
            <br />
            Home
          </h1>

          <p ref={subtitleRef} className={styles.heroSubtitle}>
            Experience comfortable, secure, and premium hostel living at UPSA.
            Modern amenities and a supportive community designed exclusively for your academic success.
          </p>

          <div ref={ctaRef} className={styles.ctaContainer}>
            <Link href="/login">
              <Button size="lg" className={`px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white border-0 ${styles.primaryButton}`}>
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/about-hostel">
              <Button variant="outline" size="lg" className={`px-8 py-4 ${styles.glassButton}`}>
                <Building className="mr-2 h-5 w-5" />
                View Hostels
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* The Footer stays intact at the bottom */}
      <div className="mt-auto relative z-10 bg-white">
        <Footer />
      </div>
    </div>
  )
}
