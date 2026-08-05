'use client'

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchApi } from '@/lib/apiClient';
import { Clock, CheckCircle, AlertCircle, Plus, Users, Calendar, X } from 'lucide-react';
import Button from '@/components/ui/button';
import toast from 'react-hot-toast';
import { LoadingPage } from '@/components/ui/loading';

interface Visitor {
  id: string;
  visitor_name: string;
  phone: string;
  relationship: string;
  visit_purpose: string;
  expected_arrival_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'arrived' | 'departed';
  created_at: string;
}

export default function VisitorManagement() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    visitor_name: '',
    phone: '',
    relationship: '',
    visit_purpose: '',
    expected_arrival_time: ''
  });


  const { user, profileFetched } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await fetchApi('/api/visitors');
      const data = await res.json();
      if (res.ok) setVisitors(data.data || []);
    } catch (error) {
      toast.error('Failed to load visitors');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'arrived':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> {status}</span>;
      case 'rejected':
        return <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3" /> {status}</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> {status}</span>;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const roomId = user?.accommodation?.room?.id || 'mock-room-id';
      
      const payload = {
        ...formData,
        room_id: roomId,
        expected_arrival_time: new Date(formData.expected_arrival_time).toISOString()
      };
      
      const res = await fetchApi('/api/visitors/request', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success('Visitor request submitted successfully');
        setShowModal(false);
        fetchVisitors();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to submit request');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-6 space-y-8">
      <div className="bg-white rounded-xl p-10 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Visitor <span className="text-[#003366]">Management</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Register and track your guests.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-[#003366] text-white hover:bg-[#1A5F9E] text-[10px] font-black uppercase tracking-widest py-6 px-8 rounded-xl shadow-lg shadow-[#003366]/20 transition-all hover:-translate-y-0.5 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Visitor
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10">
        {loading ? (
          <LoadingPage />
        ) : visitors.length === 0 ? (
          <div className="p-16 text-center border border-slate-100 rounded-3xl">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No visitors registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {visitors.map((visitor) => (
              <div key={visitor.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-[#003366]/20 hover:shadow-lg hover:bg-white transition-all duration-300 group">
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight text-lg mb-2">{visitor.visitor_name}</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">{visitor.relationship}</span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                      <Calendar className="w-3.5 h-3.5 text-[#003366]" /> {new Date(visitor.expected_arrival_time).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 min-w-[150px]">
                  {getStatusBadge(visitor.status)}
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {visitor.id.split('-')[0]}</span>
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
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Register Visitor</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 px-2">Full Name</label>
                  <input required type="text" className="w-full rounded-xl border border-slate-100 p-3.5 focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm font-medium text-slate-900 outline-none" value={formData.visitor_name} onChange={e => setFormData({...formData, visitor_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 px-2">Phone Number</label>
                  <input required type="tel" className="w-full rounded-xl border border-slate-100 p-3.5 focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm font-medium text-slate-900 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 px-2">Relationship</label>
                  <input required type="text" placeholder="e.g., Parent, Sibling" className="w-full rounded-xl border border-slate-100 p-3.5 focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm font-medium text-slate-900 outline-none" value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 px-2">Purpose of Visit</label>
                  <input required type="text" className="w-full rounded-xl border border-slate-100 p-3.5 focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm font-medium text-slate-900 outline-none" value={formData.visit_purpose} onChange={e => setFormData({...formData, visit_purpose: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 px-2">Expected Arrival</label>
                  <input required type="datetime-local" className="w-full rounded-xl border border-slate-100 p-3.5 focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm font-medium text-slate-900 outline-none" value={formData.expected_arrival_time} onChange={e => setFormData({...formData, expected_arrival_time: e.target.value})} />
                </div>
              </div>
              
              <div className="p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-100 shrink-0">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl h-11 px-6 font-bold text-slate-500">Cancel</Button>
                <Button type="submit" className="bg-[#003366] hover:bg-[#1A5F9E] text-white shadow-lg shadow-[#003366]/20 rounded-xl h-11 px-6 font-bold transition-all">Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
