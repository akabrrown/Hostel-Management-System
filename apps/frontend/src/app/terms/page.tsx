'use client'

import React from 'react'
import { Navbar } from '@/components/layout/Navbar'
import Footer from '@/components/ui/footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-slate-500 mb-12">Last updated: August 2026</p>

          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-slate-600 leading-relaxed">
                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and the University of Professional Studies, Accra ("we", "us", or "our"), concerning your access to and use of the UPSA Hostel Management System website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Intellectual Property Rights</h2>
              <p className="text-slate-600 leading-relaxed">
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Representations</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                By using the Site, you represent and warrant that:
              </p>
              <ul className="list-disc pl-5 text-slate-600 space-y-2">
                <li>All registration information you submit will be true, accurate, current, and complete.</li>
                <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                <li>You are a registered student of the University of Professional Studies, Accra.</li>
                <li>You will not use the Site for any illegal or unauthorized purpose.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Fees and Payment</h2>
              <p className="text-slate-600 leading-relaxed">
                All accommodation fees are strictly non-refundable once paid, as stipulated in the official Hostel Rules and Regulations. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. We reserve the right to refuse any order placed through the Site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Governing Law</h2>
              <p className="text-slate-600 leading-relaxed">
                These conditions are governed by and interpreted following the laws of the Republic of Ghana, and the use of the United Nations Convention of Contracts for the International Sale of Goods is expressly excluded. If your habitual residence is in the EU, and you are a consumer, you additionally possess the protection provided to you by obligatory provisions of the law of your country of residence.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
              <p className="text-slate-600 leading-relaxed">
                In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <br/>
                <a href="mailto:legal@upsa.edu.gh" className="font-medium text-blue-600 hover:underline">legal@upsa.edu.gh</a>
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
