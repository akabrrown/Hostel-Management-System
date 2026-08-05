'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchApi } from '@/lib/apiClient'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Input from '@/components/ui/input'
import ModernBadge from '@/components/admin/ModernBadge'
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Image as ImageIcon, 
  Type, 
  Settings,
  Shield,
  Wifi,
  Car,
  Users,
  DollarSign,
  Star,
  X,
  Layout,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'
import { initPageAnimations } from '@/lib/animations'
import { LoadingPage } from '@/components/ui/loading'

interface HostelPageContent {
  id?: string
  hero_title: string
  hero_subtitle: string
  hero_background_image: string
  hero_button_text: string
  features_title: string
  features_subtitle: string
  features: {
    id: string
    title: string
    description: string
    icon: string
    order: number
  }[]
  cta_title: string
  cta_subtitle: string
  cta_button_text: string
  cta_secondary_button_text: string
}

const availableIcons = [
  { value: 'Shield', label: 'Security', icon: Shield },
  { value: 'Wifi', label: 'WiFi', icon: Wifi },
  { value: 'Car', label: 'Parking', icon: Car },
  { value: 'Users', label: 'Community', icon: Users },
  { value: 'DollarSign', label: 'Price', icon: DollarSign },
  { value: 'Star', label: 'Rating', icon: Star },
]

export default function HostelSettingsTab() {
  const [content, setContent] = useState<HostelPageContent>({
    hero_title: 'Discover Our Hostels',
    hero_subtitle: 'Experience world-class hostel facilities designed to provide comfort, security, and an environment conducive to academic excellence.',
    hero_background_image: 'https://upsa.edu.gh/wp-content/uploads/2020/08/slide-7.jpg',
    hero_button_text: 'Explore Hostels',
    features_title: 'Why Choose UPSA Hostels?',
    features_subtitle: 'We provide quality accommodation with modern amenities to ensure your comfort and academic success.',
    features: [
      { id: '1', title: '24/7 Security', description: 'Round-the-clock security to ensure your safety and peace of mind.', icon: 'Shield', order: 1 },
      { id: '2', title: 'Free WiFi', description: 'High-speed internet access throughout all hostel buildings.', icon: 'Wifi', order: 2 },
      { id: '3', title: 'Parking Space', description: 'Secure parking facilities available for residents with vehicles.', icon: 'Car', order: 3 },
      { id: '4', title: 'Community', description: 'Vibrant community with various social and academic activities.', icon: 'Users', order: 4 }
    ],
    cta_title: 'Ready to Join Our Community?',
    cta_subtitle: 'Take the first step towards comfortable and secure hostel living. Apply now and secure your place in our vibrant student community.',
    cta_button_text: 'Apply for Hostel',
    cta_secondary_button_text: 'Contact Us'
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchContent()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      initPageAnimations(150)
    }
  }, [isLoading])

  const fetchContent = async () => {
    try {
      const response = await fetchApi('/api/admin/hostel-content')
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setContent(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveContent = async () => {
    setIsSaving(true)
    try {
      const method = content.id ? 'PUT' : 'POST'
      const url = content.id ? `/api/admin/hostel-content?id=${content.id}` : '/api/admin/hostel-content'
      
      const response = await fetchApi(url, {
        method,
        body: JSON.stringify(content),
      })

      if (response.ok) {
        const result = await response.json()
        setContent(result.data)
        // Toast or small notification instead of alert would be better, but keeping consistency
        alert('Content saved successfully!')
      }
    } catch (error) {
      console.error('Failed to save content:', error)
      alert('Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSystem = async () => {
    if (!window.confirm('CRITICAL WARNING:\n\nThis will delete ALL student bookings, room allocations, and reset all room occupancy counters to zero.\n\nThis action cannot be undone. Are you absolutely sure you want to proceed?')) {
      return
    }

    if (!window.confirm('Final Confirmation: You are about to wipe the entire semester allocation data. Confirm to proceed.')) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetchApi('/api/admin/reset-system', {
        method: 'POST',
      })

      if (response.ok) {
        alert('System reset successfully. All bookings and data have been cleared.')
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Failed to reset system: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('System reset error:', error)
      alert('An error occurred while resetting the system.')
    } finally {
      setIsSaving(false)
    }
  }

  const addFeature = () => {
    const newFeature = {
      id: Date.now().toString(),
      title: 'New Feature',
      description: 'Feature description',
      icon: 'Shield',
      order: content.features.length + 1
    }
    setContent({ ...content, features: [...content.features, newFeature] })
  }

  const updateFeature = (index: number, field: string, value: any) => {
    const updatedFeatures = [...content.features]
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value }
    setContent({ ...content, features: updatedFeatures })
  }

  const removeFeature = (index: number) => {
    const updatedFeatures = content.features.filter((_, i) => i !== index)
    setContent({ ...content, features: updatedFeatures })
  }

  if (isLoading) {
    return (
      <LoadingPage />
    )
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-end gap-3">
           <Button variant="outline" className="hidden sm:flex border-none font-bold text-blue-600 hover:bg-blue-50">
              <ExternalLink className="w-4 h-4 mr-2" />
              Live Preview
           </Button>
           <Button onClick={saveContent} disabled={isSaving} className="shadow-lg shadow-blue-500/20">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Synching...' : 'Commit Changes'}
           </Button>
        </div>
      <div className="space-y-10">
         {/* Hero Section Master */}
         <section className="page-entry-anim">
            <div className="flex items-center gap-2 mb-4 px-2">
               <ImageIcon className="w-4 h-4 text-blue-600" />
               <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Stage 1: Hero Experience</span>
            </div>
            <Card className="p-8 border-none shadow-sm bg-white overflow-hidden relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-full -mr-32 -mt-32 -z-0" />
               <div className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Primary Catchphrase</label>
                        <Input value={content.hero_title} onChange={(e) => setContent({ ...content, hero_title: e.target.value })} placeholder="Main Title" className="font-bold text-lg" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Action Button Text</label>
                        <Input value={content.hero_button_text} onChange={(e) => setContent({ ...content, hero_button_text: e.target.value })} placeholder="Button Label" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Supporting Narrative</label>
                     <textarea value={content.hero_subtitle} onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })} rows={3} className="w-full px-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 text-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none" placeholder="Provide context..." />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Key Visual asset (URL)</label>
                     <div className="flex gap-4">
                        <Input value={content.hero_background_image} onChange={(e) => setContent({ ...content, hero_background_image: e.target.value })} className="flex-1" />
                        <div className="w-12 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-200">
                           <img src={content.hero_background_image} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                     </div>
                  </div>
               </div>
            </Card>
         </section>


          {/* Danger Zone */}
          <section className="page-entry-anim">
            <div className="flex items-center gap-2 mb-4 px-2">
               <AlertTriangle className="w-4 h-4 text-red-600" />
               <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Danger Zone</span>
            </div>
            <Card className="p-8 border-red-100 shadow-sm bg-red-50/50">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                     <h3 className="text-lg font-bold text-red-900 mb-2">Reset Semester System</h3>
                     <p className="text-sm text-red-700/80 max-w-xl">
                        This action will <strong>permanently delete</strong> all student bookings, reservations, and room allocations. 
                        It will also reset all room occupancy counters to zero. Use this only when preparing for a fresh semester.
                     </p>
                  </div>
                  <Button 
                    onClick={handleResetSystem} 
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-500/20 whitespace-nowrap"
                  >
                     {isSaving ? 'Resetting...' : 'Reset All System Data'}
                  </Button>
               </div>
            </Card>
          </section>

      </div>
    </div>
  )
}

