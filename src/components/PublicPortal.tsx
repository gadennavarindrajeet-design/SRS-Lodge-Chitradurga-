import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Button } from './Common';

export function PublicPortal() {
  const [lodges, setLodges] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'lodges'), where('is_super_admin', '==', false));
    getDocs(q).then(snap => {
      setLodges(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-6 py-12">
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900">Find your next stay.</motion.h2>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={24} />
          <input 
            type="text" 
            placeholder="Search by city, name, or address..." 
            className="w-full bg-white border-2 border-zinc-100 rounded-[2.5rem] py-6 pl-16 pr-8 text-lg font-bold shadow-xl shadow-zinc-200/50 outline-none focus:border-zinc-900 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lodges.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.address?.toLowerCase().includes(search.toLowerCase())).map((lodge, i) => (
          <motion.div 
            key={lodge.id} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-lg shadow-zinc-200/20 hover:shadow-xl transition-all group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-zinc-900 rounded-[2rem] flex items-center justify-center text-white font-black text-2xl group-hover:scale-110 transition-transform">
                {lodge.name[0]}
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Available</div>
            </div>
            <h3 className="text-2xl font-black mb-2">{lodge.name}</h3>
            <div className="flex items-center gap-2 text-zinc-400 font-bold text-sm mb-6">
              <MapPin size={14} />
              {lodge.address}
            </div>
            <Button className="w-full py-4 rounded-2xl group-hover:bg-zinc-800">
              View Rooms <ArrowRight size={16} />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
