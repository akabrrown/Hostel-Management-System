'use client'

import React from 'react'
import { Navbar } from '@/components/layout/Navbar'
import Footer from '@/components/ui/footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 mb-12">Last updated: August 2026</p>

          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-600 leading-relaxed">
                At the University of Professional Studies, Accra (UPSA), we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data when you use the UPSA Hostel Management System. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Data We Collect</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We may collect information about you in a variety of ways. The information we may collect via the Application includes:
              </p>
              <ul className="list-disc pl-5 text-slate-600 space-y-2">
                <li><strong>Personal Data:</strong> Demographic and other personally identifiable information (such as your name, student ID, program of study, and email address) that you voluntarily give to us when registering for accommodation.</li>
                <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g. valid credit card number, card brand, expiration date) that we may collect when you purchase, order, or request information about our services.</li>
                <li><strong>Biometric Data:</strong> As part of our security protocol, we may collect biometric data (such as fingerprint scans) for access control to the hostel premises.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Use of Your Information</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
              </p>
              <ul className="list-disc pl-5 text-slate-600 space-y-2">
                <li>Create and manage your student profile and room allocation.</li>
                <li>Process your accommodation payments and refunds.</li>
                <li>Monitor and manage security within the hostel premises.</li>
                <li>Respond to maintenance requests and customer service inquiries.</li>
                <li>Send you important administrative information, such as policy changes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Disclosure of Your Information</h2>
              <p className="text-slate-600 leading-relaxed">
                We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our application, conducting our business, or serving our users, so long as those parties agree to keep this information confidential. We may also release information when it's release is appropriate to comply with the law (such as the Data Protection Act of Ghana), enforce our site policies, or protect ours or others' rights, property or safety.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Security of Your Information</h2>
              <p className="text-slate-600 leading-relaxed">
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
              <p className="text-slate-600 leading-relaxed">
                If you have questions or comments about this Privacy Policy, please contact us at: <br/>
                <a href="mailto:privacy@upsa.edu.gh" className="font-medium text-blue-600 hover:underline">privacy@upsa.edu.gh</a>
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
