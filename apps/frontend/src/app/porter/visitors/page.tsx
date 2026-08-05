'use client'

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  UserPlus, 
  LogOut,
  CalendarClock
} from 'lucide-react';
import Button from '@/components/ui/button';
import toast from 'react-hot-toast';
import { LoadingPage } from '@/components/ui/loading';
import Card from '@/components/ui/card';
import ModernBadge from '@/components/admin/ModernBadge';
import EmptyState from '@/components/admin/EmptyState';
import { initPageAnimations } from '@/lib/animations';

interface Visitor {
  id: string;
  visitorName: string;
  phone: string;
  relationship: string;
  purpose: string;
  expectedArrival: string;
  status: 'pending' | 'approved' | 'rejected' | 'arrived' | 'departed';
  createdAt: string;
  studentName: string;
  roomNumber: string;
}

export default function VisitorQueue() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'arrived'>('pending');

  useEffect(() => {
    fetchQueue();
    initPageAnimations(150);
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/porter/visitors?status=all');
      if (res.ok) {
        const data = await res.json();
        setVisitors(data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetchApi(`/api/porter/visitors/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Visitor marked as ${status}`);
        fetchQueue();
      } else {
        toast.error('Failed to update status');
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const pendingList = visitors.filter(v => v.status === 'pending');
  const approvedList = visitors.filter(v => v.status === 'approved');
  const arrivedList = visitors.filter(v => v.status === 'arrived');

  const activeList = 
    activeTab === 'pending' ? pendingList : 
    activeTab === 'approved' ? approvedList : 
    arrivedList;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="page-header bg-white p-10 rounded-2xl shadow-sm border-2 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Visitor <span className="text-[#003366]">Queue</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Requests &amp; Logging</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border-2 border-slate-100 shadow-inner">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
              activeTab === 'pending' 
                ? 'bg-[#003366] text-white shadow-lg shadow-[#003366]/20' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Pending ({pendingList.length})
          </button>
          <button 
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
              activeTab === 'approved' 
                ? 'bg-[#003366] text-white shadow-lg shadow-[#003366]/20' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Expected Departures ({approvedList.length})
          </button>
          <button 
            onClick={() => setActiveTab('arrived')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
              activeTab === 'arrived' 
                ? 'bg-[#003366] text-white shadow-lg shadow-[#003366]/20' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            On-site ({arrivedList.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingPage />
        </div>
      ) : activeList.length === 0 ? (
        <div className="py-20 px-8 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
          <Users className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <p className="text-lg font-black text-slate-300 tracking-tight mb-2">
            {activeTab === 'pending' ? 'Queue Empty' : activeTab === 'approved' ? 'No Expected Departures' : 'No Visitors On-Site'}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
            There are currently zero visitors in the &quot;{activeTab}&quot; status.
          </p>
          <button onClick={fetchQueue} className="h-12 px-8 bg-slate-900 hover:bg-[#003366] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:-translate-y-0.5">
            Refresh Queue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeList.map(v => (
            <div key={v.id} className="bg-white border-2 border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-[#003366]/5 hover:border-[#003366]/20 transition-all duration-300 group">
              {/* Card Top Accent */}
              <div className={`h-1.5 w-full ${
                activeTab === 'pending' ? 'bg-amber-400' :
                activeTab === 'approved' ? 'bg-[#003366]' : 'bg-emerald-500'
              }`} />
              
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-[#003366] transition-colors">{v.visitorName}</h3>
                    <p className="text-[10px] font-black text-[#003366] uppercase tracking-widest mt-2">Host: {v.studentName}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-[1.25rem] border-2 flex items-center justify-center shrink-0 ${
                    activeTab === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                    activeTab === 'approved' ? 'bg-[#003366]/5 border-[#003366]/10 text-[#003366]' : 'bg-emerald-50 border-emerald-100 text-emerald-500'
                  }`}>
                    {activeTab === 'pending' ? <CalendarClock className="w-6 h-6" /> : 
                     activeTab === 'approved' ? <UserPlus className="w-6 h-6" /> : 
                     <ShieldCheck className="w-6 h-6" />}
                  </div>
                </div>

                <div className="space-y-4 mb-8 bg-slate-50 border-2 border-slate-100 p-5 rounded-[1.5rem]">
                  <div className="flex items-center gap-3">
                     <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                     <div className="text-xs font-black text-slate-700">Room {v.roomNumber}</div>
                  </div>
                  <div className="flex items-center gap-3">
                     <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                     <div className="text-xs font-bold text-slate-600">Expected Departure: {new Date(v.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="pt-4 border-t-2 border-slate-100 mt-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Purpose / Relationship</p>
                     <p className="text-xs font-bold text-slate-700 leading-relaxed">{v.purpose} ({v.relationship})</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {activeTab === 'pending' && (
                    <>
                      <Button 
                        variant="outline"
                        onClick={() => handleStatusUpdate(v.id, 'rejected')}
                        className="flex-1 border-2 border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                      <Button 
                        onClick={() => handleStatusUpdate(v.id, 'approved')}
                        className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:-translate-y-0.5"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                      </Button>
                    </>
                  )}
                  {activeTab === 'approved' && (
                    <Button 
                      onClick={() => handleStatusUpdate(v.id, 'arrived')}
                      className="w-full bg-[#003366] text-white hover:bg-[#002244] shadow-xl shadow-[#003366]/20 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:-translate-y-0.5"
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" /> Record Arrival
                    </Button>
                  )}
                  {activeTab === 'arrived' && (
                    <Button 
                      variant="outline"
                      onClick={() => handleStatusUpdate(v.id, 'departed')}
                      className="w-full border-2 border-slate-200 bg-white text-slate-900 hover:bg-slate-50 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Record Departure
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
