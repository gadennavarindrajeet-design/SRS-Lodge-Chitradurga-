import React, { useState, useEffect } from 'react';
import { 
  Loader2, Send, MessageSquare
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { UserData } from '../types';
import { Button } from './Common';
import { sendWhatsAppMessage } from '../lib/whatsapp';

export function WhatsAppManager({ user }: { user: UserData | null }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [promoMessage, setPromoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'marketing'>('logs');

  useEffect(() => {
    if (!user) return;
    
    // Fetch logs
    const qLogs = query(collection(db, 'whatsapp_logs'), where('lodgeID', '==', user.lodgeID), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeLogs = onSnapshot(qLogs, (snap) => {
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch unique customers for marketing
    const qCust = query(collection(db, 'customers'), where('lodgeID', '==', user.lodgeID));
    getDocs(qCust).then(snap => {
      const unique = new Map();
      snap.docs.forEach(doc => {
        const data = doc.data();
        if (!unique.has(data.phone)) {
          unique.set(data.phone, data);
        }
      });
      setCustomers(Array.from(unique.values()));
    });

    return () => unsubscribeLogs();
  }, [user]);

  const sendPromotion = async () => {
    if (!user || !promoMessage) return;
    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const customer of customers) {
      try {
        await sendWhatsAppMessage({
          to: customer.phone,
          message: promoMessage,
          lodgeID: user.lodgeID,
          lodgeName: user.name,
          guestName: customer.name
        });
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    alert(`Marketing campaign complete! ✅ ${successCount} sent, ❌ ${failCount} failed.`);
    setPromoMessage("");
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight">WhatsApp Automation</h2>
          <p className="text-zinc-400 font-bold">Manage automated alerts and marketing campaigns.</p>
        </div>
        <div className="flex bg-zinc-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('logs')}
            className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'logs' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400")}
          >
            Message Logs
          </button>
          <button 
            onClick={() => setActiveTab('marketing')}
            className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'marketing' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400")}
          >
            Marketing
          </button>
        </div>
      </div>

      {activeTab === 'logs' ? (
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-50">
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Guest</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Message</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-zinc-900">{log.guestName}</p>
                    <p className="text-xs font-bold text-zinc-400">{log.to}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-zinc-600 line-clamp-1 max-w-xs">{log.message}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      log.status === 'sent' ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                    )}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right text-xs font-bold text-zinc-400">
                    {log.timestamp?.toDate().toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
              <h3 className="text-xl font-black mb-6">Create Campaign</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Message Content</label>
                  <textarea 
                    value={promoMessage}
                    onChange={(e) => setPromoMessage(e.target.value)}
                    placeholder="E.g., Special 20% discount for your next stay! Book now at LodgeEase."
                    className="w-full h-40 p-6 rounded-3xl bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900 transition-all resize-none text-sm font-medium"
                  />
                </div>
                <Button 
                  onClick={sendPromotion} 
                  disabled={loading || !promoMessage}
                  className="w-full py-4 rounded-2xl"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-2" /> Blast to {customers.length} Guests</>}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white">
              <MessageSquare className="text-emerald-400 mb-4" size={32} />
              <h3 className="text-xl font-black mb-2">Marketing Tips</h3>
              <ul className="space-y-4 text-sm text-zinc-400 font-medium">
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" /> Keep messages short and personalized.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" /> Include a clear call-to-action (CTA).</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" /> Avoid sending messages too frequently.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
