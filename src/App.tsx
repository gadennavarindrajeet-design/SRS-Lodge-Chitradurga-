import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Bed, Calendar, FileText, IndianRupee, Settings, 
  Search, Bell, HelpCircle, LogOut, Plus, Users, CheckCircle2, 
  Clock, TrendingUp, Filter, Download, Trash2, Edit2, ChevronRight,
  Menu, X, ShieldCheck, MapPin, Phone, Mail, User, Lock, Building2,
  CreditCard, BarChart3, PieChart, Loader2, ArrowRight, ArrowLeft, QrCode,
  MessageSquare, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { cn } from './lib/utils';
import { useTranslation } from 'react-i18next';
import './lib/i18n';
import { getRevenueForecast, chatWithAssistant } from './lib/ai';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { encryptData, decryptData } from './lib/encryption';
import { scanAadhaar } from './lib/ocr';
import { parseAadhaarQR } from './lib/aadhaar';
import { QRScanner } from './components/QRScanner';
import { loadRazorpay, createRazorpayOrder } from './lib/payments';
import { sendWhatsAppMessage } from './lib/whatsapp';
import { ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';

// Firebase Imports
import { auth, db, storage } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  orderBy,
  limit,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';

// --- Types ---
interface UserData {
  lodgeID: string;
  name: string;
  owner_name: string;
  email: string;
  ownerPhone?: string;
  gstNumber?: string;
  type: 'lodge' | 'public';
  role: 'SuperAdmin' | 'LodgeOwner' | 'Manager' | 'ReceptionStaff' | 'CleaningStaff';
  is_super_admin: boolean;
  subscriptionStatus: 'trial' | 'monthly' | 'yearly' | 'expired';
  trialStartDate: any;
  subscriptionExpiry: any;
  is_disabled?: boolean;
  staff?: Record<string, { role: string, name: string }>;
  blacklistedGuests?: string[];
  referralCode?: string;
  commissionRate?: number;
  totalRevenue?: number;
}

interface MaintenanceTask {
  id: string;
  roomID: string;
  roomNumber: string;
  issue: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: any;
}

interface HousekeepingTask {
  id: string;
  roomID: string;
  roomNumber: string;
  status: 'dirty' | 'cleaning' | 'clean';
  assignedTo?: string;
  updatedAt: any;
}

interface Room {
  id: string;
  room_number: string;
  type: string;
  price: number;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  customer_name?: string;
  customer_id?: string;
  customer_phone?: string;
  check_in_date?: any;
  advance_paid?: number;
  lodgeID: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  aadhaar: string;
  aadhaarDisplay?: string;
  aadhaarImageURL?: string;
  room: string;
  checkIn: any;
  checkOut: any;
  amount: number;
  advance_paid: number;
  lodgeID: string;
}

// --- Components ---

const Button = ({ children, className, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200',
    secondary: 'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50',
    ghost: 'bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200',
  };
  return (
    <button 
      className={cn(
        'px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50',
        variants[variant as keyof typeof variants],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ label, icon: Icon, ...props }: any) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">{label}</label>}
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={16} />}
      <input 
        className={cn(
          "w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3 px-4 text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all",
          Icon && "pl-11"
        )}
        {...props}
      />
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<UserData | null>(null);
  const [view, setView] = useState<'login' | 'dashboard' | 'rooms' | 'reports' | 'whatsapp' | 'public' | 'admin' | 'subscription' | 'staff' | 'housekeeping' | 'maintenance' | 'bookings' | 'ai' | 'agents' | 'calendar'>('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // First check if it's a lodge owner or staff
        let userDoc = await getDoc(doc(db, 'lodges', firebaseUser.uid));
        
        // If not found in lodges, it might be a staff member
        if (!userDoc.exists()) {
          // Staff members are stored under their lodge's staff map, but for login simplicity
          // we might want a separate staff collection or just use custom claims.
          // For this demo, we'll assume staff are also in the 'lodges' collection with a 'role'
          userDoc = await getDoc(doc(db, 'staff', firebaseUser.uid));
        }

        if (userDoc.exists()) {
          const u = userDoc.data() as UserData;
          
          // Check subscription status
          const now = new Date();
          const expiry = u.subscriptionExpiry?.toDate ? u.subscriptionExpiry.toDate() : new Date(u.subscriptionExpiry);
          
          if (!u.is_super_admin && expiry < now && u.subscriptionStatus !== 'expired') {
            await updateDoc(doc(db, 'lodges', firebaseUser.uid), { subscriptionStatus: 'expired' });
            u.subscriptionStatus = 'expired';
          }

          setUser(u);
          
          if (u.is_super_admin) {
            setView('admin');
          } else if (u.subscriptionStatus === 'expired') {
            setView('subscription');
          } else {
            setView(u.type === 'public' ? 'public' : 'dashboard');
          }
        }
      } else {
        setUser(null);
        setView('login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setView('login');
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zinc-900" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {view === 'login' ? (
        <Login onSuccess={(u: any) => { 
          setUser(u); 
          if (u.is_super_admin) setView('admin');
          else if (u.subscriptionStatus === 'expired') setView('subscription');
          else setView(u.type === 'public' ? 'public' : 'dashboard');
        }} />
      ) : (
        <div className="flex flex-col h-screen">
          <Navbar user={user} setView={setView} currentView={view} onLogout={handleLogout} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24">
            <AnimatePresence mode="wait">
              {view === 'dashboard' && <Dashboard key="dashboard" user={user} />}
              {view === 'rooms' && <Rooms key="rooms" user={user} />}
              {view === 'reports' && <Reports key="reports" user={user} />}
              {view === 'whatsapp' && <WhatsAppManager key="whatsapp" user={user} />}
              {view === 'staff' && <StaffManagement key="staff" user={user} />}
              {view === 'housekeeping' && <HousekeepingManagement key="housekeeping" user={user} />}
              {view === 'maintenance' && <MaintenanceTracking key="maintenance" user={user} />}
              {view === 'ai' && <AIAssistant key="ai" user={user} />}
              {view === 'agents' && <AgentSystem key="agents" user={user} />}
              {view === 'calendar' && <BookingCalendar key="calendar" user={user} />}
              {view === 'public' && <PublicPortal key="public" />}
              {view === 'admin' && <SuperAdminDashboard key="admin" />}
              {view === 'subscription' && <SubscriptionView key="subscription" user={user} />}
            </AnimatePresence>
          </main>
        </div>
      )}
    </div>
  );
}

