import Link from 'next/link'
import { MapPin, Phone, Mail, ChevronRight } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          
          {/* Brand & About */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">UPSA Hostel Management</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md mb-6">
              Providing premium, secure, and comfortable accommodation for students of the University of Professional Studies, Accra. Your home away from home.
            </p>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 mt-0.5 text-blue-500" />
                <span>P.O. Box LG 149, <br/>Accra, Ghana</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-blue-500" />
                <span>+233 (0) 303 937 544</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-blue-500" />
                <a href="mailto:info@upsa.edu.gh" className="hover:text-blue-400 transition-colors">info@upsa.edu.gh</a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about-hostel" className="group flex items-center hover:text-white transition-colors">
                  <ChevronRight className="h-3 w-3 mr-2 text-slate-600 group-hover:text-blue-500 transition-colors" />
                  View Hostels
                </Link>
              </li>
              <li>
                <Link href="/login" className="group flex items-center hover:text-white transition-colors">
                  <ChevronRight className="h-3 w-3 mr-2 text-slate-600 group-hover:text-blue-500 transition-colors" />
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/rules" className="group flex items-center hover:text-white transition-colors">
                  <ChevronRight className="h-3 w-3 mr-2 text-slate-600 group-hover:text-blue-500 transition-colors" />
                  Rules & Regulations
                </Link>
              </li>
              <li>
                <Link href="/contact" className="group flex items-center hover:text-white transition-colors">
                  <ChevronRight className="h-3 w-3 mr-2 text-slate-600 group-hover:text-blue-500 transition-colors" />
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} University of Professional Studies, Accra. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
