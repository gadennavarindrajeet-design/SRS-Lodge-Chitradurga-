import React, { useState, useEffect } from 'react';
import { 
  Users, IndianRupee, TrendingUp, BarChart3, Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { UserData } from '../types';
import { Button } from './Common';

export function Dashboard({ user }: { user: UserData | null }) {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    // Real-time stats listener
    const qRooms = query(collection(db, 'rooms'), where('lodgeID', '==', user.lodgeID));
    const unsubscribeRooms = onSnapshot(qRooms, (snapshot) => {
      const rooms = snapshot.docs.map(doc => doc.data());
      const total = rooms.length;
      const occupied = rooms.filter(r => r.status === 'occupied').length;
      const cleaning = rooms.filter(r => r.status === 'cleaning').length;
      
      // Fetch revenue and history for analytics
      const qCustomers = query(collection(db, 'customers'), where('lodgeID', '==', user.lodgeID));
      getDocs(qCustomers).then(customerSnap => {
        const customers = customerSnap.docs.map(doc => doc.data());
        
        const now = new Date();
        const todayStr = now.toLocaleDateString();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const dailyRevenue = customers
          .filter(c => c.checkOut && c.checkOut.toDate().toLocaleDateString() === todayStr)
          .reduce((acc, c) => acc + (c.amount || 0), 0);

        const monthlyRevenue = customers
          .filter(c => c.checkOut && c.checkOut.toDate().getMonth() === thisMonth && c.checkOut.toDate().getFullYear() === thisYear)
          .reduce((acc, c) => acc + (c.amount || 0), 0);

        const totalRevenue = customers.reduce((acc, c) => acc + (c.amount || 0), 0);

        // Prepare chart data (last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dStr = d.toLocaleDateString();
          const dayRev = customers
            .filter(c => c.checkOut && c.checkOut.toDate().toLocaleDateString() === dStr)
            .reduce((acc, c) => acc + (c.amount || 0), 0);
          return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), val: dayRev };
        }).reverse();

        setChartData(last7Days);
        setStats({
          total,
          occupied,
          cleaning,
          available: total - occupied - cleaning,
          dailyRevenue,
          monthlyRevenue,
          totalRevenue,
          occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0
        });
      });
    });

    return () => unsubscribeRooms();
  }, [user]);

  if (!stats) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  const cards = [
    { label: 'Occupancy Rate', value: `${stats.occupancyRate}%`, icon: Users, color: 'bg-rose-50 text-rose-600' },
    { label: 'Daily Revenue', value: `₹${stats.dailyRevenue}`, icon: IndianRupee, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Monthly Revenue', value: `₹${stats.monthlyRevenue}`, icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: BarChart3, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Dashboard Overview</h2>
          <p className="text-zinc-400 font-bold">Real-time performance metrics for {user?.name}.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-zinc-100 shadow-sm flex gap-6">
          <div className="text-center">
            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Available</p>
            <p className="text-lg font-black text-emerald-500">{stats.available}</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Occupied</p>
            <p className="text-lg font-black text-rose-500">{stats.occupied}</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Cleaning</p>
            <p className="text-lg font-black text-amber-500">{stats.cleaning}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", card.color)}>
              <card.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{card.label}</p>
            <h3 className="text-2xl font-black text-zinc-900 mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <h3 className="text-xl font-black mb-6">Revenue Trend (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#a1a1aa'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#a1a1aa'}} />
                <Tooltip />
                <Area type="monotone" dataKey="val" stroke="#18181b" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <h3 className="text-xl font-black mb-6">Occupancy Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie 
                  data={[
                    {name: 'Available', value: stats.available}, 
                    {name: 'Occupied', value: stats.occupied}, 
                    {name: 'Cleaning', value: stats.cleaning}
                  ]} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
