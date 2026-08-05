'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { Navbar } from '@/components/layout/Navbar'
import Button from '@/components/ui/button'
import { Shield, LogIn, Home, HelpCircle } from 'lucide-react'
import styles from './forbidden.module.css'

export default function Forbidden() {
  useEffect(() => {
    // Animate the forbidden content
    const tl = gsap.timeline()
    
    tl.fromTo('.forbidden-icon',
      { opacity: 0, scale: 0.5, rotation: -180 },
      { opacity: 1, scale: 1, rotation: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.forbidden-title',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.6'
    )
    .fromTo('.forbidden-description',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.forbidden-actions',
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
          {/* Forbidden Icon */}
          <div className="forbidden-icon mb-8">
            <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-16 h-16 text-red-600" />
            </div>
          </div>

          {/* Error Title */}
          <h2 className="forbidden-title text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>

          {/* Error Description */}
          <p className="forbidden-description text-lg text-gray-600 mb-8">
            You don&apos;t have permission to access this page. Please log in with the appropriate 
            credentials or contact an administrator if you believe this is an error.
          </p>

          {/* Action Buttons */}
          <div className="forbidden-actions flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login">
              <Button size="lg" className="px-6 py-3">
                <LogIn className="w-5 h-5 mr-2" />
                Log In
              </Button>
            </Link>
            
            <Link href="/">
              <Button 
                variant="outline" 
                size="lg" 
                className="px-6 py-3"
              >
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>

          {/* Access Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6 text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-yellow-600" />
              Access Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Student Access</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Student Dashboard</li>
                  <li>• Room Booking System</li>
                  <li>• Payment Management</li>
                  <li>• Personal Profile</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Staff Access</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Admin: Full system management</li>
                  <li>• Porter: Check-in/out operations</li>
                  <li>• Director: Analytics and reports</li>
                  <li>• Staff: Role-specific tools</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Need help?</strong> If you believe you should have access to this page, 
                please contact your system administrator or the IT support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
