import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserData } from '../types';
import { Button, Input } from './Common';

export function StaffManagement({ user }: { user: UserData | null }) {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'ReceptionStaff' });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'staff'), where('lodgeID', '==', user.lodgeID));
    const unsubscribe = onSnapshot(q, (snap) => {
      setStaff(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddStaff = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      // In a real app, you'd use a Cloud Function to create the user to avoid logging out the current user
      // For this demo, we'll just add to the 'staff' collection
      await addDoc(collection(db, 'staff'), {
        ...formData,
        lodgeID: user.lodgeID,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setFormData({ name: '', email: '', password: '', role: 'ReceptionStaff' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Staff Management</h2>
          <p className="text-zinc-400 font-bold">Manage roles and permissions for your team.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus size={18} /> Add Staff</Button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-50">
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Name</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Role</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {staff.map(member => (
              <tr key={member.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-8 py-6 font-bold text-zinc-900">{member.name}</td>
                <td className="px-8 py-6">
                  <span className="bg-zinc-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-600">
                    {member.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm font-bold text-zinc-500">{member.email}</td>
                <td className="px-8 py-6 text-right">
                  <Button variant="ghost" className="text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></Button>
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
              <h3 className="text-2xl font-black mb-6">Add Staff Member</h3>
              <form onSubmit={handleAddStaff} className="space-y-4">
                <Input label="Full Name" placeholder="Staff Name" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} />
                <Input label="Email" type="email" placeholder="staff@lodge.com" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} />
                <Input label="Password" type="password" placeholder="••••••••" value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})} />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Role</label>
                  <select 
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3 px-4 text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 transition-all"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="Manager">Manager</option>
                    <option value="ReceptionStaff">Reception Staff</option>
                    <option value="CleaningStaff">Cleaning Staff</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading} className="flex-1">{loading ? <Loader2 className="animate-spin" /> : 'Add Staff'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
