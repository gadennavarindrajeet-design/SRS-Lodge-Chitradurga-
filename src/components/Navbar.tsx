import React from 'react';
import { 
  LayoutDashboard, Bed, Calendar, FileText, IndianRupee, Settings, 
  Search, Bell, LogOut, Users, CheckCircle2, ShieldCheck, Phone
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { UserData } from '../types';

export function Navbar({ user, setView, currentView, onLogout }: any) {
  const { t, i18n } = useTranslation();
  const navItems = user?.type === 'public' ? [
    { id: 'public', label: t('search'), icon: Search },
    { id: 'bookings', label: t('bookings'), icon: Calendar },
  ] : user?.is_super_admin ? [
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ] : [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'rooms', label: t('rooms'), icon: Bed },
    { id: 'housekeeping', label: t('housekeeping'), icon: CheckCircle2 },
    { id: 'maintenance', label: t('maintenance'), icon: Settings },
    { id: 'reports', label: t('reports'), icon: FileText },
    { id: 'police', label: 'Police Register', icon: ShieldCheck },
    { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
    { id: 'calendar', label: t('calendar'), icon: Calendar },
    { id: 'ai', label: t('ai_assistant'), icon: Bell },
    ...(user?.role === 'LodgeOwner' || user?.role === 'Manager' ? [
      { id: 'staff', label: t('staff'), icon: Users },
      { id: 'agents', label: 'Agents', icon: IndianRupee }
    ] : []),
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">L</div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none">{user?.name || 'LodgeEase'}</h1>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-1">{user?.type === 'public' ? 'Guest Portal' : 'Management'}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-zinc-100/50 p-1 rounded-2xl overflow-x-auto max-w-[50%]">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                currentView === item.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-900"
              )}
            >
              <item.icon size={12} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select 
            onChange={(e) => changeLanguage(e.target.value)}
            className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-2 py-1 rounded-lg outline-none"
            value={i18n.language}
          >
            <option value="en">EN</option>
            <option value="hi">HI</option>
            <option value="kn">KN</option>
          </select>
          <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-rose-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
