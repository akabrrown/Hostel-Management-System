'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { DataTable } from '@/components/ui/dataTable'
import ModernBadge from '@/components/admin/ModernBadge'
import EmptyState from '@/components/admin/EmptyState'
import { Search, Bell, Mail, MessageSquare, Settings, Clock, CheckCircle, AlertCircle, Send, Eye, Edit, Trash2, X, Activity, Filter, Layers } from 'lucide-react'
import { TableColumn } from '@/types'
import { initPageAnimations } from '@/lib/animations'
import { LoadingPage } from '@/components/ui/loading';

interface NotificationTemplate {
  id: string
  name: string
  type: 'email' | 'sms' | 'push'
  category: string
  subject?: string
  content: string
  variables: string[]
  isActive: boolean
  createdAt: string
  lastUsed?: string
  usageCount: number
}

interface NotificationHistory {
  id: string
  recipient: string
  type: 'email' | 'sms' | 'push'
  template: string
  subject?: string
  status: 'sent' | 'pending' | 'failed'
  sentAt: string
  deliveredAt?: string
  error?: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  paymentReminders: boolean
  allocationNotifications: boolean
  announcementNotifications: boolean
  systemAlerts: boolean
  reminderFrequency: 'daily' | 'weekly' | 'monthly'
}

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState('templates')
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    paymentReminders: true,
    allocationNotifications: true,
    announcementNotifications: true,
    systemAlerts: true,
    reminderFrequency: 'weekly'
  })
  
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'admin')) {
      router.push('/login')
      return
    }

    // Mock data load
    setTimeout(() => {
      setLoading(false)
    }, 800)
  }, [user, router])

  useEffect(() => {
    if (!loading) {
      initPageAnimations(150)
    }
  }, [loading, activeTab])

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredHistory = history.filter(item =>
    item.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Badge Logic
  const getTypeVariant = (type: string): 'info' | 'success' | 'warning' | 'neutral' => {
    switch (type) {
      case 'email': return 'info'
      case 'sms': return 'success'
      case 'push': return 'warning'
      default: return 'neutral'
    }
  }

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
    switch (status) {
      case 'sent': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'danger'
      default: return 'neutral'
    }
  }

  const templateColumns: TableColumn[] = [
    {
      key: 'name',
      title: 'Blueprint Identity',
      render: (value: any, row: NotificationTemplate) => (
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
            {row.type === 'email' && <Mail className="w-5 h-5 text-blue-500" />}
            {row.type === 'sms' && <MessageSquare className="w-5 h-5 text-green-500" />}
            {row.type === 'push' && <Bell className="w-5 h-5 text-amber-500" />}
          </div>
          <div>
            <div className="font-bold text-gray-900">{row.name}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{row.category}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Channel',
      render: (value: string) => <ModernBadge variant={getTypeVariant(value)}>{value.toUpperCase()}</ModernBadge>
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (value: boolean) => (
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
           <span className="text-xs font-bold text-gray-500 uppercase">{value ? 'Active' : 'Disabled'}</span>
        </div>
      )
    },
    {
       key: 'id',
       title: 'Command',
       render: (value: any, row: NotificationTemplate) => (
         <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Send Test"><Send className="w-3.5 h-3.5" /></Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedTemplate(row); setShowTemplateEditor(true); }}><Edit className="w-3.5 h-3.5" /></Button>
            <Button variant="outline" size="sm" className="h-8 transition-all px-3 text-[10px] font-bold uppercase">{row.isActive ? 'Deactivate' : 'Activate'}</Button>
         </div>
       )
    }
  ]

  const historyColumns: TableColumn[] = [
    {
       key: 'recipient',
       title: 'Recipient Entity',
       render: (val: string, row: NotificationHistory) => (
         <div className="space-y-0.5">
            <div className="font-bold text-gray-900">{val}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{row.template} • {row.type}</div>
         </div>
       )
    },
    {
       key: 'status',
       title: 'Logs Status',
       render: (val: string) => <ModernBadge variant={getStatusVariant(val)}>{val}</ModernBadge>
    },
    {
       key: 'sentAt',
       title: 'Time Lock',
       render: (val: string) => (
         <div className="text-xs font-semibold text-gray-500">
            {new Date(val).toLocaleString()}
         </div>
       )
    }
  ]

  if (loading) {
     return (
       <LoadingPage />
     )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="page-header mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Communication Control</h1>
            <p className="text-gray-600 mt-1">Configure automated triggers and outgoing templates</p>
          </div>
          <Button onClick={() => setShowTemplateEditor(true)} className="shadow-lg shadow-blue-600/20">
            <Mail className="w-4 h-4 mr-2" />
            New Communications Blueprint
          </Button>
        </div>

        {/* Tab Selection */}
        <div className="notification-tabs mb-8 flex items-center justify-between">
           <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
              {[
                { id: 'templates', name: 'Templates', icon: Layers },
                { id: 'history', name: 'Activity Log', icon: Activity },
                { id: 'settings', name: 'Gateway Settings', icon: Settings }
              ].map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                 >
                    <tab.icon className="w-4 h-4" />
                    {tab.name}
                 </button>
              ))}
           </div>
           
           {activeTab !== 'settings' && (
              <div className="relative hidden md:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={`Search ${activeTab}...`} className="pl-10 h-10 w-64 bg-white border-gray-100" />
              </div>
           )}
        </div>

        {/* Dynamic Content */}
        <div className="notification-content page-entry-anim">
           {activeTab === 'templates' && (
              <Card className="p-0 border-none shadow-sm bg-white overflow-hidden">
                 {templates.length > 0 ? (
                    <DataTable columns={templateColumns} data={filteredTemplates} pagination pageSize={10} />
                 ) : (
                   <EmptyState
                      icon={Mail}
                      title="No Blueprints Created"
                      description="Automated notifications need templates to function."
                      actionLabel="Create Blueprint"
                      onAction={() => setShowTemplateEditor(true)}
                   />
                 )}
              </Card>
           )}

           {activeTab === 'history' && (
              <Card className="p-0 border-none shadow-sm bg-white overflow-hidden">
                 {history.length > 0 ? (
                    <DataTable columns={historyColumns} data={filteredHistory} pagination pageSize={15} />
                 ) : (
                    <EmptyState
                       icon={Clock}
                       title="History is Clear"
                       description="Logs will appear here once notifications start firing."
                    />
                 )}
              </Card>
           )}

           {activeTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <Card className="lg:col-span-2 p-8 border-none shadow-sm bg-white space-y-10">
                    <div className="space-y-6">
                       <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                          <Settings className="w-4 h-4 text-blue-600" /> Infrastructure Gateways
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { id: 'emailNotifications', label: 'Email Relay', desc: 'SMTP/API' },
                            { id: 'smsNotifications', label: 'SMS Gateway', desc: 'Twilio/Bulk' },
                            { id: 'pushNotifications', label: 'Push Hub', desc: 'Firebase' }
                          ].map(gateway => (
                             <div key={gateway.id} className="p-5 border border-gray-100 rounded-3xl bg-gray-50/50 flex flex-col justify-between items-start gap-4 hover:border-blue-100 transition-all">
                                <div>
                                   <div className="text-sm font-bold text-gray-900">{gateway.label}</div>
                                   <div className="text-[10px] text-gray-400 font-bold uppercase">{gateway.desc}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                   <input
                                      type="checkbox"
                                      className="w-10 h-5 appearance-none bg-gray-200 checked:bg-blue-600 rounded-full cursor-pointer relative transition-all before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:left-5.5 before:transition-all"
                                      checked={settings[gateway.id as keyof NotificationSettings] as boolean}
                                      onChange={(e) => setSettings(prev => ({ ...prev, [gateway.id]: e.target.checked }))}
                                    />
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                          <Bell className="w-4 h-4 text-amber-600" /> Automated Triggers
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: 'paymentReminders', label: 'Payment Overdues' },
                            { id: 'allocationNotifications', label: 'Room Allocations' },
                            { id: 'announcementNotifications', label: 'Public Notices' },
                            { id: 'systemAlerts', label: 'Security Alerts' }
                          ].map(trigger => (
                             <label key={trigger.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all">
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{trigger.label}</span>
                                <input type="checkbox" checked={settings[trigger.id as keyof NotificationSettings] as boolean} onChange={e => setSettings(p => ({ ...p, [trigger.id]: e.target.checked }))} className="w-4 h-4 rounded-md border-gray-200 text-blue-600" />
                             </label>
                          ))}
                       </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex justify-end">
                       <Button className="px-10 h-11 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">Commit Infrastructure Changes</Button>
                    </div>
                 </Card>

                 <div className="space-y-8">
                    <Card className="p-6 bg-blue-600 border-none shadow-xl shadow-blue-500/20 text-white">
                       <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                             <Clock className="w-5 h-5" />
                          </div>
                          <div>
                             <div className="text-xs font-bold opacity-60 uppercase tracking-widest">Cron Interval</div>
                             <div className="text-sm font-bold">Relay Frequency</div>
                          </div>
                       </div>
                       <select value={settings.reminderFrequency} onChange={e => setSettings(p => ({ ...p, reminderFrequency: e.target.value as any }))} className="w-full h-11 bg-white/10 border border-white/20 rounded-xl px-4 outline-none font-bold text-sm">
                          <option value="daily" className="text-gray-900">Daily Sweep</option>
                          <option value="weekly" className="text-gray-900">Weekly Cycle</option>
                          <option value="monthly" className="text-gray-900">Monthly Cycle</option>
                       </select>
                       <p className="text-[10px] font-bold opacity-60 mt-4 leading-relaxed uppercase tracking-tighter">Determines how often the system audits records for triggered events (e.g. overdue payments).</p>
                    </Card>

                    <Card className="p-6 border-none shadow-sm bg-white">
                       <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Insights</h4>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                             <span className="text-[10px] font-bold text-gray-500 uppercase">Avg Delivery Rate</span>
                             <span className="text-xs font-bold text-green-600">99.4%</span>
                          </div>
                          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                             <span className="text-[10px] font-bold text-gray-500 uppercase">Failures (24h)</span>
                             <span className="text-xs font-bold text-red-500">2</span>
                          </div>
                       </div>
                    </Card>
                 </div>
              </div>
           )}
        </div>
      </main>

      {/* Template Editor Modal */}
      {showTemplateEditor && (
        <div className="fixed inset-0 z-[100] overflow-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
           <div className="absolute inset-0 bg-transparent" onClick={() => { setShowTemplateEditor(false); setSelectedTemplate(null); }} />
           <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#003366] to-[#003366]/80" />
              <div className="p-8 space-y-8 pt-6">
                 <div className="flex justify-between items-start">
                    <div>
                       <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate?.id ? 'Refine Blueprint' : 'Architect Blueprint'}</h2>
                       <p className="text-sm text-gray-500 mt-1">Design the structure of automated messages</p>
                    </div>
                    <button onClick={() => { setShowTemplateEditor(false); setSelectedTemplate(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                 </div>

                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Name</label>
                          <Input value={selectedTemplate?.name || ''} onChange={e => setSelectedTemplate(p => p ? {...p, name: e.target.value} : null)} placeholder="Blueprint Title" className="font-bold h-11" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Primary Type</label>
                          <select className="w-full h-11 px-4 border border-gray-100 rounded-2xl bg-gray-50 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all">
                             <option value="email">Electronic Mail (Email)</option>
                             <option value="sms">Short Message Service (SMS)</option>
                             <option value="push">Mobile Push Alert</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Message Body</label>
                       <textarea rows={8} className="w-full px-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 text-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none" placeholder="Draft your content here..." />
                    </div>

                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                       <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">Dynamic Injectables</div>
                       <div className="flex flex-wrap gap-2">
                          {['{studentName}', '{amount}', '{dueDate}', '{hostelName}'].map(tag => (
                             <span key={tag} className="px-3 py-1 bg-white border border-blue-100 rounded-lg text-[10px] font-bold text-blue-700 shadow-sm cursor-copy hover:scale-105 transition-all">{tag}</span>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={() => { setShowTemplateEditor(false); setSelectedTemplate(null); }} className="font-bold text-gray-400">Discard Blueprint</Button>
                    <Button onClick={() => setShowTemplateEditor(false)} className="px-10 bg-blue-600 shadow-xl shadow-blue-500/20">Finalize Blueprint</Button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
