import React, { useState, useEffect } from 'react';
import { 
  ChevronRight
} from 'lucide-react';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { UserData, HousekeepingTask } from '../types';

export function HousekeepingManagement({ user }: { user: UserData | null }) {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'housekeeping'), where('lodgeID', '==', user.lodgeID));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as HousekeepingTask)));
    });
    return () => unsubscribe();
  }, [user]);

  const updateStatus = async (taskId: string, status: string) => {
    await updateDoc(doc(db, 'housekeeping', taskId), { status, updatedAt: serverTimestamp() });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Housekeeping</h2>
          <p className="text-zinc-400 font-bold">Track room cleaning and readiness.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['dirty', 'cleaning', 'clean'].map(status => (
          <div key={status} className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", status === 'dirty' ? "bg-rose-500" : status === 'cleaning' ? "bg-amber-500" : "bg-emerald-500")} />
              {status}
            </h3>
            <div className="space-y-3">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task.id} className="p-4 bg-zinc-50 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-sm font-black">Room {task.roomNumber}</p>
                    <p className="text-[10px] font-bold text-zinc-400">Last update: {task.updatedAt?.toDate().toLocaleTimeString()}</p>
                  </div>
                  <div className="flex gap-1">
                    {status !== 'clean' && (
                      <button onClick={() => updateStatus(task.id, status === 'dirty' ? 'cleaning' : 'clean')} className="p-2 hover:bg-zinc-200 rounded-lg transition-colors">
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
