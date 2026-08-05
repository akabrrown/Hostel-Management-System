'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import ModernBadge from '@/components/admin/ModernBadge'
import AnimatedStatCard from '@/components/admin/AnimatedStatCard'
import { Settings, Bell, Mail, Database, Building, Calendar, Save, Download, X, Plus, Clock, RefreshCw, Layout } from 'lucide-react'
import HostelSettingsTab from '@/components/admin/HostelSettingsTab'
import { initPageAnimations } from '@/lib/animations'
import { fetchApi } from '@/lib/apiClient';
import { LoadingPage } from '@/components/ui/loading';

interface SystemSettings {
  institutionName: string
  institutionEmail: string
  institutionPhone: string
  institutionAddress: string
  academicYear: string
  currentSemester: string
  paymentReminderDays: number
  latePaymentFee: number
  paymentMethods: string[]
  currency: string
  smtpHost: string
  smtpPort: number
  smtpUsername: string
  smtpPassword: string
  emailFromName: string
  emailFromAddress: string
  enableEmailNotifications: boolean
  enableSmsNotifications: boolean
  enablePushNotifications: boolean
  notificationFrequency: string
  passwordMinLength: number
  sessionTimeout: number
  maxLoginAttempts: number
  enableTwoFactorAuth: boolean
  autoBackup: boolean
  backupFrequency: string
  backupRetention: number
  lastBackupDate: string
  roomCategories: string[]
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: string[]
  category: string
}

interface FeatureToggle {
  bookingEnabled: boolean
  reservationEnabled: boolean
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<SystemSettings>({
    institutionName: 'University of Professional Studies Accra',
    institutionEmail: 'info@upsamail.edu.gh',
    institutionPhone: '+233 302 518 200',
    institutionAddress: 'P.O. Box LG 149, Accra, Ghana',
    academicYear: '2023/2024',
    currentSemester: 'Second Semester',
    paymentReminderDays: 7,
    latePaymentFee: 50,
    paymentMethods: ['Bank Transfer', 'Mobile Money', 'Credit Card'],
    currency: 'GHS',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'noreply@upsamail.edu.gh',
    smtpPassword: '',
    emailFromName: 'UPSA Hostel Management',
    emailFromAddress: 'noreply@upsamail.edu.gh',
    enableEmailNotifications: true,
    enableSmsNotifications: true,
    enablePushNotifications: false,
    notificationFrequency: 'daily',
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enableTwoFactorAuth: false,
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    lastBackupDate: '2024-12-15T02:00:00Z',
    roomCategories: ['Student', 'Staff', 'Guest', 'Reserved']
  })
  
