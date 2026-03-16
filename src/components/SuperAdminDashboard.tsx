import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { Button } from './Common';

export function SuperAdminDashboard() {
  const [lodges, setLodges] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalLodges: 0, activeSubs: 0, totalRevenue: 0 });

  useEffect(() => {
    const q = query(collection(db, 'lodges'), where('is_super_admin', '==', false));
    const unsubscribe = onSnapshot(q, (snap) => {
      const lodgeData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setLodges(lodgeData);
      setStats({
        totalLodges: lodgeData.length,
        activeSubs: lodgeData.filter(l => l.subscriptionStatus !== 'expired').length,
        totalRevenue: lodgeData.reduce((acc, l) => acc + (l.totalRevenue || 0), 0)
      });
    });
    return () => unsubscribe();
  }, []);

  const toggleSubscription = async (lodge: any) => {
    const newStatus = lodge.subscriptionStatus === 'expired' ? 'trial' : 'expired';
    const newExpiry = new Date();
    if (newStatus === 'trial') newExpiry.setDate(newExpiry.getDate() + 7);
    else newExpiry.setDate(newExpiry.getDate() - 1);

    await updateDoc(doc(db, 'lodges', lodge.id), {
      subscriptionStatus: newStatus,
      subscriptionExpiry: Timestamp.fromDate(newExpiry)
    });
  };

  const toggleSuspension = async (lodge: any) => {
    await updateDoc(doc(db, 'lodges', lodge.id), {
      is_disabled: !lodge.is_disabled
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">System Administration</h2>
          <p className="text-zinc-400 font-bold">Global overview of all registered lodges.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Lodges</p>
          <h3 className="text-4xl font-black">{stats.totalLodges}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Active Subscriptions</p>
          <h3 className="text-4xl font-black text-emerald-500">{stats.activeSubs}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Platform Revenue</p>
          <h3 className="text-4xl font-black text-zinc-900">₹{stats.totalRevenue}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-50">
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Lodge Details</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Expiry</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {lodges.map(lodge => (
              <tr key={lodge.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-100 rounded-2xl flex items-center justify-center font-black text-zinc-900">{lodge.name[0]}</div>
                    <div>
                      <p className="font-bold text-zinc-900">{lodge.name}</p>
                      <p className="text-xs font-bold text-zinc-400">{lodge.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit",
                      lodge.subscriptionStatus === 'expired' ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-500"
                    )}>
                      {lodge.subscriptionStatus}
                    </span>
                    {lodge.is_disabled && <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest ml-1">Suspended</span>}
                  </div>
                </td>
                <td className="px-8 py-6 text-xs font-bold text-zinc-500">
                  {lodge.subscriptionExpiry?.toDate ? lodge.subscriptionExpiry.toDate().toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => toggleSubscription(lodge)}>
                      {lodge.subscriptionStatus === 'expired' ? 'Activate' : 'Deactivate'}
                    </Button>
                    <Button variant={lodge.is_disabled ? 'primary' : 'danger'} onClick={() => toggleSuspension(lodge)}>
                      {lodge.is_disabled ? 'Unsuspend' : 'Suspend'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
