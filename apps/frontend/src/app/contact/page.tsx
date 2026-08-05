'use client'

import React from 'react'
import { Navbar } from '@/components/layout/Navbar'
import Footer from '@/components/ui/footer'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-slate-900 py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/UPSA.jpg')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Get in Touch
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Whether you have a question about room allocations, fees, or maintenance, our team is here to help you.
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 -mt-10 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Visit Us</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    University of Professional Studies, Accra<br />
                    P.O. Box LG 149<br />
                    Accra, Ghana
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Call Us</h3>
                  <p className="text-slate-600 text-sm mb-1">Main: +233 (0) 303 937 544</p>
                  <p className="text-slate-600 text-sm">Emergency: +233 (0) 303 937 545</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Email Us</h3>
                  <p className="text-slate-600 text-sm mb-1">Admissions: info@upsa.edu.gh</p>
                  <p className="text-slate-600 text-sm">Support: hostelsupport@upsa.edu.gh</p>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl text-white">
                <div className="flex items-center mb-4">
                  <Clock className="h-5 w-5 text-blue-400 mr-3" />
                  <h3 className="text-lg font-bold">Office Hours</h3>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>9:00 AM - 1:00 PM</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h2>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                      <input 
                        type="text" 
                        id="firstName" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                      <input 
                        type="text" 
                        id="lastName" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                        placeholder="john.doe@upsamail.edu.gh"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                      <select 
                        id="subject" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none bg-white"
                      >
                        <option value="">Select a subject...</option>
                        <option value="admission">Room Allocation</option>
                        <option value="maintenance">Maintenance Request</option>
                        <option value="fees">Fees & Payments</option>
                        <option value="other">Other Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                    <textarea 
                      id="message" 
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none resize-none"
                      placeholder="How can we help you today?"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200 flex items-center justify-center"
                  >
                    Send Message
                    <Send className="h-4 w-4 ml-2" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