  const [toggles, setToggles] = useState<FeatureToggle>({
    bookingEnabled: true,
    reservationEnabled: true
  })
  const [isUpdatingToggles, setIsUpdatingToggles] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Payment Reminder',
      subject: 'Hostel Fee Payment Reminder',
      content: 'Dear {studentName},\n\nThis is a reminder that your hostel fee of {amount} {currency} is due by {dueDate}. Please make your payment as soon as possible to avoid late fees.\n\nThank you,\nUPSA Hostel Management',
      variables: ['studentName', 'amount', 'currency', 'dueDate'],
      category: 'payment'
    },
    {
      id: '2',
      name: 'Room Allocation',
      subject: 'Room Allocation Confirmation',
      content: 'Dear {studentName},\n\nYou have been allocated to {hostel}, {room} for the {semester} of {academicYear}.\n\nPlease check your student portal for more details.\n\nBest regards,\nUPSA Hostel Management',
      variables: ['studentName', 'hostel', 'room', 'semester', 'academicYear'],
      category: 'allocation'
    },
    {
      id: '3',
      name: 'Welcome',
      subject: 'Welcome to UPSA Hostel Management System',
      content: 'Dear {studentName},\n\nWelcome to the UPSA Hostel Management System. Your account has been created with the following details:\n\nEmail: {email}\nPassword: {password}\n\nPlease log in and complete your profile.\n\nBest regards,\nUPSA Hostel Management',
      variables: ['studentName', 'email', 'password'],
      category: 'welcome'
    }
  ])
  
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'admin')) {
      router.push('/login')
      return
    }
    loadToggles()
  }, [user, router])

  useEffect(() => {
    if (!loading) {
      initPageAnimations(200)
    }
  }, [loading])

  const loadToggles = async () => {
    setLoading(true)
    try {
      const response = await fetchApi('/api/admin/settings')
      const result = await response.json()
      if (response.ok && result.settings) {
        const booking = result.settings.find((s: any) => s.key === 'booking_enabled')
        const reservation = result.settings.find((s: any) => s.key === 'reservation_enabled')
        const acadYear = result.settings.find((s: any) => s.key === 'current_academic_year')
        const semester = result.settings.find((s: any) => s.key === 'current_semester')
        const categories = result.settings.find((s: any) => s.key === 'room_categories')
        
        setToggles({
          bookingEnabled: booking?.value === true,
          reservationEnabled: reservation?.value === true
        })

        if (acadYear || semester || categories) {
          setSettings(prev => {
            let parsedCategories = prev.roomCategories;
            if (categories?.value) {
              try { parsedCategories = typeof categories.value === 'string' ? JSON.parse(categories.value) : categories.value; } catch (e) {}
            }
            return {
              ...prev,
              academicYear: acadYear?.value || prev.academicYear,
              currentSemester: semester?.value || prev.currentSemester,
              roomCategories: parsedCategories
            };
          })
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = async (key: string, value: any) => {
    setIsUpdatingToggles(true)
    try {
      const response = await fetchApi('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      })
      
      if (response.ok) {
        if (key === 'booking_enabled' || key === 'reservation_enabled') {
          setToggles(prev => ({
            ...prev,
            [key === 'booking_enabled' ? 'bookingEnabled' : 'reservationEnabled']: value
          }))
        } else if (key === 'current_academic_year') {
          setSettings(prev => ({ ...prev, academicYear: value }))
        } else if (key === 'current_semester') {
          setSettings(prev => ({ ...prev, currentSemester: value }))
        } else if (key === 'room_categories') {
          setSettings(prev => ({ ...prev, roomCategories: typeof value === 'string' ? JSON.parse(value) : value }))
        }
      }
    } catch (error) {
      console.error('Error updating setting:', error)
    } finally {
      setIsUpdatingToggles(false)
    }
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'acquisition', name: 'Acquisition', icon: Building },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'hostel', name: 'Hostel Content', icon: Layout },
    { id: 'backup', name: 'Backup', icon: Database }
  ]

  if (loading) return <LoadingPage />

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="page-header bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#003366] tracking-tight">System <span className="text-[#B8860B]">Configuration</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Control platform-wide parameters and behaviors</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-slate-200 text-slate-600 rounded-2xl h-12 px-6 text-xs font-black uppercase tracking-widest hover:bg-slate-50">
               <Download className="w-4 h-4 mr-2" />
               Export Config
            </Button>
            <Button className="bg-[#003366] hover:bg-[#1A5F9E] text-white rounded-2xl h-12 px-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-[#003366]/20">
              <Save className="w-4 h-4 mr-2" />
              Commit Changes
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="settings-tabs mb-8">
           <Card className="p-1.5 border-none shadow-sm bg-white md:w-fit overflow-x-auto">
              <div className="flex items-center gap-1">
                 {tabs.map(tab => {
                   const Icon = tab.icon
                   return (
                     <button
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id)}
                       className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                         activeTab === tab.id
                           ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                           : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                       }`}
                     >
                       <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                       <span className="whitespace-nowrap">{tab.name}</span>
                     </button>
                   )
                 })}
              </div>
           </Card>
        </div>

        {/* Content Area */}
        <div className="settings-content grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-8">

              {activeTab === 'general' && (
                 <Card className="p-8 border-none shadow-sm bg-white">
                    <h2 className="text-xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100 flex items-center gap-2">
                       <Settings className="w-5 h-5 text-blue-600" />
                       Institution Identity
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                          <Input value={settings.institutionName} onChange={(e) => setSettings(p => ({ ...p, institutionName: e.target.value }))} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Primary Email</label>
                          <Input value={settings.institutionEmail} onChange={(e) => setSettings(p => ({ ...p, institutionEmail: e.target.value }))} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Link</label>
                          <Input value={settings.institutionPhone} onChange={(e) => setSettings(p => ({ ...p, institutionPhone: e.target.value }))} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Physical Address</label>
                          <Input value={settings.institutionAddress} onChange={(e) => setSettings(p => ({ ...p, institutionAddress: e.target.value }))} />
                       </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-blue-600 uppercase tracking-widest">Active Academic Year</label>
                          <select value={settings.academicYear} onChange={(e) => handleSettingChange('current_academic_year', e.target.value)} className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all">
                            <option value="2023/2024">2023/2024</option>
                            <option value="2024/2025">2024/2025</option>
                            <option value="2025/2026">2025/2026</option>
                            <option value="2026/2027">2026/2027</option>
                            <option value="2027/2028">2027/2028</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-blue-600 uppercase tracking-widest">Operational Semester</label>
                          <select value={settings.currentSemester} onChange={(e) => handleSettingChange('current_semester', e.target.value)} className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all">
                            <option value="First Semester">First Semester</option>
                            <option value="Second Semester">Second Semester</option>
                          </select>
                       </div>
                    </div>
                    {/* Room Categories Management */}
                    <div className="mt-8 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                       <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-gray-900">Room Categories</h3>
                            <p className="text-xs text-gray-500 mt-1">Manage global room allocation categories (e.g., Student, Staff, Reserved)</p>
                          </div>
                       </div>
                       
                       <div className="flex flex-wrap gap-2 mb-6">
                          {settings.roomCategories.map((cat, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg border border-blue-100">
                               {cat}
                               <button onClick={() => {
                                 const newCats = settings.roomCategories.filter(c => c !== cat);
                                 handleSettingChange('room_categories', newCats);
                               }} className="hover:bg-blue-200 rounded p-0.5 transition-colors">
                                 <X className="w-3 h-3" />
                               </button>
                            </div>
                          ))}
                       </div>
                       
                       <div className="flex gap-3">
                          <Input 
                            value={newCategory} 
                            onChange={(e) => setNewCategory(e.target.value)} 
                            placeholder="Add new category..." 
                            className="max-w-xs"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newCategory.trim() && !settings.roomCategories.includes(newCategory.trim())) {
                                e.preventDefault();
                                const newCats = [...settings.roomCategories, newCategory.trim()];
                                handleSettingChange('room_categories', newCats);
                                setNewCategory('');
                              }
                            }}
                          />
                          <Button 
                            onClick={() => {
                              if (newCategory.trim() && !settings.roomCategories.includes(newCategory.trim())) {
                                const newCats = [...settings.roomCategories, newCategory.trim()];
                                handleSettingChange('room_categories', newCats);
                                setNewCategory('');
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                          </Button>
                       </div>
                    </div>
                 </Card>
              )}

              {activeTab === 'acquisition' && (
                <Card className="p-8 border-none shadow-sm bg-white">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 font-primary">Gatekeeper Controls</h2>
                  <p className="text-gray-500 mb-10 text-sm">Synchronize the open/close status of core acquisition channels.</p>

                  <div className="space-y-6">
                    <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50/30 flex items-center justify-between group hover:border-blue-100 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Building className="w-7 h-7 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">Direct Booking Channel</h3>
                            <p className="text-xs text-gray-500 mt-1">Students claim rooms instantly via self-service</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <ModernBadge variant={toggles.bookingEnabled ? 'success' : 'neutral'}>{toggles.bookingEnabled ? 'Open for Business' : 'System Closed'}</ModernBadge>
                          <button 
                            onClick={() => handleSettingChange('booking_enabled', !toggles.bookingEnabled)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${toggles.bookingEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                          >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${toggles.bookingEnabled ? 'left-7' : 'left-1'}`} />
                          </button>
                       </div>
                    </div>

                    <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50/30 flex items-center justify-between group hover:border-purple-100 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Calendar className="w-7 h-7 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">Reservation Intake</h3>
                            <p className="text-xs text-gray-500 mt-1">Intake of requests for offline admin allocation</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <ModernBadge variant={toggles.reservationEnabled ? 'success' : 'neutral'}>{toggles.reservationEnabled ? 'Open for Requests' : 'Closed'}</ModernBadge>
                          <button 
                            onClick={() => handleSettingChange('reservation_enabled', !toggles.reservationEnabled)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${toggles.reservationEnabled ? 'bg-purple-600' : 'bg-gray-300'}`}
                          >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${toggles.reservationEnabled ? 'left-7' : 'left-1'}`} />
                          </button>
                       </div>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'email' && (
                <div className="space-y-8">
                   <Card className="p-8 border-none shadow-sm bg-white">
                      <h2 className="text-xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100 flex items-center gap-2">
                         <Mail className="w-5 h-5 text-blue-600" />
                         SMTP Delivery Nodes
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Relay Host</label>
                            <Input value={settings.smtpHost} onChange={(e) => setSettings(p => ({ ...p, smtpHost: e.target.value }))} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Port (SSL/TLS)</label>
                            <Input type="number" value={settings.smtpPort} onChange={(e) => setSettings(p => ({ ...p, smtpPort: Number(e.target.value) }))} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Auth User</label>
                            <Input value={settings.smtpUsername} onChange={(e) => setSettings(p => ({ ...p, smtpUsername: e.target.value }))} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Auth Password</label>
                            <Input type="password" value="********" readOnly />
                         </div>
                      </div>
                      <div className="mt-8 flex justify-end">
                         <Button variant="outline">Test Delivery Pipe</Button>
                      </div>
                   </Card>

                   <Card className="p-8 border-none shadow-sm bg-white">
                      <div className="flex items-center justify-between mb-8">
                         <h2 className="text-xl font-bold text-gray-900">Communication Templates</h2>
                         <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Template</Button>
                      </div>
                      <div className="space-y-4">
                         {emailTemplates.map(t => (
                           <div key={t.id} className="p-5 border border-gray-100 rounded-2xl hover:bg-gray-50/50 transition-all flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                 </div>
                                 <div>
                                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{t.category}</div>
                                 </div>
                              </div>
                              <Button variant="outline" size="sm">Edit Logic</Button>
                           </div>
                         ))}
                      </div>
                   </Card>
                </div>
              )}

              {activeTab === 'notifications' && (
                <Card className="p-8 border-none shadow-sm bg-white">
                   <h2 className="text-xl font-bold text-gray-900 mb-2">Notification Channels</h2>
                   <p className="text-gray-500 mb-10 text-sm">Control how and when the system sends alerts to admins and students.</p>

                   <div className="space-y-6">
                     <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50/30 flex items-center justify-between group hover:border-blue-100 transition-all">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Mail className="w-7 h-7 text-blue-600" />
                           </div>
                           <div>
                             <h3 className="font-bold text-gray-900">Email notifications</h3>
                             <p className="text-xs text-gray-500 mt-1">Room allocation, payment receipts, and system announcements</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => setSettings(p => ({ ...p, enableEmailNotifications: !p.enableEmailNotifications }))}
                          className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableEmailNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.enableEmailNotifications ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>

                     <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50/30 flex items-center justify-between group hover:border-green-100 transition-all">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Bell className="w-7 h-7 text-green-600" />
                           </div>
                           <div>
                             <h3 className="font-bold text-gray-900">SMS alerts</h3>
                             <p className="text-xs text-gray-500 mt-1">Critical alerts like overdue payments and maintenance emergencies</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => setSettings(p => ({ ...p, enableSmsNotifications: !p.enableSmsNotifications }))}
                          className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableSmsNotifications ? 'bg-green-600' : 'bg-gray-300'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.enableSmsNotifications ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>

                     <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50/30 flex items-center justify-between group hover:border-purple-100 transition-all">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Bell className="w-7 h-7 text-purple-600" />
                           </div>
                           <div>
                             <h3 className="font-bold text-gray-900">In-app push</h3>
                             <p className="text-xs text-gray-500 mt-1">Real-time browser notifications for logged-in users</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => setSettings(p => ({ ...p, enablePushNotifications: !p.enablePushNotifications }))}
                          className={`w-12 h-6 rounded-full transition-colors relative ${settings.enablePushNotifications ? 'bg-purple-600' : 'bg-gray-300'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.enablePushNotifications ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                   </div>

                   <div className="mt-10 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                     <label className="text-xs font-bold text-blue-600 uppercase tracking-widest">Digest frequency</label>
                     <select 
                       value={settings.notificationFrequency} 
                       onChange={(e) => setSettings(p => ({ ...p, notificationFrequency: e.target.value }))} 
                       className="mt-3 w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all"
                     >
                       <option value="realtime">Immediate (each event)</option>
                       <option value="daily">Daily digest</option>
                       <option value="weekly">Weekly summary</option>
                     </select>
                   </div>
                </Card>
              )}

              {activeTab === 'backup' && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <AnimatedStatCard icon={Clock} label="Last Automated Sync" value="2h ago" iconColor="blue" />
                      <AnimatedStatCard icon={Database} label="Sync Integrity" value="100%" iconColor="green" />
                   </div>
                   <Card className="p-8 border-none shadow-sm bg-white">
                      <h2 className="text-xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100 flex items-center gap-2">
                         <Database className="w-5 h-5 text-blue-600" />
                         Recovery Points
                      </h2>
                      <div className="space-y-4">
                         <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <RefreshCw className="w-4 h-4 text-green-500" />
                               <span className="text-sm font-bold">Daily_Snapshot_20241225.sql</span>
                            </div>
                            <Button size="sm" variant="outline">Restore Node</Button>
                         </div>
                      </div>
                      <div className="mt-8 pt-6 border-t border-gray-100">
                         <Button className="w-full">Initiate Force Backup Now</Button>
                      </div>
                   </Card>
              </div>
           )}

           {activeTab === 'hostel' && (
             <HostelSettingsTab />
           )}
           </div>

           <div className="lg:col-span-4 space-y-6">
              <Card className="p-6 border-none shadow-sm bg-white overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -mr-16 -mt-16" />
                 <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-600" />
                    Quick Insights
                 </h3>
                 <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-500 font-medium">Current Load</span>
                       <span className="font-bold text-green-600 text-sm">Optimal</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-500 font-medium">Core API Version</span>
                       <span className="font-bold text-gray-900 text-sm">v4.2.0-stable</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-500 font-medium">Storage Usage</span>
                       <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">12%</span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-600" style={{ width: '12%' }} />
                          </div>
                       </div>
                    </div>
                 </div>
              </Card>

              <Card className="p-6 border-none shadow-sm bg-white">
                 <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-600" />
                    System Alerts
                 </h3>
                 <div className="space-y-4">
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                       <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">Update Available</div>
                       <p className="text-[11px] text-blue-900 leading-relaxed font-medium">New security patches are available for the database engine. Plan a 5-min downtime.</p>
                    </div>
                    <div className="p-3 bg-yellow-50/50 border border-yellow-100 rounded-xl">
                       <div className="text-[10px] font-bold text-yellow-600 uppercase mb-1">Disk Info</div>
                       <p className="text-[11px] text-yellow-900 leading-relaxed font-medium">Log rotation successful. Archive older than 90 days have been cleared.</p>
                    </div>
                 </div>
              </Card>
           </div>
         </div>
    </div>
  )
}
