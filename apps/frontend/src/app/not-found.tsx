'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { Navbar } from '@/components/layout/Navbar'
import Button from '@/components/ui/button'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  useEffect(() => {
    // Animate the 404 content
    const tl = gsap.timeline()
    
    tl.fromTo('.error-number',
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.error-title',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.6'
    )
    .fromTo('.error-description',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.error-actions',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* 404 Number */}
          <div className="error-number mb-8">
            <div className="relative">
              <h1 className="text-9xl font-bold text-deepNavyBlue opacity-20">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Search className="w-16 h-16 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Title */}
          <h2 className="error-title text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>

          {/* Error Description */}
          <p className="error-description text-lg text-gray-600 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. 
            Let&apos;s get you back to where you need to be.
          </p>

          {/* Action Buttons */}
          <div className="error-actions flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="px-6 py-3">
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-6 py-3"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Looking for something specific?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Quick Links</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>
                    <Link href="/login" className="text-yellow-600 hover:text-yellow-700">
                      Login Page
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className="text-yellow-600 hover:text-yellow-700">
                      Sign Up
                    </Link>
                  </li>
                  <li>
                    <Link href="/student/dashboard" className="text-yellow-600 hover:text-yellow-700">
                      Student Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Help Resources</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>
                    <Link href="/help" className="text-yellow-600 hover:text-yellow-700">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-yellow-600 hover:text-yellow-700">
                      Contact Support
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-yellow-600 hover:text-yellow-700">
                      FAQs
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
