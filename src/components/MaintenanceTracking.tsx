import React, { useState, useEffect } from 'react';
import { 
  Plus, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserData, MaintenanceTask } from '../types';
import { Button, Input } from './Common';

export function MaintenanceTracking({ user }: { user: UserData | null }) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ roomNumber: '', issue: '', priority: 'medium' });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'maintenance'), where('lodgeID', '==', user.lodgeID));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceTask)));
    });
    return () => unsubscribe();
  }, [user]);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    await addDoc(collection(db, 'maintenance'), {
      ...formData,
      lodgeID: user.lodgeID,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    setShowAdd(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Maintenance</h2>
          <p className="text-zinc-400 font-bold">Report and track room issues.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus size={18} /> New Issue</Button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-50">
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Room</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Issue</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Priority</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {tasks.map(task => (
              <tr key={task.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-8 py-6 font-bold text-zinc-900">{task.roomNumber}</td>
                <td className="px-8 py-6 text-sm font-bold text-zinc-500">{task.issue}</td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    task.priority === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs font-bold text-zinc-400">{task.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h3 className="text-2xl font-black mb-6">Report Issue</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <Input label="Room Number" placeholder="e.g. 101" value={formData.roomNumber} onChange={(e: any) => setFormData({...formData, roomNumber: e.target.value})} />
                <Input label="Issue Description" placeholder="What needs fixing?" value={formData.issue} onChange={(e: any) => setFormData({...formData, issue: e.target.value})} />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Priority</label>
                  <select 
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3 px-4 text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 transition-all"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1">Report Issue</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
