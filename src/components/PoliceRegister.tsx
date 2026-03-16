import React, { useState, useEffect } from 'react';
import { 
  Printer, Loader2
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { UserData } from '../types';
import { Button } from './Common';

export function PoliceRegister({ user }: { user: UserData | null }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'customers'), where('lodgeID', '==', user.lodgeID), orderBy('checkIn', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        checkIn: doc.data().checkIn?.toDate(),
        checkOut: doc.data().checkOut?.toDate()
      })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const printRegister = () => {
    window.print();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Police Guest Register</h2>
          <p className="text-zinc-400 font-bold">Digital register for local authority compliance.</p>
        </div>
        <Button onClick={printRegister}><Printer size={18} /> Print Register</Button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <div className="p-8 border-b border-zinc-50 hidden print:block text-center">
          <h1 className="text-2xl font-black uppercase tracking-tighter">{user?.name} - GUEST REGISTER</h1>
          <p className="text-xs font-bold text-zinc-500">{user?.address}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-r border-zinc-100">Guest Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-r border-zinc-100">Phone</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-r border-zinc-100">Aadhaar</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-r border-zinc-100">Room</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-r border-zinc-100">Persons</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-r border-zinc-100">Purpose</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-r border-zinc-100">Check In</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Check Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-900 border-r border-zinc-100">{row.name}</td>
                  <td className="px-6 py-4 text-xs font-bold text-zinc-500 border-r border-zinc-100">{row.phone}</td>
                  <td className="px-6 py-4 text-xs font-bold text-zinc-500 border-r border-zinc-100">{row.aadhaarDisplay}</td>
                  <td className="px-6 py-4 text-xs font-black border-r border-zinc-100">{row.room}</td>
                  <td className="px-6 py-4 text-xs font-bold text-zinc-500 border-r border-zinc-100">{row.numPersons || 1}</td>
                  <td className="px-6 py-4 text-xs font-bold text-zinc-500 border-r border-zinc-100">{row.purposeOfVisit || 'Tourism'}</td>
                  <td className="px-6 py-4 text-[10px] font-bold text-zinc-500 border-r border-zinc-100">{row.checkIn?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-[10px] font-bold text-zinc-500">
                    {row.checkOut ? row.checkOut.toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
