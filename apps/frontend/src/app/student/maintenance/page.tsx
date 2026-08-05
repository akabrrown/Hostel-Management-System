'use client'

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { PenTool, CheckCircle, Clock, AlertCircle, Plus, X } from 'lucide-react';
import Button from '@/components/ui/button';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { LoadingPage } from '@/components/ui/loading';

interface MaintenanceRequest {
  id: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
}

export default function Maintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: 'electrical',
    description: '',
    priority: 'medium'
  });

  const { user, profileFetched } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetchApi('/api/maintenance');
      const data = await res.json();
      if (res.ok) setRequests(data.data || []);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const roomId = user?.accommodation?.room?.id || 'mock-room-id';
      
      const res = await fetchApi('/api/maintenance', {
        method: 'POST',
        body: JSON.stringify({ ...formData, room_id: roomId })
      });
      
      if (res.ok) {
        toast.success('Maintenance report submitted');
        setShowModal(false);
        fetchRequests();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to submit report');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> {status}</span>;
      case 'in_progress':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit"><PenTool className="w-3 h-3" /> In Progress</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3" /> {status}</span>;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-6 space-y-8">
      <div className="bg-white rounded-xl p-10 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Maintenance <span className="text-[#003366]">Reports</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Report and track issues in your room.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-[#003366] text-white hover:bg-[#1A5F9E] text-[10px] font-black uppercase tracking-widest py-6 px-8 rounded-xl shadow-lg shadow-[#003366]/20 transition-all hover:-translate-y-0.5 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Report Issue
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10">
        {loading ? (
          <LoadingPage />
        ) : requests.length === 0 ? (
          <div className="p-16 text-center border border-slate-100 rounded-3xl">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <PenTool className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No maintenance issues reported.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => (
              <div key={req.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-[#003366]/20 hover:shadow-lg hover:bg-white transition-all duration-300 group">
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight text-lg mb-2 capitalize">{req.category} Issue</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{req.description}</p>
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" /> {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3 min-w-[150px]">
                  {getStatusBadge(req.status)}
                  <span className={`text-[10px] uppercase tracking-widest font-black ${req.priority === 'urgent' ? 'text-rose-600' : 'text-slate-400'}`}>
                    {req.priority} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] overflow-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-transparent" onClick={() => setShowModal(false)} />
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#003366] to-[#003366]/80" />
            
            <div className="p-6 pt-8 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Report Maintenance Issue</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 px-2">Category</label>
                  <select className="w-full rounded-xl border border-slate-100 p-3.5 focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm font-medium text-slate-900 outline-none bg-white cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="furniture">Furniture</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="security">Security</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 px-2">Description</label>
                  <textarea required rows={4} className="w-full rounded-xl border border-slate-100 p-3.5 focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm font-medium text-slate-900 outline-none resize-none" placeholder="Describe the issue in detail..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 px-2">Priority</label>
                  <select className="w-full rounded-xl border border-slate-100 p-3.5 focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm font-medium text-slate-900 outline-none bg-white cursor-pointer" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 px-2">Photo Attachment (Optional)</label>
                  <input type="file" accept="image/*" className="w-full rounded-xl border border-slate-100 p-3.5 focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm font-medium text-slate-900 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#003366]/10 file:text-[#003366] hover:file:bg-[#003366]/20 cursor-pointer" />
                  <p className="text-[9px] text-slate-400 mt-2 px-2">Upload an image of the issue to help maintenance staff (Max 5MB).</p>
                </div>
              </div>
              
              <div className="p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-100 shrink-0">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl h-11 px-6 font-bold text-slate-500">Cancel</Button>
                <Button type="submit" className="bg-[#003366] hover:bg-[#1A5F9E] text-white shadow-lg shadow-[#003366]/20 rounded-xl h-11 px-6 font-bold transition-all">Submit Report</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
