'use client'

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { 
  Key, 
  Search, 
  UserCheck, 
  AlertTriangle, 
  History,
  ShieldCheck,
  Zap,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
  MoreVertical,
  Activity,
  DoorOpen
} from 'lucide-react';
import Button from '@/components/ui/button';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { LoadingPage } from '@/components/ui/loading';
import Card from '@/components/ui/card';
import ModernBadge from '@/components/admin/ModernBadge';
import EmptyState from '@/components/admin/EmptyState';
import { initPageAnimations } from '@/lib/animations';

interface RoomKey {
  id: string;
  roomId: string;
  keyCode: string;
  status: 'with_porter' | 'with_student' | 'lost' | 'damaged' | 'replacement_required';
  roomNumber: string;
  holderName: string | null;
}

interface KeyHistory {
  id: string;
  type: string;
  remarks: string;
  timestamp: string;
  studentName: string;
  porterName: string;
}

export default function KeyTrackingBoard() {
  const [keys, setKeys] = useState<RoomKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedKey, setSelectedKey] = useState<RoomKey | null>(null);
  const [keyHistory, setKeyHistory] = useState<KeyHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchKeys();
    initPageAnimations(150);
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/porter/keys');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load key registry');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (keyId: string) => {
    try {
      setHistoryLoading(true);
      const res = await fetchApi(`/api/porter/keys/${keyId}/history`);
      if (res.ok) {
        const data = await res.json();
        setKeyHistory(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectKey = (k: RoomKey) => {
    setSelectedKey(k);
    fetchHistory(k.id);
  };

  const handleTransaction = async (roomId: string, type: string) => {
    if (transactionLoading) return;
    try {
      setTransactionLoading(true);
      
      // In a real flow, if they are issuing a key, we might need to select which student in the room is getting it.
      // For this text-click flow, if the room is assigned to multiple students, we'd prompt. 
      // We will assume for now we just pass user?.id or a mock student id if we don't have the exact student picker yet.
      // A premium UI would have a quick search box for the student here. 
      
      const res = await fetchApi('/api/room_keys/transaction', {
        method: 'POST',
        body: JSON.stringify({
          room_id: roomId,
          student_id: type === 'collect_from_porter' ? 'unknown_student' : user?.id, 
          transaction_type: type,
          remarks: `Transaction: ${type.replace(/_/g, ' ')}`
        })
      });
      
      if (res.ok) {
        toast.success(`Key status updated successfully`);
        // Refresh keys
        await fetchKeys();
        
        // Update selected key if it's the one we just transacted on
        if (selectedKey && selectedKey.roomId === roomId) {
          const newStatus = type === 'return_to_porter' ? 'with_porter' : 
                            type === 'collect_from_porter' ? 'with_student' : 
                            type === 'lost_report' ? 'lost' : 
                            type === 'damage_report' ? 'damaged' : selectedKey.status;
          
          setSelectedKey({ ...selectedKey, status: newStatus as any });
          fetchHistory(selectedKey.id);
        }
      } else {
        toast.error('Failed to process key transaction');
      }
    } catch (e) {
      toast.error('Error processing transaction');
    } finally {
      setTransactionLoading(false);
    }
  };

  const filteredKeys = keys.filter(k => 
    k.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
    k.keyCode.toLowerCase().includes(search.toLowerCase()) ||
    (k.holderName && k.holderName.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'with_porter': return 'bg-blue-100 text-blue-700 ring-blue-500/20';
      case 'with_student': return 'bg-emerald-100 text-emerald-700 ring-emerald-500/20';
      case 'lost': return 'bg-rose-100 text-rose-700 ring-rose-500/20';
      case 'damaged': return 'bg-amber-100 text-amber-700 ring-amber-500/20';
      default: return 'bg-slate-100 text-slate-700 ring-slate-500/20';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'with_porter': return 'info';
      case 'with_student': return 'success';
      case 'lost': return 'danger';
      case 'damaged': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="page-header bg-white p-10 rounded-2xl shadow-sm border-2 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Key <span className="text-[#003366]">Tracking</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Sign-in / Sign-out Log</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-inner">
             <Key className="w-5 h-5 text-[#003366]" />
             <div className="text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Keys on Board</div>
                <div className="text-sm font-black text-slate-700 mt-1">{keys.filter(k => k.status === 'with_porter').length} / {keys.length}</div>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Fast Search & List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="border-2 border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden p-0">
             <div className="p-10 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 leading-none">Key Board</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Find and log key movements</p>
                </div>
                <div className="relative w-full sm:w-96 group">
                   <div className="absolute inset-0 bg-[#003366]/5 rounded-2xl blur-xl group-focus-within:bg-[#003366]/10 transition-all opacity-0 group-focus-within:opacity-100" />
                   <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#003366] transition-colors" />
                      <input
                        type="text"
                        placeholder="Search Room or Code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all placeholder:text-slate-400 placeholder:font-bold outline-none"
                      />
                   </div>
                </div>
             </div>

             <div className="p-6">
                {loading ? (
                   <div className="py-24 flex flex-col items-center">
                      <LoadingPage />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">Syncing Key Board...</p>
                   </div>
                ) : filteredKeys.length > 0 ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {filteredKeys.map(k => (
                         <div 
                           key={k.id} 
                           onClick={() => handleSelectKey(k)}
                           className={`group relative p-6 bg-white border-2 rounded-[2rem] cursor-pointer transition-all duration-300 ${
                             selectedKey?.id === k.id ? 'border-[#003366] shadow-lg shadow-[#003366]/10 ring-4 ring-[#003366]/5' : 'border-slate-100 hover:border-[#003366]/30 hover:shadow-xl hover:shadow-[#003366]/5'
                           }`}
                         >
                            <div className="flex justify-between items-start mb-6">
                               <div className="flex items-center gap-4">
                                  <div className={`p-4 rounded-[1.25rem] ring-2 ring-offset-2 ${getStatusColor(k.status)}`}>
                                     {k.status === 'with_student' ? <UserCheck className="w-6 h-6" /> : 
                                      k.status === 'with_porter' ? <DoorOpen className="w-6 h-6" /> : 
                                      <AlertTriangle className="w-6 h-6" />}
                                  </div>
                                  <div>
                                     <h3 className="font-black text-slate-900 text-xl leading-none group-hover:text-[#003366] transition-colors">Unit {k.roomNumber}</h3>
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{k.keyCode}</p>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="mt-8 flex items-center justify-between pt-4 border-t-2 border-slate-50">
                               <ModernBadge variant={getStatusBadgeVariant(k.status)}>
                                  {k.status.replace(/_/g, ' ')}
                               </ModernBadge>
                               
                               {k.status === 'with_student' && k.holderName && (
                                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[120px] bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                     {k.holderName}
                                  </div>
                               )}
                            </div>
                         </div>
                      ))}
                   </div>
                ) : (
                   <div className="py-24 px-8 text-center opacity-50">
                      <Key className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">No Keys Found</p>
                      <Button variant="outline" className="border-2 border-slate-200 text-[10px] font-black uppercase tracking-widest rounded-xl" onClick={() => setSearch('')}>Clear Search</Button>
                   </div>
                )}
             </div>
           </div>
        </div>

        {/* Right Column: Key Details & Actions */}
        <div className="space-y-6">
           {selectedKey ? (
              <div className="border-2 border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden p-10 animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-slate-50">
                    <div>
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Selection</div>
                       <h2 className="text-3xl font-black text-slate-900 leading-none">Unit {selectedKey.roomNumber}</h2>
                    </div>
                    <div className={`p-4 rounded-[1.25rem] ring-4 ring-offset-2 ${getStatusColor(selectedKey.status)}`}>
                       <Key className="w-6 h-6" />
                    </div>
                 </div>

                 <div className="space-y-6 mb-10">
                    <div className="flex justify-between items-center p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</span>
                       <ModernBadge variant={getStatusBadgeVariant(selectedKey.status)}>
                          {selectedKey.status.replace(/_/g, ' ')}
                       </ModernBadge>
                    </div>
                    
                    {selectedKey.status === 'with_student' && selectedKey.holderName && (
                       <div className="flex justify-between items-center p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">With Resident</span>
                          <span className="text-sm font-black text-slate-900 tracking-tight">{selectedKey.holderName}</span>
                       </div>
                    )}
                 </div>

                 {/* Action Center */}
                 <div className="space-y-4 mb-10 border-t-2 border-slate-100 pt-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Execute Transaction</h3>
                    
                    {selectedKey.status === 'with_porter' ? (
                       <Button 
                         onClick={() => handleTransaction(selectedKey.roomId, 'collect_from_porter')}
                         disabled={transactionLoading}
                         className="w-full bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 font-black rounded-2xl h-14 text-[10px] uppercase tracking-widest transition-all hover:-translate-y-0.5"
                       >
                          <ArrowRight className="w-4 h-4 mr-2" /> Hand Out to Resident
                       </Button>
                    ) : selectedKey.status === 'with_student' ? (
                       <Button 
                         onClick={() => handleTransaction(selectedKey.roomId, 'return_to_porter')}
                         disabled={transactionLoading}
                         className="w-full bg-[#003366] hover:bg-[#002244] shadow-xl shadow-[#003366]/20 font-black rounded-2xl h-14 text-[10px] uppercase tracking-widest text-white transition-all hover:-translate-y-0.5"
                       >
                          <DoorOpen className="w-4 h-4 mr-2" /> Log Return to Board
                       </Button>
                    ) : (
                       <Button 
                         onClick={() => handleTransaction(selectedKey.roomId, 'return_to_porter')}
                         disabled={transactionLoading}
                         className="w-full bg-[#B8860B] hover:bg-[#9A6F09] shadow-xl shadow-[#B8860B]/20 font-black rounded-2xl h-14 text-[10px] uppercase tracking-widest text-white transition-all hover:-translate-y-0.5"
                       >
                          <Zap className="w-4 h-4 mr-2" /> Issue Replacement Key
                       </Button>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-4">
                       <Button 
                         variant="outline" 
                         onClick={() => handleTransaction(selectedKey.roomId, 'lost_report')}
                         disabled={transactionLoading || selectedKey.status === 'lost'}
                         className="border-2 border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black rounded-2xl h-12 text-[10px] uppercase tracking-widest"
                       >
                          Report Lost
                       </Button>
                       <Button 
                         variant="outline"
                         onClick={() => handleTransaction(selectedKey.roomId, 'damage_report')}
                         disabled={transactionLoading || selectedKey.status === 'damaged'} 
                         className="border-2 border-amber-100 bg-amber-50 hover:bg-amber-100 text-amber-700 font-black rounded-2xl h-12 text-[10px] uppercase tracking-widest"
                       >
                          Report Damaged
                       </Button>
                    </div>
                 </div>

                 {/* Key History Mini-log */}
                 <div>
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Log</h3>
                       <History className="w-5 h-5 text-slate-300" />
                    </div>
                    
                    <div className="space-y-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                       {historyLoading ? (
                          <div className="py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading history...</div>
                       ) : keyHistory.length > 0 ? (
                          keyHistory.map((log) => (
                             <div key={log.id} className="relative pl-8 group">
                                <div className="absolute left-2 top-0 bottom-[-24px] w-0.5 bg-slate-100 rounded-full group-last:hidden" />
                                <div className="absolute top-1.5 left-[3px] h-2.5 w-2.5 rounded-full border-[3px] border-white bg-[#003366] ring-2 ring-slate-100" />
                                
                                <div className="flex justify-between items-start mb-1">
                                   <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{log.type.replace(/_/g, ' ')}</div>
                                   <div className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </div>
                                </div>
                                <div className="text-[10px] font-bold text-slate-500">
                                   By: <span className="font-black text-[#003366]">{log.porterName}</span>
                                </div>
                             </div>
                          ))
                       ) : (
                          <div className="py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50">
                             No recorded transactions
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           ) : (
              <div className="border-none shadow-sm rounded-2xl bg-[#003366] p-10 text-white relative overflow-hidden h-full min-h-[500px] flex flex-col items-center justify-center text-center">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck className="h-48 w-48 text-white" />
                 </div>
                 <div className="relative z-10 space-y-6 max-w-xs">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center mx-auto mb-8">
                       <Key className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight">Select a Key</h3>
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest leading-loose">
                       Search the key board and select a room to view its status and execute transactions.
                    </p>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
