import React, { useState, useEffect } from 'react';
import { 
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserData } from '../types';
import { Button, Input } from './Common';

export function AgentSystem({ user }: { user: UserData | null }) {
  const [agents, setAgents] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', commission: 10 });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'agents'), where('lodgeID', '==', user.lodgeID));
    const unsubscribe = onSnapshot(q, (snap) => {
      setAgents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    await addDoc(collection(db, 'agents'), {
      ...formData,
      lodgeID: user.lodgeID,
      referralCode: `AGENT_${Math.random().toString(36).substring(7).toUpperCase()}`,
      totalCommission: 0,
      createdAt: serverTimestamp()
    });
    setShowAdd(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Agent Referrals</h2>
          <p className="text-zinc-400 font-bold">Manage referral agents and commissions.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus size={18} /> Add Agent</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black">{agent.name}</h3>
                <p className="text-xs font-bold text-zinc-400">{agent.phone}</p>
              </div>
              <div className="bg-zinc-900 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                {agent.referralCode}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 p-4 rounded-2xl">
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Commission</p>
                <p className="text-lg font-black">{agent.commission}%</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl">
                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Earned</p>
                <p className="text-lg font-black text-emerald-600">₹{agent.totalCommission}</p>
              </div>
            </div>
            <Button variant="secondary" className="w-full">View Bookings</Button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h3 className="text-2xl font-black mb-6">Register New Agent</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <Input label="Agent Name" placeholder="John Agent" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} />
                <Input label="Phone" placeholder="9876543210" value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} />
                <Input label="Commission Rate (%)" type="number" value={formData.commission} onChange={(e: any) => setFormData({...formData, commission: Number(e.target.value)})} />
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1">Register Agent</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