// --- Sub-Views ---

function Navbar({ user, setView, currentView, onLogout }: any) {
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

function Login({ onSuccess }: any) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', lodgeName: '', phone: '', address: '', gstNumber: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const firebaseUser = userCredential.user;
        
        const trialStart = new Date();
        const trialExpiry = new Date();
        trialExpiry.setDate(trialExpiry.getDate() + 7);

        const userData: UserData = {
          lodgeID: firebaseUser.uid,
          name: formData.lodgeName,
          owner_name: formData.name,
          email: formData.email,
          ownerPhone: formData.phone,
          gstNumber: formData.gstNumber || '',
          type: 'lodge',
          role: 'LodgeOwner',
          is_super_admin: false,
          subscriptionStatus: 'trial',
          trialStartDate: Timestamp.fromDate(trialStart),
          subscriptionExpiry: Timestamp.fromDate(trialExpiry),
          staff: {},
          blacklistedGuests: []
        };

        await setDoc(doc(db, 'lodges', firebaseUser.uid), userData);
        
        // Seed initial rooms
        for (let i = 101; i <= 105; i++) {
          await addDoc(collection(db, 'rooms'), {
            lodgeID: firebaseUser.uid,
            room_number: i.toString(),
            type: 'Single',
            price: 800,
            status: 'available'
          });
        }
        
        onSuccess(userData);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const firebaseUser = userCredential.user;
        const userDoc = await getDoc(doc(db, 'lodges', firebaseUser.uid));
        if (userDoc.exists()) {
          onSuccess(userDoc.data());
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-900">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6">L</div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-zinc-400 font-bold mt-2">Manage your lodge with ease.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <Input label="Lodge Name" icon={Building2} placeholder="Grand Palace" value={formData.lodgeName} onChange={(e: any) => setFormData({...formData, lodgeName: e.target.value})} />
              <Input label="GST Number (Optional)" icon={FileText} placeholder="29AAAAA0000A1Z5" value={formData.gstNumber} onChange={(e: any) => setFormData({...formData, gstNumber: e.target.value})} />
              <Input label="Owner Name" icon={User} placeholder="John Doe" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} />
              <Input label="Phone" icon={Phone} placeholder="9876543210" value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} />
            </>
          )}
          <Input label="Email / Login ID" icon={Mail} type="email" placeholder="admin@lodge.com" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} />
          <Input label="Password" icon={Lock} type="password" placeholder="••••••••" value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})} />
          
          <Button type="submit" disabled={loading} className="w-full py-4 rounded-2xl text-base mt-4">
            {loading ? <Loader2 className="animate-spin" /> : (isRegister ? 'Register Lodge' : 'Login to Dashboard')}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm font-bold text-zinc-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-zinc-900 hover:underline">
            {isRegister ? 'Login here' : 'Register your lodge'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

function Dashboard({ user }: { user: UserData | null }) {
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

const Camera = ({ onCapture, onClose }: { onCapture: (img: string) => void, onClose: () => void }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(err => alert("Camera access denied: " + err.message));
    
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const data = canvasRef.current.toDataURL('image/jpeg');
        onCapture(data);
        stream?.getTracks().forEach(t => t.stop());
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-4">
      <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-3xl bg-zinc-800" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-4 mt-8">
        <Button variant="secondary" onClick={onClose} className="rounded-full w-16 h-16 p-0"><X size={24} /></Button>
        <button onClick={capture} className="w-20 h-20 bg-white rounded-full border-8 border-zinc-200 active:scale-90 transition-transform" />
      </div>
    </div>
  );
};

function Rooms({ user }: { user: UserData | null }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [aadhaarImg, setAadhaarImg] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', aadhaar: '', paid: 0 });
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'rooms'), where('lodgeID', '==', user.lodgeID));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
      setRooms(roomData.sort((a, b) => a.room_number.localeCompare(b.room_number)));
    });
    return () => unsubscribe();
  }, [user]);

  const handleScan = async (img: string) => {
    setAadhaarImg(img);
    setScanning(true);
    try {
      const { name, aadhaar } = await scanAadhaar(img);
      if (name) setFormData(prev => ({ ...prev, name }));
      if (aadhaar) setFormData(prev => ({ ...prev, aadhaar }));
    } catch (err) {
      console.error("OCR Error:", err);
    } finally {
      setScanning(false);
    }
  };

  const handleQRScan = (data: string) => {
    const parsed = parseAadhaarQR(data);
    setFormData(prev => ({
      ...prev,
      name: parsed.name || prev.name,
      aadhaar: parsed.uid || prev.aadhaar,
      address: parsed.address || prev.address,
      // Note: Gender and DOB could also be stored if fields existed
    }));
  };

  const handleCheckIn = async (e: any) => {
    e.preventDefault();
    if (!selectedRoom || !user) return;

    // Repeat Customer Detection
    const qRepeat = query(collection(db, 'customers'), where('lodgeID', '==', user.lodgeID), where('aadhaar', '==', encryptData(formData.aadhaar)));
    const repeatSnap = await getDocs(qRepeat);
    if (!repeatSnap.empty) {
      alert(`👋 Welcome back! This guest has stayed with us ${repeatSnap.size} times before.`);
    }

    // Check Blacklist
    if (user.blacklistedGuests?.includes(formData.aadhaar)) {
      alert("⚠️ WARNING: This guest is in the blacklist!");
      if (!confirm("Do you still want to proceed with check-in?")) return;
    }

    setLoading(true);
    try {
      let aadhaarURL = '';
      if (aadhaarImg) {
        const storageRef = ref(storage, `aadhaar/${user.lodgeID}/${Date.now()}.jpg`);
        await uploadString(storageRef, aadhaarImg, 'data_url');
        aadhaarURL = await getDownloadURL(storageRef);
      }

      const encryptedAadhaar = encryptData(formData.aadhaar);

      const customerRef = await addDoc(collection(db, 'customers'), {
        lodgeID: user.lodgeID,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        aadhaar: encryptedAadhaar, // Store encrypted
        aadhaarDisplay: formData.aadhaar.slice(-4).padStart(12, '*'), // For UI
        aadhaarImageURL: aadhaarURL,
        room: selectedRoom.room_number,
        checkIn: serverTimestamp(),
        checkOut: null,
        amount: 0,
        advance_paid: formData.paid
      });

      // Send Booking Confirmation via WhatsApp
      try {
        await sendWhatsAppMessage({
          to: formData.phone,
          message: `Hello ${formData.name}, your booking for Room ${selectedRoom.room_number} at ${user.name} is confirmed! 🏨 We look forward to seeing you.`,
          lodgeID: user.lodgeID,
          lodgeName: user.name,
          guestName: formData.name
        });
      } catch (waErr) {
        console.error("WhatsApp Confirmation Error:", waErr);
      }

      await updateDoc(doc(db, 'rooms', selectedRoom.id), {
        status: 'occupied',
        customer_name: formData.name,
        customer_id: customerRef.id,
        customer_phone: formData.phone,
        check_in_date: new Date().toISOString(),
        advance_paid: formData.paid
      });

      setShowCheckIn(false);
      setAadhaarImg(null);
      setFormData({ name: '', phone: '', address: '', aadhaar: '', paid: 0 });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedRoom || !user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'customers'), 
        where('lodgeID', '==', user.lodgeID), 
        where('room', '==', selectedRoom.room_number),
        where('checkOut', '==', null)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const customerDoc = snap.docs[0];
        await updateDoc(doc(db, 'customers', customerDoc.id), {
          checkOut: serverTimestamp(),
          amount: selectedRoom.price
        });
      }

      // GST Logic (12% for rooms < 7500, 18% for rooms > 7500)
      const basePrice = selectedRoom.price || 0;
      const gstRate = basePrice > 7500 ? 0.18 : 0.12;
      const cgst = (basePrice * gstRate) / 2;
      const sgst = (basePrice * gstRate) / 2;
      const totalWithGst = basePrice + cgst + sgst;

      // Generate PDF Bill with GST
      const docPdf = new jsPDF();
      docPdf.setFontSize(22);
      docPdf.text(user.name || 'LodgeEase', 105, 20, { align: 'center' });
      if (user.gstNumber) {
        docPdf.setFontSize(10);
        docPdf.text(`GSTIN: ${user.gstNumber}`, 105, 26, { align: 'center' });
      }
      docPdf.setFontSize(10);
      docPdf.text('Tax Invoice / Stay Summary', 105, 32, { align: 'center' });
      docPdf.line(20, 35, 190, 35);
      docPdf.setFontSize(12);
      docPdf.text(`Guest: ${selectedRoom.customer_name}`, 20, 50);
      docPdf.text(`Room: ${selectedRoom.room_number} (${selectedRoom.type})`, 20, 60);
      docPdf.text(`Check-In: ${selectedRoom.check_in_date ? new Date(selectedRoom.check_in_date).toLocaleDateString() : '-'}`, 20, 70);
      docPdf.text(`Check-Out: ${new Date().toLocaleDateString()}`, 20, 80);
      docPdf.line(20, 90, 190, 90);
      docPdf.text('Description', 20, 100);
      docPdf.text('Amount', 170, 100);
      docPdf.text(`Room Charges (${selectedRoom.type})`, 20, 110);
      docPdf.text(`₹${basePrice}`, 170, 110);
      docPdf.text(`CGST (${(gstRate/2)*100}%)`, 20, 120);
      docPdf.text(`₹${cgst.toFixed(2)}`, 170, 120);
      docPdf.text(`SGST (${(gstRate/2)*100}%)`, 20, 130);
      docPdf.text(`₹${sgst.toFixed(2)}`, 170, 130);
      docPdf.text('Advance Paid', 20, 140);
      docPdf.text(`-₹${selectedRoom.advance_paid}`, 170, 140);
      docPdf.setFontSize(14);
      docPdf.text('Total Balance Paid', 20, 160);
      docPdf.text(`₹${(totalWithGst - (selectedRoom.advance_paid || 0)).toFixed(2)}`, 170, 160);
      docPdf.setFontSize(10);
      docPdf.text('Thank you for staying with us!', 105, 180, { align: 'center' });
      
      const pdfBlob = docPdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');

      // Upload PDF to Firebase Storage for WhatsApp sharing
      let remotePdfUrl = '';
      try {
        const pdfRef = ref(storage, `invoices/${user.lodgeID}/${selectedRoom.customer_id}_${Date.now()}.pdf`);
        await uploadBytes(pdfRef, pdfBlob);
        remotePdfUrl = await getDownloadURL(pdfRef);
      } catch (uploadErr) {
        console.error("PDF Upload Error:", uploadErr);
      }

      // WhatsApp Share with Invoice Link
      try {
        await sendWhatsAppMessage({
          to: selectedRoom.customer_phone || '', // Need to ensure phone is available
          message: `Hello ${selectedRoom.customer_name}, thank you for staying at ${user.name}. Your total bill is ₹${totalWithGst.toFixed(2)}. Download invoice: ${remotePdfUrl || window.location.origin}`,
          mediaUrl: remotePdfUrl,
          mediaType: "document",
          lodgeID: user.lodgeID,
          lodgeName: user.name,
          guestName: selectedRoom.customer_name || 'Guest'
        });
      } catch (waErr) {
        console.error("WhatsApp Invoice Error:", waErr);
      }
      
      // Update room status to cleaning
      await updateDoc(doc(db, 'rooms', selectedRoom.id), {
        status: 'cleaning',
        customer_name: null,
        customer_id: null,
        check_in_date: null,
        advance_paid: 0
      });

      // Add to housekeeping
      await addDoc(collection(db, 'housekeeping'), {
        lodgeID: user.lodgeID,
        roomID: selectedRoom.id,
        roomNumber: selectedRoom.room_number,
        status: 'dirty',
        updatedAt: serverTimestamp()
      });

      setShowCheckOut(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const finishCleaning = async (roomId: string) => {
    await updateDoc(doc(db, 'rooms', roomId), { status: 'available' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Room Inventory</h2>
          <p className="text-zinc-400 font-bold">Manage your rooms and guest status.</p>
        </div>
        <Button><Plus size={18} /> Add Room</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {rooms.map(room => (
          <motion.div 
            key={room.id} 
            whileHover={{ y: -5 }}
            onClick={() => {
              setSelectedRoom(room);
              if (room.status === 'available') setShowCheckIn(true);
              else if (room.status === 'occupied') setShowCheckOut(true);
              else if (room.status === 'cleaning') finishCleaning(room.id);
            }}
            className={cn(
              "p-6 rounded-[2rem] border cursor-pointer transition-all relative overflow-hidden group",
              room.status === 'available' ? "bg-white border-zinc-100 hover:border-zinc-900" : 
              room.status === 'cleaning' ? "bg-amber-50 border-amber-200 text-amber-900" :
              "bg-zinc-900 border-zinc-900 text-white"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-2xl font-black">{room.room_number}</span>
              <div className={cn(
                "w-2 h-2 rounded-full", 
                room.status === 'available' ? "bg-emerald-500" : 
                room.status === 'cleaning' ? "bg-amber-500 animate-pulse" :
                "bg-rose-500"
              )} />
            </div>
            <p className={cn(
              "text-[10px] font-black uppercase tracking-widest", 
              room.status === 'available' ? "text-zinc-400" : 
              room.status === 'cleaning' ? "text-amber-600" :
              "text-zinc-500"
            )}>{room.type}</p>
            <p className="text-sm font-bold mt-1">₹{room.price}</p>
            
            {room.status === 'occupied' && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Guest</p>
                <p className="text-xs font-bold truncate">{room.customer_name}</p>
              </div>
            )}
            {room.status === 'cleaning' && (
              <div className="mt-4 pt-4 border-t border-amber-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Cleaning</p>
                <p className="text-xs font-bold">Tap to Ready</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showQRScanner && <QRScanner onScan={handleQRScan} onClose={() => setShowQRScanner(false)} />}
        {showCamera && <Camera onCapture={handleScan} onClose={() => setShowCamera(false)} />}
        {showCheckIn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckIn(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h3 className="text-2xl font-black mb-6">Check-In Room {selectedRoom?.room_number}</h3>
              <form onSubmit={handleCheckIn} className="space-y-4">
                <div className="flex gap-4 items-end">
                  <Input label="Aadhaar" placeholder="12 Digit Number" value={formData.aadhaar} onChange={(e: any) => setFormData({...formData, aadhaar: e.target.value})} />
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => setShowQRScanner(true)} className="h-12 w-12 p-0 rounded-2xl" title="Scan QR">
                      <QrCode size={20} />
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setShowCamera(true)} className="h-12 w-12 p-0 rounded-2xl" title="Capture Photo">
                      <Search size={20} />
                    </Button>
                  </div>
                </div>
                {scanning && <p className="text-[10px] font-black text-emerald-500 animate-pulse uppercase tracking-widest ml-1">Scanning Aadhaar...</p>}
                
                <Input label="Guest Name" placeholder="Full Name" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} />
                <Input label="Phone" placeholder="Mobile Number" value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} />
                <Input label="Address" placeholder="Full Address" value={formData.address} onChange={(e: any) => setFormData({...formData, address: e.target.value})} />
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Aadhaar Card Photo</label>
                  <div className="flex gap-2">
                    {aadhaarImg ? (
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-zinc-100">
                        <img src={aadhaarImg} className="w-full h-full object-cover" />
                        <button onClick={() => setAadhaarImg(null)} className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1"><X size={10} /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setShowCamera(true)} className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all">
                        <Plus size={20} />
                        <span className="text-[8px] font-black uppercase tracking-widest mt-1">Capture</span>
                      </button>
                    )}
                  </div>
                </div>

                <Input label="Advance Paid" type="number" value={formData.paid} onChange={(e: any) => setFormData({...formData, paid: Number(e.target.value)})} />
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowCheckIn(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading} className="flex-1">{loading ? <Loader2 className="animate-spin" /> : 'Confirm Check-In'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showCheckOut && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckOut(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h3 className="text-2xl font-black mb-2">Check-Out Room {selectedRoom?.room_number}</h3>
              <p className="text-zinc-400 font-bold mb-8">Review guest details and finalize payment.</p>
              
              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl">
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Guest Name</p>
                    <p className="font-bold">{selectedRoom?.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Check-In</p>
                    <p className="font-bold">{selectedRoom?.check_in_date ? new Date(selectedRoom.check_in_date).toLocaleDateString() : '-'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-zinc-400">Room Charges</span>
                    <span>₹{selectedRoom?.price}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-zinc-400">Advance Paid</span>
                    <span className="text-emerald-600">-₹{selectedRoom?.advance_paid}</span>
                  </div>
                  <div className="pt-4 border-t border-zinc-100 flex justify-between text-xl font-black">
                    <span>Total Balance</span>
                    <span>₹{(selectedRoom?.price || 0) - (selectedRoom?.advance_paid || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowCheckOut(false)}>Cancel</Button>
                <Button className="flex-1" disabled={loading} onClick={handleCheckOut}>{loading ? <Loader2 className="animate-spin" /> : 'Confirm Payment'}</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Reports({ user }: { user: UserData | null }) {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'customers'), where('lodgeID', '==', user.lodgeID), orderBy('checkIn', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customers = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        checkIn: doc.data().checkIn?.toDate(),
        checkOut: doc.data().checkOut?.toDate()
      } as any));
      setData(customers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(r => ({
      ID: r.id,
      Name: r.name,
      Phone: r.phone,
      Aadhaar: r.aadhaar,
      Room: r.room,
      CheckIn: r.checkIn?.toLocaleString(),
      CheckOut: r.checkOut?.toLocaleString(),
      Amount: r.amount
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, `LodgeEase_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportPDF = () => {
    const docPdf = new jsPDF();
    docPdf.text("Customer History Report", 10, 10);
    let y = 20;
    data.forEach(r => {
      if (y > 280) { docPdf.addPage(); y = 20; }
      docPdf.setFontSize(8);
      docPdf.text(`${r.name} | Room: ${r.room} | In: ${r.checkIn?.toLocaleDateString()} | Amt: ₹${r.amount}`, 10, y);
      y += 10;
    });
    docPdf.save("Customer_Report.pdf");
  };

  const exportCSV = () => {
    const headers = ["ID", "Name", "Phone", "Aadhaar", "Room", "CheckIn", "CheckOut", "Amount"];
    const rows = data.map(r => [
      r.id,
      r.name,
      r.phone,
      r.aadhaarDisplay || 'N/A',
      r.room,
      r.checkIn?.toLocaleString(),
      r.checkOut?.toLocaleString(),
      r.amount
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LodgeEase_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const toggleBlacklist = async (aadhaar: string) => {
    if (!user) return;
    const currentBlacklist = user.blacklistedGuests || [];
    const isBlacklisted = currentBlacklist.includes(aadhaar);
    const newBlacklist = isBlacklisted 
      ? currentBlacklist.filter(a => a !== aadhaar)
      : [...currentBlacklist, aadhaar];
    
    await updateDoc(doc(db, 'lodges', user.lodgeID), {
      blacklistedGuests: newBlacklist
    });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Customer Reports</h2>
          <p className="text-zinc-400 font-bold">Detailed history of all guest stays.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportExcel}><Download size={16} /> Excel</Button>
          <Button variant="secondary" onClick={exportPDF}><Download size={16} /> PDF</Button>
          <Button variant="secondary" onClick={exportCSV}><Download size={16} /> CSV</Button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-50">
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Guest Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Aadhaar</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Room</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Check In</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Check Out</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      {row.aadhaarImageURL && (
                        <img src={row.aadhaarImageURL} className="w-10 h-10 rounded-lg object-cover border border-zinc-100" />
                      )}
                      <div>
                        <p className="font-bold text-zinc-900">{row.name}</p>
                        <p className="text-xs font-bold text-zinc-400">{row.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-zinc-500">{row.aadhaarDisplay || 'N/A'}</td>
                  <td className="px-8 py-6">
                    <span className="bg-zinc-100 px-3 py-1 rounded-lg text-xs font-black">{row.room}</span>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-zinc-500">{row.checkIn?.toLocaleString() || '-'}</td>
                  <td className="px-8 py-6 text-xs font-bold text-zinc-500">
                    {row.checkOut ? row.checkOut.toLocaleString() : <span className="text-emerald-500">Still In</span>}
                  </td>
                  <td className="px-8 py-6 text-right font-black text-zinc-900">
                    <div className="flex justify-end gap-2">
                      {row.amount ? `₹${row.amount}` : '-'}
                      <Button 
                        variant="ghost" 
                        onClick={() => toggleBlacklist(decryptData(row.aadhaar))} 
                        className={cn("w-8 h-8 p-0 rounded-lg", (user?.blacklistedGuests || []).includes(decryptData(row.aadhaar)) ? "text-rose-500 bg-rose-50" : "text-zinc-400")}
                      >
                        <ShieldCheck size={14} />
                      </Button>
                    </div>
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

function StaffManagement({ user }: { user: UserData | null }) {
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

function AIAssistant({ user }: { user: UserData | null }) {
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

function HousekeepingManagement({ user }: { user: UserData | null }) {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'housekeeping'), where('lodgeID', '==', user.lodgeID));
    onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as HousekeepingTask)));
    });
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

function MaintenanceTracking({ user }: { user: UserData | null }) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ roomNumber: '', issue: '', priority: 'medium' });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'maintenance'), where('lodgeID', '==', user.lodgeID));
    onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceTask)));
    });
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
          <p className="text-zinc-400 font-bold">Manage repairs and facility issues.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus size={18} /> Report Issue</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
          <div key={task.id} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-lg font-black">Room {task.roomNumber}</span>
              <span className={cn(
                "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                task.priority === 'high' ? "bg-rose-50 text-rose-500" : task.priority === 'medium' ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
              )}>
                {task.priority} Priority
              </span>
            </div>
            <p className="text-sm font-bold text-zinc-600">{task.issue}</p>
            <div className="flex justify-between items-center pt-4 border-t border-zinc-50">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{task.status}</span>
              <div className="flex gap-2">
                <Button variant="ghost" className="w-8 h-8 p-0"><Edit2 size={14} /></Button>
                <Button variant="ghost" className="w-8 h-8 p-0 text-rose-500"><Trash2 size={14} /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h3 className="text-2xl font-black mb-6">Report Maintenance Issue</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <Input label="Room Number" placeholder="101" value={formData.roomNumber} onChange={(e: any) => setFormData({...formData, roomNumber: e.target.value})} />
                <Input label="Issue Description" placeholder="AC not cooling" value={formData.issue} onChange={(e: any) => setFormData({...formData, issue: e.target.value})} />
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

function BookingCalendar({ user }: { user: UserData | null }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'customers'), where('lodgeID', '==', user.lodgeID));
    onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const qRooms = query(collection(db, 'rooms'), where('lodgeID', '==', user.lodgeID));
    onSnapshot(qRooms, (snap) => {
      setRooms(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room)));
    });
  }, [user]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Booking Calendar</h2>
          <p className="text-zinc-400 font-bold">Manage room availability and future bookings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}><ArrowLeft size={16} /></Button>
          <span className="bg-white px-6 py-2 rounded-xl border border-zinc-100 font-black uppercase tracking-widest text-xs flex items-center">{format(currentDate, 'MMMM yyyy')}</span>
          <Button variant="secondary" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}><ArrowRight size={16} /></Button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-[150px_repeat(31,1fr)] border-b border-zinc-50">
            <div className="p-4 bg-zinc-50 font-black text-[10px] uppercase tracking-widest text-zinc-400">Room</div>
            {days.map(day => (
              <div key={day.toString()} className="p-2 text-center font-black text-[8px] uppercase tracking-widest text-zinc-400 border-l border-zinc-50">
                {format(day, 'd')}
              </div>
            ))}
          </div>
          {rooms.map(room => (
            <div key={room.id} className="grid grid-cols-[150px_repeat(31,1fr)] border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
              <div className="p-4 font-bold text-xs">Room {room.room_number}</div>
              {days.map(day => {
                const isBooked = bookings.find(b => b.room === room.room_number && b.checkIn && b.checkOut && isSameDay(b.checkIn.toDate(), day));
                return (
                  <div key={day.toString()} className="border-l border-zinc-50 min-h-[40px] p-1">
                    {isBooked && (
                      <div className="w-full h-full bg-zinc-900 rounded-lg flex items-center justify-center text-[8px] text-white font-black uppercase tracking-widest">
                        Booked
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentSystem({ user }: { user: UserData | null }) {
  const [agents, setAgents] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', commission: 10 });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'agents'), where('lodgeID', '==', user.lodgeID));
    onSnapshot(q, (snap) => {
      setAgents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    await addDoc(collection(db, 'agents'), {
      ...formData,
      lodgeID: user.lodgeID,
      referralCode: `AGENT_${Math.random().toString(36).substring(7).toUpperCase()}`,
      totalCommission: 0,
      createdAt: serverTimestamp()
    });
    setShowAdd(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Agent Referrals</h2>
          <p className="text-zinc-400 font-bold">Manage referral agents and commissions.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus size={18} /> Add Agent</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black">{agent.name}</h3>
                <p className="text-xs font-bold text-zinc-400">{agent.phone}</p>
              </div>
              <div className="bg-zinc-900 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                {agent.referralCode}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 p-4 rounded-2xl">
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Commission</p>
                <p className="text-lg font-black">{agent.commission}%</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl">
                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Earned</p>
                <p className="text-lg font-black text-emerald-600">₹{agent.totalCommission}</p>
              </div>
            </div>
            <Button variant="secondary" className="w-full">View Bookings</Button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h3 className="text-2xl font-black mb-6">Register New Agent</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <Input label="Agent Name" placeholder="John Agent" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} />
                <Input label="Phone" placeholder="9876543210" value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} />
                <Input label="Commission Rate (%)" type="number" value={formData.commission} onChange={(e: any) => setFormData({...formData, commission: Number(e.target.value)})} />
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1">Register Agent</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PublicPortal() {
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

function SubscriptionView({ user }: { user: UserData | null }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async (plan: 'monthly' | 'yearly') => {
    if (!user) return;
    setLoading(true);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const amount = plan === 'monthly' ? 999 : 9999;
      const order = await createRazorpayOrder(amount, plan, user.lodgeID);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_lodgeease',
        amount: order.amount,
        currency: order.currency,
        name: 'LodgeEase SaaS',
        description: `${plan.toUpperCase()} Subscription`,
        order_id: order.id,
        handler: async (response: any) => {
          // Success handler
          const expiry = new Date();
          if (plan === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
          else expiry.setFullYear(expiry.getFullYear() + 1);

          await updateDoc(doc(db, 'lodges', user.lodgeID), {
            subscriptionStatus: plan,
            subscriptionExpiry: Timestamp.fromDate(expiry)
          });

          // Log subscription
          await addDoc(collection(db, 'subscriptions'), {
            lodgeID: user.lodgeID,
            planType: plan,
            paymentID: response.razorpay_payment_id,
            amount,
            startDate: serverTimestamp(),
            expiryDate: Timestamp.fromDate(expiry),
            status: 'active'
          });

          window.location.reload();
        },
        prefill: {
          name: user.owner_name,
          email: user.email,
          contact: user.ownerPhone
        },
        theme: { color: '#18181b' }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-20 text-center space-y-12">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Clock size={40} />
        </div>
        <h2 className="text-5xl font-black tracking-tighter">Subscription Expired</h2>
        <p className="text-zinc-400 font-bold text-lg">Your trial or subscription has ended. Please upgrade to continue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 space-y-8">
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Standard Plan</p>
            <h3 className="text-4xl font-black">₹999<span className="text-sm text-zinc-400">/mo</span></h3>
          </div>
          <ul className="text-left space-y-4 text-sm font-bold text-zinc-500">
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Unlimited Rooms</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Cloud Storage</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> WhatsApp Integration</li>
          </ul>
          <Button onClick={() => handlePayment('monthly')} disabled={loading} className="w-full py-4 rounded-2xl">Upgrade Now</Button>
        </div>

        <div className="bg-zinc-900 p-10 rounded-[3rem] text-white space-y-8 relative overflow-hidden">
          <div className="absolute top-6 right-6 bg-emerald-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Best Value</div>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Annual Plan</p>
            <h3 className="text-4xl font-black">₹9,999<span className="text-sm text-zinc-500">/yr</span></h3>
          </div>
          <ul className="text-left space-y-4 text-sm font-bold text-zinc-400">
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> All Monthly Features</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> 2 Months Free</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Priority Support</li>
          </ul>
          <Button onClick={() => handlePayment('yearly')} disabled={loading} className="w-full py-4 rounded-2xl bg-white text-zinc-900 hover:bg-zinc-100">Upgrade Now</Button>
        </div>
      </div>
    </div>
  );
}

function SuperAdminDashboard() {
  const [lodges, setLodges] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalLodges: 0, activeSubs: 0, totalRevenue: 0 });

  useEffect(() => {
    const q = query(collection(db, 'lodges'), where('is_super_admin', '==', false));
    onSnapshot(q, (snap) => {
      const lodgeData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setLodges(lodgeData);
      setStats({
        totalLodges: lodgeData.length,
        activeSubs: lodgeData.filter(l => l.subscriptionStatus !== 'expired').length,
        totalRevenue: lodgeData.reduce((acc, l) => acc + (l.totalRevenue || 0), 0)
      });
    });
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

function WhatsAppManager({ user }: { user: UserData | null }) {
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
