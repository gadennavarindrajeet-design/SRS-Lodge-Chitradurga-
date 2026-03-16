import React, { useState } from 'react';
import { 
  Bell, ArrowRight, Loader2, TrendingUp, Users
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserData } from '../types';
import { Button } from './Common';
import { getRevenueForecast, chatWithAssistant } from '../lib/ai';

export function AIAssistant({ user }: { user: UserData | null }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: string, text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<any[]>([]);

  const handleSend = async () => {
    if (!message || !user) return;
    setLoading(true);
    const newChat = [...chat, { role: 'user', text: message }];
    setChat(newChat);
    setMessage('');
    
    try {
      const response = await chatWithAssistant(message, { lodgeName: user.name, role: user.role });
      setChat([...newChat, { role: 'assistant', text: response || 'Sorry, I am busy.' }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runForecast = async () => {
    setLoading(true);
    try {
      // Dummy historical data for demo
      const dummyData = [
        { date: '2026-03-01', revenue: 5000 },
        { date: '2026-03-02', revenue: 7000 },
        { date: '2026-03-03', revenue: 4500 },
      ];
      const result = await getRevenueForecast(dummyData);
      setForecast(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 flex flex-col h-[600px]">
        <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Bell className="text-zinc-900" /> AI Assistant</h3>
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {chat.map((c, i) => (
            <div key={i} className={cn("flex", c.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[80%] p-4 rounded-2xl text-sm font-bold", c.role === 'user' ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-900")}>
                {c.text}
              </div>
            </div>
          ))}
          {loading && <Loader2 className="animate-spin text-zinc-400 mx-auto" />}
        </div>
        <div className="flex gap-2">
          <input 
            className="flex-1 bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-zinc-900"
            placeholder="Ask anything about your lodge..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} disabled={loading}><ArrowRight size={18} /></Button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] shadow-xl">
          <h3 className="text-lg font-black mb-4">Revenue Forecast</h3>
          <p className="text-zinc-400 text-xs font-bold mb-6">Predict future earnings using Gemini 3.1 AI.</p>
          <Button variant="secondary" onClick={runForecast} disabled={loading} className="w-full">Run AI Forecast</Button>
          
          {forecast.length > 0 && (
            <div className="mt-6 space-y-3">
              {forecast.slice(0, 5).map((f, i) => (
                <div key={i} className="flex justify-between items-center text-xs font-bold border-b border-white/10 pb-2">
                  <span className="text-zinc-500">{f.date}</span>
                  <span className="text-emerald-400">₹{f.predictedRevenue}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <h3 className="text-lg font-black mb-4">Quick Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><TrendingUp size={16} /></div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Growth</p>
                <p className="text-sm font-black">+12% this week</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center"><Users size={16} /></div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Retention</p>
                <p className="text-sm font-black">65% repeat guests</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
