'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/store'
import { studentSettingsApi, authApi, handleApiError } from '@/lib/api'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Bell, 
  Shield, 
  User, 
  Mail, 
  Phone, 
  Smartphone,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Moon,
  Sun
} from 'lucide-react'
import { gsap } from 'gsap'
import { LoadingPage } from '@/components/ui/loading';

export default function StudentSettings() {
  const router = useRouter()
  const { user, profileFetched } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: true,
    push_notifications: false,
    theme: 'light'
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null,
    message: string | null
  }>({ type: null, message: null })

  useEffect(() => {
    if (profileFetched && (!user || user.role !== 'student')) {
      router.push('/login')
      return
    }

    const fetchSettings = async () => {
      try {
        const response: any = await studentSettingsApi.get()
        if (response.data) {
          setSettings(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
    
    // Animation
    gsap.from('.settings-card', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out'
    })
  }, [user, router])

  const handleUpdateSettings = async (updates: any) => {
    setStatus({ type: null, message: null })
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    
    try {
      await studentSettingsApi.update(updates)
      setStatus({ type: 'success', message: 'Settings updated successfully' })
    } catch (error) {
      setStatus({ type: 'error', message: handleApiError(error, 'Failed to update settings') })
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' })
      return
    }
    

    setSaving(true)
    setStatus({ type: null, message: null })
    
    try {
      await authApi.changePassword(passwordData)
      setStatus({ type: 'success', message: 'Password changed successfully' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setStatus({ type: 'error', message: handleApiError(error, 'Failed to change password') })
    } finally {
      setSaving(false)
    }
  }


  if (loading) return <LoadingPage />

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 page-header">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Account <span className="text-[#003366]">Settings</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Manage your preferences and security</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* General Settings */}
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 settings-card space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#003366]/10 rounded-2xl">
              <Settings className="w-6 h-6 text-[#003366]" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Preferences</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Email Notifications</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase">Receive updates via email</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={settings.email_notifications}
                onChange={(e) => handleUpdateSettings({ email_notifications: e.target.checked })}
                className="w-5 h-5 accent-[#003366] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-4">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <div>
                  <h3 className="font-black text-slate-900 text-sm">SMS Notifications</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase">Receive SMS alerts</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={settings.sms_notifications}
                onChange={(e) => handleUpdateSettings({ sms_notifications: e.target.checked })}
                className="w-5 h-5 accent-[#003366] rounded cursor-pointer"
              />
            </div>
            
            <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-4">
                <Bell className="w-5 h-5 text-slate-400" />
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Push Notifications</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase">Browser push alerts</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={settings.push_notifications}
                onChange={(e) => handleUpdateSettings({ push_notifications: e.target.checked })}
                className="w-5 h-5 accent-[#003366] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 settings-card space-y-8 mt-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#003366]/10 rounded-2xl">
              <Shield className="w-6 h-6 text-[#003366]" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Security</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            {status.message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-bold">{status.message}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Current Password</label>
              <Input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#003366] focus:ring-[#003366]/20"
                placeholder="Enter current password"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">New Password</label>
                <Input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#003366] focus:ring-[#003366]/20"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Confirm New Password</label>
                <Input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#003366] focus:ring-[#003366]/20"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto mt-4 bg-[#003366] text-white hover:bg-[#1A5F9E] text-[10px] font-black uppercase tracking-widest py-6 px-8 rounded-xl shadow-lg transition-all"
            >
              {saving ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
