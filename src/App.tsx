/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link, useParams } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  LayoutDashboard, 
  Bed, 
  UserPlus, 
  User as UserIcon,
  Lock,
  Mail,
  TrendingUp,
  LogOut, 
  Key, 
  Phone, 
  IdCard, 
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Menu,
  X,
  Plus,
  Edit2,
  Settings,
  MapPin,
  Users,
  Clock,
  Calendar,
  FileText,
  MessageCircle,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart,
  ArrowRight,
  Building2,
  ShieldAlert,
  ShieldCheck,
  UserMinus,
  Trash2,
  MoreVertical,
  ChevronDown,
  CreditCard,
  Wallet,
  History,
  Activity,
  Zap,
  Star,
  Bell,
  HelpCircle,
  Info,
  ExternalLink,
  RefreshCw,
  Database,
  Cloud,
  Lock as LockIcon,
  Shield,
  Smartphone,
  Globe,
  Monitor,
  Layout,
  Grid,
  List,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUp,
  ArrowDown,
  Check,
  Copy,
  Share2,
  Eye,
  EyeOff,
  UserMinus as UserMinusIcon,
  UserPlus as UserPlusIcon,
  Bed as BedIcon,
  Home,
  Briefcase,
  Coffee,
  Utensils,
  Car,
  Wifi,
  Tv,
  Wind,
  Sun,
  Moon,
  CloudRain,
  Snowflake,
  Thermometer,
  Droplets,
  Waves,
  Mountain,
  Trees,
  Palmtree,
  Compass,
  Map,
  Navigation,
  Locate,
  LocateFixed,
  Flag,
  Tag,
  Ticket,
  Percent,
  Gift,
  ShoppingBag,
  ShoppingCart,
  Store,
  Package,
  Truck,
  Box,
  Archive,
  HardDrive,
  Cpu,
  Server,
  Terminal,
  Code,
  Braces,
  Parentheses,
  Hash,
  AtSign,
  Link as LinkIcon,
  Paperclip,
  Image as ImageIcon,
  Video,
  Music,
  Mic,
  Speaker,
  Headphones,
  Camera,
  Play,
  Pause,
  Square,
  Circle,
  Triangle,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Send,
  Inbox,
  Archive as ArchiveIcon,
  Trash,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Bell as BellIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  User as UserIconLucide,
  Users as UsersIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Globe as GlobeIcon,
  LayoutDashboard as DashboardIcon,
  FileText as FileTextIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Activity as ActivityIcon,
  Zap as ZapIcon,
  Shield as ShieldIcon,
  Lock as LockIconLucide,
  Key as KeyIcon,
  CreditCard as CreditCardIcon,
  Wallet as WalletIcon,
  IndianRupee as RupeeIcon,
  DollarSign,
  Euro,
  PoundSterling,
  Bitcoin,
  Plus as PlusIcon,
  Minus,
  X as XIcon,
  Check as CheckIcon,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  RefreshCw as RefreshIcon,
  Download as DownloadIcon,
  Upload,
  Share as ShareIcon,
  ExternalLink as ExternalLinkIcon,
  MoreHorizontal,
  MoreVertical as MoreVerticalIcon,
  Menu as MenuIcon,
  Grid as GridIcon,
  List as ListIcon,
  Maximize as MaximizeIcon,
  Minimize as MinimizeIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Edit as EditIcon,
  Save,
  Copy as CopyIcon,
  Clipboard,
  Search as SearchIconLucide,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  Printer,
  Share2 as Share2Icon,
  MessageSquare,
  MessageCircle as MessageCircleIcon,
  HelpCircle as HelpCircleIcon,
  Info as InfoIcon,
  AlertTriangle,
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircle2 as CheckCircle2Icon,
  XCircle,
  PlayCircle,
  PauseCircle,
  StopCircle,
  PlusCircle,
  MinusCircle,
  Settings2,
  Sliders,
  ToggleLeft,
  ToggleRight,
  CheckSquare,
  Square as SquareIcon,
  Circle as CircleIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface User {
  id: number;
  name: string;
  email: string;
  type: 'lodge' | 'public';
  lodge_name?: string;
  address?: string;
  phone?: string;
  subscription_status?: string;
  subscription_end_date?: string;
  is_super_admin?: boolean;
}

interface Room {
  id: number;
  room_number: string;
  type: string;
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
  customer_name?: string;
  check_in_date?: string;
  advance_paid?: number;
  customer_phone?: string;
  num_guests?: number;
}

interface Stats {
  total: number;
  occupied: number;
  available: number;
  checkins: number;
  checkouts: number;
  revenue: number;
  grossRevenue: number;
  expenses: number;
}

// --- Auth Context Mock ---
const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lodgeease_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData: User, token: string) => {
    localStorage.setItem('lodgeease_token', token);
    localStorage.setItem('lodgeease_user', JSON.stringify(userData));
    if (userData.lodge_name) localStorage.setItem('lodge_name', userData.lodge_name);
    if (userData.address) localStorage.setItem('lodge_address', userData.address);
    if (userData.phone) localStorage.setItem('lodge_phone', userData.phone);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('lodgeease_token');
    localStorage.removeItem('lodgeease_user');
    setUser(null);
  };

  return { user, login, logout, isAuthenticated: !!user };
};

// --- Components ---

const PublicLandingPage = () => {
  const [location, setLocation] = useState('');
  const [lodges, setLodges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuth();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/public/search?location=${location}`);
      const data = await res.json();
      setLodges(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <div className="bg-zinc-900 text-white py-24 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-zinc-900 font-black text-4xl shadow-2xl"
            >
              L
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tighter max-w-4xl"
            >
              Find Your Perfect Stay <br />
              <span className="text-zinc-500 italic">Anywhere, Anytime.</span>
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-2xl"
            >
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-white rounded-3xl shadow-inner">
                  <MapPin className="text-zinc-400" size={24} />
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Search by city or location..." 
                    className="bg-transparent border-none outline-none text-zinc-900 font-bold w-full placeholder:text-zinc-400"
                  />
                </div>
                <button type="submit" className="bg-white text-zinc-900 px-10 py-4 rounded-3xl font-black uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center justify-center gap-3">
                  <Search size={20} />
                  Search
                </button>
              </form>
            </motion.div>

            {!isAuthenticated ? (
              <div className="flex gap-4">
                <Link to="/public/login" className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-all border border-white/10">
                  Public Login
                </Link>
                <Link to="/login" className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold transition-all border border-white/5">
                  Lodge Owner Login
                </Link>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link to="/dashboard" className="px-8 py-3 bg-white text-zinc-900 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-lg flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-zinc-800 rounded-full blur-[150px] opacity-30" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-zinc-800 rounded-full blur-[150px] opacity-30" />
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Available Lodges</h2>
            <p className="text-zinc-500 font-medium mt-1">Discover top-rated properties in your area</p>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 font-black uppercase tracking-widest text-xs">
            <Activity size={16} />
            {lodges.length} Properties Found
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-zinc-900" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lodges.map((lodge) => (
              <motion.div 
                key={lodge.id}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-zinc-200 transition-all overflow-hidden group"
              >
                <div className="h-48 bg-zinc-100 relative overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/${lodge.id}/800/600`} 
                    alt={lodge.lodge_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-zinc-900 font-black text-xs uppercase tracking-widest shadow-lg">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-zinc-900" />
                      4.8
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-black text-zinc-900 mb-2 tracking-tight">{lodge.lodge_name}</h3>
                  <div className="flex items-center gap-2 text-zinc-400 mb-6">
                    <MapPin size={16} />
                    <p className="text-sm font-bold truncate">{lodge.address}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Starting from</p>
                      <p className="text-xl font-black text-zinc-900">₹800<span className="text-xs text-zinc-400 font-bold">/night</span></p>
                    </div>
                    <button 
                      onClick={() => navigate(`/public/lodge/${lodge.id}`)}
                      className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2"
                    >
                      View Rooms
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PublicLoginPage = ({ onLogin }: { onLogin: (u: any, t: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/public/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user, data.token);
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl border border-zinc-100">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 shadow-xl">L</div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Public Login</h2>
          <p className="text-zinc-500 font-medium mt-2">Access your bookings and find stays</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Email Address</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold" placeholder="your@email.com" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-zinc-200 disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login to Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 font-medium">Don't have an account? <Link to="/public/register" className="text-zinc-900 font-black underline">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

const PublicRegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/public/login'), 2000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl border border-zinc-100">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 shadow-xl">L</div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Create Account</h2>
          <p className="text-zinc-500 font-medium mt-2">Join LodgeEase for easy bookings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3">
              <CheckCircle2 size={18} />
              Registration successful! Redirecting...
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Full Name</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Email Address</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold" placeholder="your@email.com" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Phone Number</label>
            <input required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold" placeholder="+91 00000 00000" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-zinc-200 disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 font-medium">Already have an account? <Link to="/public/login" className="text-zinc-900 font-black underline">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

const PublicLodgeDetails = () => {
  const { id } = useParams();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isBookingModal, setIsBookingModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const res = await fetch(`/api/public/lodge/${id}/rooms`);
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      navigate('/public/login');
      return;
    }

    const token = localStorage.getItem('lodgeease_token');
    try {
      const res = await fetch('/api/public/book', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lodgeId: parseInt(id || '0'),
          roomId: selectedRoom.id,
          customerName: user.name,
          customerPhone: user.phone,
          checkInDate,
          checkOutDate
        })
      });

      if (res.ok) {
        alert('Booking confirmed successfully!');
        setIsBookingModal(false);
        fetchRooms();
      } else {
        const data = await res.json();
        alert(data.error || 'Booking failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 font-black uppercase tracking-widest text-xs mb-8 transition-colors">
          <ChevronLeft size={16} />
          Back to Search
        </button>
        <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Available Rooms</h2>
        <p className="text-zinc-500 font-medium mt-2">Select a room to proceed with your booking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room) => (
          <motion.div 
            key={room.id}
            whileHover={{ y: -10 }}
            className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-zinc-200 transition-all group"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl group-hover:scale-110 transition-transform">
                {room.room_number}
              </div>
              <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                {room.type}
              </span>
            </div>
            
            <div className="mb-8">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Price per night</p>
              <h4 className="text-3xl font-black text-zinc-900">₹{room.price}</h4>
            </div>

            <button 
              onClick={() => { setSelectedRoom(room); setIsBookingModal(true); }}
              className="w-full bg-zinc-50 text-zinc-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Book Now
              <ArrowRight size={16} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBookingModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="p-10 bg-zinc-900 text-white">
                <h3 className="text-2xl font-black tracking-tight">Confirm Booking</h3>
                <p className="text-zinc-400 text-sm mt-1">Room {selectedRoom.room_number} • {selectedRoom.type}</p>
              </div>
              <div className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Check-In</label>
                    <input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-zinc-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Check-Out</label>
                    <input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-zinc-900" />
                  </div>
                </div>
                <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-zinc-500">Total Price</span>
                    <span className="text-xl font-black text-zinc-900">₹{selectedRoom.price}</span>
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pay at property during check-in</p>
                </div>
                <button onClick={handleBook} className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200">
                  Confirm Reservation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PublicMyBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBookings = async () => {
    const token = localStorage.getItem('lodgeease_token');
    try {
      const res = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-zinc-900 tracking-tight">My Bookings</h2>
        <p className="text-zinc-500 font-medium mt-2">Manage your upcoming and past reservations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                {booking.room_number}
              </div>
              <span className={cn(
                "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest",
                booking.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"
              )}>
                {booking.status}
              </span>
            </div>
            <h4 className="text-xl font-black text-zinc-900 mb-6">{booking.lodge_name || 'Lodge Stay'}</h4>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-zinc-400">
                <Calendar size={16} />
                <span className="text-sm font-bold">
                  {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <Bed size={16} />
                <span className="text-sm font-bold">{booking.room_type} Room</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-1 h-full bg-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-zinc-200">
            <Calendar className="mx-auto text-zinc-200 mb-4" size={48} />
            <p className="text-zinc-400 font-bold">No bookings found</p>
            <Link to="/" className="text-zinc-900 font-black underline mt-2 block">Start searching for lodges</Link>
          </div>
        )}
      </div>
    </div>
  );
};

const Navbar = ({ onLogout, currentView, setView }: { onLogout: () => void, currentView: string, setView: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lodgeName, setLodgeName] = useState(localStorage.getItem('lodge_name') || 'LodgeEase');
  const user = JSON.parse(localStorage.getItem('lodgeease_user') || '{}');
  const isSuperAdmin = user?.is_super_admin;
  const isPublic = user?.type === 'public';

  const navItems = isPublic ? [
    { id: 'dashboard', label: 'Search Lodges', icon: Search },
    { id: 'my-bookings', label: 'My Bookings', icon: Calendar },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rooms', label: 'Rooms', icon: Bed },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'expenses', label: 'Expenses', icon: IndianRupee },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    const handleStorage = () => {
      setLodgeName(localStorage.getItem('lodge_name') || 'LodgeEase');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
          <div 
            className="bg-white/80 backdrop-blur-xl border border-zinc-100 rounded-[2rem] px-6 py-3 flex items-center gap-4 shadow-xl shadow-zinc-200/50 cursor-pointer group"
            onClick={() => !isSuperAdmin && setView('dashboard')}
          >
            <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-black text-xl group-hover:scale-110 transition-transform">
              L
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-black text-zinc-900 tracking-tight block leading-none mb-1">{isSuperAdmin ? 'LodgeEase Dev' : lodgeName}</span>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">{isSuperAdmin ? 'Developer Console' : 'Management'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-xl border border-zinc-100 rounded-[2rem] px-4 py-2 shadow-xl shadow-zinc-200/50 group focus-within:ring-2 focus-within:ring-zinc-900 transition-all">
              <Search size={16} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
              <input 
                type="text" 
                placeholder="Search rooms, guests..." 
                className="bg-transparent border-none outline-none text-xs font-bold text-zinc-900 placeholder:text-zinc-400 w-40 focus:w-60 transition-all"
              />
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-zinc-100 rounded-[2rem] p-1.5 flex items-center gap-1 shadow-xl shadow-zinc-200/50">
              <button className="w-11 h-11 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-2xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              </button>
              <button className="w-11 h-11 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-2xl transition-all">
                <HelpCircle size={20} />
              </button>
            </div>

            {!isSuperAdmin && (
              <div className="hidden lg:flex items-center gap-1 bg-white/80 backdrop-blur-xl border border-zinc-100 rounded-[2rem] p-1.5 shadow-xl shadow-zinc-200/50">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id as any)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                      currentView === item.id 
                        ? "bg-zinc-900 text-white shadow-lg" 
                        : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            <div className="bg-white/80 backdrop-blur-xl border border-zinc-100 rounded-[2rem] p-1.5 flex items-center gap-2 shadow-xl shadow-zinc-200/50">
            <div className="hidden md:flex flex-col items-end px-4">
                <span className="text-xs font-black text-zinc-900 tracking-tight">{user?.name}</span>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{isSuperAdmin ? 'Dev' : isPublic ? 'Public' : 'Admin'}</span>
              </div>
              <button 
                onClick={onLogout}
                className="w-11 h-11 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav - Refined */}
      {!isSuperAdmin && (
        <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md">
          <div className="bg-zinc-900/95 backdrop-blur-2xl rounded-[2.5rem] p-2 flex items-center justify-around shadow-2xl border border-white/10">
            {navItems.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={cn(
                  "flex flex-col items-center justify-center w-14 h-14 rounded-[1.5rem] transition-all relative group",
                  currentView === item.id 
                    ? "bg-white text-zinc-900 scale-110 shadow-xl" 
                    : "text-zinc-500 hover:text-white"
                )}
              >
                <item.icon size={20} />
                {currentView === item.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-1 w-1 h-1 bg-zinc-900 rounded-full"
                  />
                )}
              </button>
            ))}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-14 rounded-[1.5rem] transition-all text-zinc-500 hover:text-white",
                isOpen ? "bg-white text-zinc-900" : ""
              )}
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      )}
      <div className="h-24" /> {/* Spacer for fixed top nav */}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && !isSuperAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[45] lg:hidden"
          >
            <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <div className="absolute bottom-[120px] left-4 right-4 bg-white rounded-5xl p-8 shadow-2xl border border-zinc-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-zinc-900">Navigation</h3>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-zinc-50 rounded-full text-zinc-400">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setView(item.id as any); setIsOpen(false); }}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-3xl text-sm font-bold transition-all",
                      currentView === item.id 
                        ? "bg-zinc-900 text-white" 
                        : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                    )}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-zinc-100">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-3xl bg-rose-50 text-rose-600 font-bold"
                >
                  <LogOut size={20} />
                  Logout from System
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const SubscriptionExpired = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Trial Expired</h2>
        <p className="text-zinc-500 mb-8">
          Your 7-day free trial has expired. Please subscribe to a plan to continue using LodgeEase and access your dashboard.
        </p>
        
        <div className="space-y-4">
          <div className="p-4 border border-zinc-100 rounded-2xl text-left hover:border-zinc-900 transition-all cursor-pointer group">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-zinc-900">Monthly Plan</span>
              <span className="text-zinc-900 font-black">₹999/mo</span>
            </div>
            <p className="text-xs text-zinc-400">Perfect for small lodges starting out.</p>
          </div>
          
          <div className="p-4 border border-zinc-100 rounded-2xl text-left hover:border-zinc-900 transition-all cursor-pointer group bg-zinc-50">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-zinc-900">Yearly Plan</span>
              <span className="text-zinc-900 font-black">₹9,999/yr</span>
            </div>
            <p className="text-xs text-zinc-400">Best value for established properties. Save 20%.</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100">
          <p className="text-sm text-zinc-400 mb-4">Contact support to activate your subscription</p>
          <a 
            href="mailto:support@lodgeease.com"
            className="inline-flex items-center gap-2 text-zinc-900 font-bold hover:underline"
          >
            <Phone size={16} />
            +91 98765 43210
          </a>
        </div>
      </motion.div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const [lodges, setLodges] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [publicUsers, setPublicUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lodges' | 'users' | 'feed' | 'financials'>('lodges');

  const fetchData = async () => {
    const token = localStorage.getItem('lodgeease_token');
    try {
      const [lodgesRes, statsRes, activitiesRes, financialsRes, usersRes] = await Promise.all([
        fetch('/api/admin/lodges', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/recent-activities', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/financials', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/public-users', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setLodges(await lodgesRes.json());
      setStats(await statsRes.json());
      setActivities(await activitiesRes.json());
      setFinancials(await financialsRes.json());
      setPublicUsers(await usersRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activateSubscription = async (lodgeId: number, planType: string) => {
    const token = localStorage.getItem('lodgeease_token');
    try {
      const res = await fetch('/api/admin/activate-subscription', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lodgeId, planType })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLodgeStatus = async (lodgeId: number, isDisabled: boolean) => {
    const token = localStorage.getItem('lodgeease_token');
    try {
      const res = await fetch('/api/admin/toggle-lodge-status', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lodgeId, isDisabled })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const impersonateLodge = async (lodgeId: number) => {
    const token = localStorage.getItem('lodgeease_token');
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lodgeId })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('lodgeease_token', data.token);
        localStorage.setItem('lodgeease_user', JSON.stringify(data.user));
        localStorage.setItem('lodge_name', data.user.lodge_name);
        window.location.href = '/'; // Refresh to apply new user state
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">System Overview</h1>
          <p className="text-zinc-500">Global monitoring and management console</p>
        </div>
        <button 
          onClick={fetchData}
          className="p-3 bg-zinc-100 text-zinc-900 rounded-2xl hover:bg-zinc-200 transition-all flex items-center gap-2 font-bold text-sm"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Lodges', value: stats.totalLodges, icon: Building2, color: 'text-zinc-900' },
            { label: 'Active Subs', value: stats.activeSubscriptions, icon: CheckCircle2, color: 'text-emerald-600' },
            { label: 'Expired Subs', value: stats.expiredSubscriptions, icon: AlertCircle, color: 'text-rose-600' },
            { label: 'Disabled', value: stats.disabledLodges, icon: ShieldAlert, color: 'text-zinc-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-zinc-50 rounded-xl">
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
              <div className="text-2xl font-black text-zinc-900">{stat.value}</div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 bg-zinc-100 p-1.5 rounded-[2rem] w-fit">
        {[
          { id: 'lodges', label: 'Lodges', icon: Building2 },
          { id: 'users', label: 'Public Users', icon: Users },
          { id: 'feed', label: 'System Feed', icon: Activity },
          { id: 'financials', label: 'Platform Financials', icon: IndianRupee },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === tab.id 
                ? "bg-white text-zinc-900 shadow-sm" 
                : "text-zinc-400 hover:text-zinc-900"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-sm min-h-[400px]">
        {activeTab === 'lodges' && (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Lodge Details</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Owner</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Expires</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {lodges.map((lodge) => (
                <tr key={lodge.id} className={`hover:bg-zinc-50/50 transition-colors ${lodge.is_disabled ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900">{lodge.lodge_name}</div>
                    <div className="text-xs text-zinc-400">{lodge.login_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-zinc-600">{lodge.owner_name}</div>
                    <div className="text-xs text-zinc-400">{lodge.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        lodge.subscription_status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                        lodge.subscription_status === 'trial' ? 'bg-blue-50 text-blue-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {lodge.subscription_status}
                      </span>
                      {lodge.is_disabled && (
                        <span className="w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500">
                          Disabled
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {lodge.subscription_end_date ? new Date(lodge.subscription_end_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => activateSubscription(lodge.id, 'monthly')}
                        className="px-3 py-1 bg-zinc-900 text-white text-xs rounded-lg font-bold hover:bg-zinc-800"
                      >
                        Monthly
                      </button>
                      <button 
                        onClick={() => activateSubscription(lodge.id, 'yearly')}
                        className="px-3 py-1 bg-zinc-100 text-zinc-900 text-xs rounded-lg font-bold hover:bg-zinc-200"
                      >
                        Yearly
                      </button>
                      <button 
                        onClick={() => toggleLodgeStatus(lodge.id, !lodge.is_disabled)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          lodge.is_disabled 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        }`}
                        title={lodge.is_disabled ? 'Enable Lodge' : 'Disable Lodge'}
                      >
                        {lodge.is_disabled ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                      </button>
                      <button 
                        onClick={() => impersonateLodge(lodge.id)}
                        className="p-1.5 bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-200 transition-colors"
                        title="Go To Lodge"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'users' && (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">User Name</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Phone</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {publicUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{user.phone}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'feed' && (
          <div className="p-8 space-y-6">
            {activities.map((activity, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className={cn(
                  "p-2 rounded-xl",
                  activity.type === 'lodge_registration' ? "bg-blue-50 text-blue-600" :
                  activity.type === 'user_registration' ? "bg-emerald-50 text-emerald-600" :
                  "bg-purple-50 text-purple-600"
                )}>
                  {activity.type === 'lodge_registration' ? <Building2 size={20} /> :
                   activity.type === 'user_registration' ? <Users size={20} /> :
                   <Calendar size={20} />}
                </div>
                <div>
                  <div className="text-sm font-black text-zinc-900">{activity.title}</div>
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                    {activity.type.replace('_', ' ')} • {new Date(activity.date).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'financials' && financials && (
          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Revenue Breakdown</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-zinc-100 pb-4">
                    <span className="text-zinc-500 font-bold">Total Platform Revenue</span>
                    <span className="text-3xl font-black text-zinc-900">₹{financials.totalRevenue}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-zinc-100 pb-4">
                    <span className="text-zinc-500 font-bold">Monthly Revenue</span>
                    <span className="text-2xl font-black text-emerald-600">₹{financials.monthlyRevenue}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-zinc-100 pb-4">
                    <span className="text-zinc-500 font-bold">Total System Expenses</span>
                    <span className="text-2xl font-black text-rose-600">₹{financials.totalExpenses}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-zinc-900 font-black uppercase tracking-widest text-sm">Net Platform Profit</span>
                    <span className="text-4xl font-black text-zinc-900">₹{financials.netProfit}</span>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-6">Platform Health</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                        <span>Lodge Retention</span>
                        <span>94%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[94%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                        <span>Subscription Conversion</span>
                        <span>12%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[12%]" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const RegisterPage = () => {
  const [lodgeName, setLodgeName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lodgeName, ownerName, phone, address, loginId, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className="hidden md:flex md:w-1/3 bg-zinc-900 p-16 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-zinc-900 font-black text-3xl mb-12 shadow-2xl">L</div>
          <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tighter">
            Join LodgeEase <br />
            <span className="text-zinc-500">Grow Your Business</span>
          </h1>
        </div>
        <div className="relative z-10">
          <p className="text-zinc-400 text-lg font-medium leading-relaxed">
            Empowering lodge owners with professional tools for modern hospitality management.
          </p>
        </div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-zinc-800 rounded-full blur-[100px] opacity-50" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8 md:p-16 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="mb-12">
            <h3 className="text-4xl font-extrabold text-zinc-900 mb-3 tracking-tight">Register Your Lodge</h3>
            <p className="text-zinc-500 font-medium text-lg">Start managing your property with LodgeEase today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-3">
                <AlertCircle size={20} />
                {error}
              </div>
            )}
            {success && (
              <div className="p-5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-3">
                <CheckCircle2 size={20} />
                Registration successful! Redirecting...
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Lodge Name</label>
                <input required value={lodgeName} onChange={e => setLodgeName(e.target.value)} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold" placeholder="e.g. Grand Plaza" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Owner Name</label>
                <input required value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold" placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Phone Number</label>
                <input required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold" placeholder="+91 00000 00000" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Login ID (Email)</label>
                <input required type="email" value={loginId} onChange={e => setLoginId(e.target.value)} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold" placeholder="admin@yourlodge.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Address</label>
              <textarea required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all resize-none font-bold" rows={2} placeholder="Full property address..." />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl shadow-zinc-200">
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'Register Lodge'}
            </button>

            <p className="text-center text-zinc-500 font-medium">
              Already have an account? <Link to="/login" className="text-zinc-900 font-black hover:underline">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (u: any, t: string) => void }) => {
  const [email, setEmail] = useState('admin@lodgeease.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user, data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-zinc-900 p-20 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-zinc-900 font-black text-4xl mb-12 shadow-2xl">
            L
          </div>
          <h1 className="text-7xl font-extrabold text-white leading-tight tracking-tighter">
            LodgeEase <br />
            <span className="text-zinc-500">Management Platform</span>
          </h1>
        </div>
        
        <div className="relative z-10">
          <p className="text-zinc-400 max-w-md text-xl font-medium leading-relaxed">
            The unified solution for managing multiple lodge properties, guest bookings, and financial analytics with precision.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-zinc-800 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-zinc-800 rounded-full blur-[150px] opacity-50" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-20">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-16">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl mb-6 shadow-xl">
              L
            </div>
            <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight">LodgeEase</h2>
          </div>

          <div className="mb-12">
            <h3 className="text-4xl font-extrabold text-zinc-900 mb-3 tracking-tight">Lodge Owner Login</h3>
            <p className="text-zinc-500 font-medium text-lg">Please enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-3"
              >
                <AlertCircle size={20} />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
                  placeholder="admin@lodgeease.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl shadow-zinc-200"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'Sign In to Dashboard'}
            </button>

            <div className="pt-6 text-center space-y-4">
              <p className="text-zinc-500 font-medium">
                Don't have an account? <Link to="/register" className="text-zinc-900 font-black hover:underline">Register Lodge</Link>
              </p>
              <div className="pt-6 border-t border-zinc-100">
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-4">Demo Credentials</p>
                <div className="flex flex-col gap-2">
                  <div className="px-4 py-3 bg-zinc-50 rounded-xl text-xs font-bold text-zinc-600 flex justify-between">
                    <span>Email:</span>
                    <span className="text-zinc-900">admin@lodgeease.com</span>
                  </div>
                  <div className="px-4 py-3 bg-zinc-50 rounded-xl text-xs font-bold text-zinc-600 flex justify-between">
                    <span>Password:</span>
                    <span className="text-zinc-900">admin123</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  // Form states
  const [roomNumber, setRoomNumber] = useState('');
  const [type, setType] = useState('Single');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('available');

  const fetchRooms = async () => {
    const token = localStorage.getItem('lodgeease_token');
    try {
      const res = await fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${token}` } });
      setRooms(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('lodgeease_token');
    const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
    const method = editingRoom ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roomNumber, type, price: parseFloat(price), status })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingRoom(null);
        resetForm();
        fetchRooms();
      } else {
        const data = await res.json();
        alert(data.error || 'Operation failed');
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  const resetForm = () => {
    setRoomNumber('');
    setType('Single');
    setPrice('');
    setStatus('available');
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setRoomNumber(room.room_number);
    setType(room.type);
    setPrice(room.price.toString());
    setStatus(room.status);
    setIsModalOpen(true);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 lg:pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Room Management</h2>
          <p className="text-zinc-500 font-medium mt-2">Configure and manage your property's room inventory.</p>
        </div>
        <button 
          onClick={() => { setEditingRoom(null); resetForm(); setIsModalOpen(true); }}
          className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
        >
          <Plus size={24} />
          Add New Room
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bento-card p-8 group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center font-black text-zinc-900 text-2xl group-hover:bg-zinc-900 group-hover:text-white transition-all shadow-sm">
                {room.room_number}
              </div>
              <button 
                onClick={() => openEditModal(room)}
                className="p-3 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-2xl transition-all"
              >
                <Edit2 size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block mb-1">Room Type</span>
                <h4 className="text-xl font-black text-zinc-900 tracking-tight">{room.type}</h4>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block mb-1">Pricing</span>
                  <p className="text-2xl font-black text-zinc-900 tracking-tight">₹{room.price}</p>
                </div>
                <span className={cn(
                  "text-[10px] uppercase font-black px-3 py-1.5 rounded-xl tracking-widest inline-flex items-center gap-2",
                  room.status === 'available' ? "bg-emerald-50 text-emerald-600" : 
                  room.status === 'occupied' ? "bg-orange-50 text-orange-600" : "bg-zinc-100 text-zinc-500"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", room.status === 'available' ? "bg-emerald-500" : "bg-orange-500")} />
                  {room.status}
                </span>
              </div>
            </div>

            {/* Decorative background accent */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-zinc-50 rounded-full blur-3xl group-hover:bg-zinc-100 transition-colors" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 bg-zinc-900 text-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      {editingRoom ? 'Edit Room' : 'New Room'}
                    </h3>
                    <p className="text-zinc-400 text-sm mt-1">Enter the room details below.</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                    <X size={28} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Room Number</label>
                  <input 
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
                    placeholder="e.g. 101"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Room Type</label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold appearance-none"
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Deluxe">Deluxe</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Price (₹)</label>
                    <input 
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {editingRoom && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</label>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all mt-4"
                >
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Expenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchExpenses = async () => {
    setLoading(true);
    const token = localStorage.getItem('lodgeease_token');
    try {
      const res = await fetch(`/api/expenses?page=${page}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setExpenses(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('lodgeease_token');
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ description, amount: parseFloat(amount), category, date })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setDescription('');
        setAmount('');
        fetchExpenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('lodgeease_token');
    try {
      await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 lg:pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Expense Management</h2>
          <p className="text-zinc-500 font-medium mt-2">Track and categorize your property's operational costs.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
        >
          <Plus size={24} />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] relative overflow-hidden group"
        >
          <div className="relative z-10">
            <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest mb-3">Total Expenses</p>
            <p className="text-4xl font-extrabold text-rose-700 tracking-tight">₹{totalExpenses}</p>
            <div className="mt-6 flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Current Page View
            </div>
          </div>
          <IndianRupee className="absolute right-[-10%] bottom-[-10%] text-rose-200/20 w-40 h-40 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {loading ? (
          <div className="col-span-full py-24 text-center">
            <Loader2 className="animate-spin mx-auto text-zinc-300" size={40} />
          </div>
        ) : expenses.length === 0 ? (
          <div className="col-span-full py-24 text-center bento-card">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-4">
              <IndianRupee size={32} />
            </div>
            <p className="text-zinc-400 font-bold italic">No expenses recorded yet.</p>
          </div>
        ) : (
          expenses.map((exp) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bento-card p-8 group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-zinc-900">
                    {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    {new Date(exp.date).getFullYear()}
                  </span>
                </div>
                <button 
                  onClick={() => handleDelete(exp.id)} 
                  className="p-3 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block mb-1">Description</span>
                  <h4 className="text-lg font-black text-zinc-900 tracking-tight truncate">{exp.description}</h4>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block mb-1">Amount</span>
                    <p className="text-2xl font-black text-rose-600 tracking-tight">₹{exp.amount}</p>
                  </div>
                  <span className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {exp.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 mb-12">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl border border-zinc-200 disabled:opacity-30 hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-zinc-900">Page {page}</span>
            <span className="text-sm font-bold text-zinc-400">/ {totalPages}</span>
          </div>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl border border-zinc-200 disabled:opacity-30 hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 bg-zinc-900 text-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">New Expense</h3>
                    <p className="text-zinc-400 text-sm mt-1">Record a new operational cost.</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                    <X size={28} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddExpense} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Description</label>
                  <input 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
                    placeholder="e.g. Electricity Bill"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Amount (₹)</label>
                    <input 
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold appearance-none"
                    >
                      <option value="General">General</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Staff">Staff</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Date</label>
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all mt-4"
                >
                  Save Expense
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Reports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [summary, setSummary] = useState({ totalIncome: 0, totalAdvance: 0 });

  const fetchReports = async () => {
    setLoading(true);
    const token = localStorage.getItem('lodgeease_token');
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await fetch(`/api/reports?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setReports(result.data);
      setTotal(result.total);
      setSummary(result.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchReports();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 lg:pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Reports & Analytics</h2>
          <p className="text-zinc-500 font-medium mt-2">Comprehensive overview of your property's performance.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="bg-white border border-zinc-200 text-zinc-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-50 transition-all shadow-sm"
          >
            <Download size={20} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bento-card p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Search Customer</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
                placeholder="Name or Phone..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">From Date</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">To Date</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleApplyFilters}
              className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-zinc-200"
            >
              <Filter size={20} />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
        >
          <div className="relative z-10">
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-3">Total Revenue</p>
            <p className="text-5xl font-extrabold tracking-tight">₹{summary.totalIncome + summary.totalAdvance}</p>
            <div className="mt-6 flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <TrendingUp size={16} />
              <span>Filtered Range</span>
            </div>
          </div>
          <IndianRupee className="absolute right-[-10%] bottom-[-10%] text-white/5 w-48 h-48 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bento-card p-10 relative overflow-hidden group"
        >
          <div className="relative z-10">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">Total Bookings</p>
            <p className="text-5xl font-extrabold text-zinc-900 tracking-tight">{total}</p>
            <div className="mt-6 flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
              <Users size={16} />
              <span>Completed & Active</span>
            </div>
          </div>
          <Bed className="absolute right-[-10%] bottom-[-10%] text-zinc-50 w-48 h-48 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bento-card p-10 relative overflow-hidden group"
        >
          <div className="relative z-10">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">Avg. per Booking</p>
            <p className="text-5xl font-extrabold text-zinc-900 tracking-tight">
              ₹{total > 0 ? Math.round((summary.totalIncome + summary.totalAdvance) / total) : 0}
            </p>
            <div className="mt-6 flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
              <BarChart3 size={16} />
              <span>Efficiency Rate</span>
            </div>
          </div>
          <PieChart className="absolute right-[-10%] bottom-[-10%] text-zinc-50 w-48 h-48 rotate-45 group-hover:rotate-0 transition-transform duration-700" />
        </motion.div>
      </div>

      {/* Table */}
      <div className="bento-card overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Room</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <Loader2 className="animate-spin mx-auto text-zinc-300" size={40} />
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-4">
                      <FileText size={32} />
                    </div>
                    <p className="text-zinc-400 font-bold italic">No records found for the selected filters.</p>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-900">
                          {new Date(report.check_in_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          {new Date(report.check_in_date).getFullYear()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-zinc-900">{report.customer_name}</span>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{report.customer_phone}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-900 shadow-sm">
                          {report.room_number}
                        </div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{report.room_type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-[10px] uppercase font-black px-3 py-1.5 rounded-xl tracking-widest inline-flex items-center gap-2",
                        report.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", report.status === 'completed' ? "bg-emerald-500" : "bg-orange-500")} />
                        {report.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-lg font-black text-zinc-900 tracking-tight">₹{report.total_amount || report.advance_paid}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 mb-12">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl border border-zinc-200 disabled:opacity-30 hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-zinc-900">Page {page}</span>
            <span className="text-sm font-bold text-zinc-400">/ {totalPages}</span>
          </div>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl border border-zinc-200 disabled:opacity-30 hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

const AnalyticsCharts = ({ incomeData, occupancyData }: { incomeData: any[], occupancyData: any[] }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Income & Profit Chart */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Revenue & Profit</h3>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mt-1">Last 7 Days Trend</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-zinc-900" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Profit</span>
            </div>
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={incomeData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#a1a1aa' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#a1a1aa' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="income" stroke="#18181b" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Occupancy Chart */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Room Occupancy</h3>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-1">Weekly Performance</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
            <Users size={20} />
          </div>
        </div>
        <div className="h-[280px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupancyData}>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#71717a' }}
                dy={10}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#18181b', color: '#fff' }}
              />
              <Bar dataKey="rooms" radius={[8, 8, 8, 8]} barSize={32}>
                {occupancyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === occupancyData.length - 1 ? '#fff' : 'rgba(255,255,255,0.2)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      </motion.div>
    </div>
  );
};

const Dashboard = ({ setView, user }: { setView: (v: string) => void, user: any }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<{ incomeData: any[], occupancyData: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [lodgeName, setLodgeName] = useState(localStorage.getItem('lodge_name') || 'LodgeEase');
  const [lodgeAddress, setLodgeAddress] = useState(localStorage.getItem('lodge_address') || '123 City Center, Bangalore');
  const [lodgePhone, setLodgePhone] = useState(localStorage.getItem('lodge_phone') || '+91 98765 43210');

  useEffect(() => {
    const handleStorage = () => {
      setLodgeName(localStorage.getItem('lodge_name') || 'LodgeEase');
      setLodgeAddress(localStorage.getItem('lodge_address') || '123 City Center, Bangalore');
      setLodgePhone(localStorage.getItem('lodge_phone') || '+91 98765 43210');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isCheckInModal, setIsCheckInModal] = useState(false);
  const [isCheckOutModal, setIsCheckOutModal] = useState(false);
  const [billGenerated, setBillGenerated] = useState(false);

  // Form States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerAadhaar, setCustomerAadhaar] = useState('');
  const [numGuests, setNumGuests] = useState('1');
  const [paidAmount, setPaidAmount] = useState('');
  const [checkInTime, setCheckInTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  const fetchData = async () => {
    const token = localStorage.getItem('lodgeease_token');
    try {
      const [roomsRes, statsRes, analyticsRes, bookingsRes] = await Promise.all([
        fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/analytics', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setRooms(await roomsRes.json());
      setStats(await statsRes.json());
      setAnalytics(await analyticsRes.json());
      setBookings(await bookingsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('lodgeease_token');
    const roomId = selectedRoom?.id || parseInt(selectedRoomId);
    
    if (!roomId) return alert('Please select a room');

    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId,
          customerName,
          customerPhone,
          customerAddress,
          customerAadhaar,
          numGuests: parseInt(numGuests),
          paidAmount: parseFloat(paidAmount),
          checkInDate,
          checkInTime
        })
      });
      if (res.ok) {
        setIsCheckInModal(false);
        resetForm();
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Check-in failed');
      }
    } catch (err) {
      alert('Check-in failed');
    }
  };

  const [checkOutTime, setCheckOutTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
  const [checkOutDate, setCheckOutDate] = useState(new Date().toISOString().split('T')[0]);

  const generateBill = (room: Room, checkoutDate: string, checkoutTime: string) => {
    const doc = new jsPDF();
    const checkIn = new Date(room.check_in_date!);
    const checkOut = new Date(`${checkoutDate} ${checkoutTime}`);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const totalRent = diffDays * room.price;
    const advance = room.advance_paid || 0;
    const balance = totalRent - advance;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(24, 24, 27); // zinc-900
    doc.text(lodgeName, 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(113, 113, 122); // zinc-500
    doc.text(lodgeAddress, 105, 28, { align: 'center' });
    doc.text(`Phone: ${lodgePhone}`, 105, 33, { align: 'center' });

    doc.setDrawColor(244, 244, 245); // zinc-100
    doc.line(20, 40, 190, 40);

    // Bill Details
    doc.setFontSize(14);
    doc.setTextColor(24, 24, 27);
    doc.text('INVOICE / RECEIPT', 20, 50);
    
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 190, 50, { align: 'right' });

    // Customer Info
    doc.setFontSize(10);
    doc.setTextColor(113, 113, 122);
    doc.text('BILL TO:', 20, 65);
    doc.setTextColor(24, 24, 27);
    doc.setFont(undefined, 'bold');
    doc.text(room.customer_name || 'N/A', 20, 70);
    doc.setFont(undefined, 'normal');
    doc.text(`Phone: ${room.customer_phone || 'N/A'}`, 20, 75);

    // Room Info
    doc.setTextColor(113, 113, 122);
    doc.text('ROOM DETAILS:', 120, 65);
    doc.setTextColor(24, 24, 27);
    doc.text(`Room Number: ${room.room_number}`, 120, 70);
    doc.text(`Room Type: ${room.type}`, 120, 75);

    // Stay Info
    doc.setDrawColor(244, 244, 245);
    doc.setFillColor(250, 250, 250);
    doc.rect(20, 85, 170, 35, 'F');
    
    doc.setTextColor(113, 113, 122);
    doc.text('Check-In:', 25, 95);
    doc.text('Check-Out:', 25, 105);
    doc.text('Total Stay:', 25, 115);

    doc.setTextColor(24, 24, 27);
    doc.text(new Date(room.check_in_date!).toLocaleString(), 60, 95);
    doc.text(checkOut.toLocaleString(), 60, 105);
    doc.text(`${diffDays} Day(s)`, 60, 115);

    // Table Header
    doc.setFillColor(24, 24, 27);
    doc.rect(20, 130, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('Description', 25, 136.5);
    doc.text('Rate', 100, 136.5);
    doc.text('Days', 130, 136.5);
    doc.text('Total', 170, 136.5, { align: 'right' });

    // Table Row
    doc.setTextColor(24, 24, 27);
    doc.setFont(undefined, 'normal');
    doc.text(`Room Rent - ${room.room_number}`, 25, 150);
    doc.text(`Rs. ${room.price}`, 100, 150);
    doc.text(`${diffDays}`, 130, 150);
    doc.text(`Rs. ${totalRent}`, 170, 150, { align: 'right' });

    doc.line(20, 155, 190, 155);

    // Summary
    doc.text('Subtotal:', 140, 165);
    doc.text(`Rs. ${totalRent}`, 170, 165, { align: 'right' });
    
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text('Advance Paid:', 140, 172);
    doc.text(`- Rs. ${advance}`, 170, 172, { align: 'right' });

    doc.setTextColor(24, 24, 27);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Total Payable:', 140, 185);
    doc.text(`Rs. ${balance}`, 170, 185, { align: 'right' });

    // Footer
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(113, 113, 122);
    doc.text('Thank you for staying with us!', 105, 220, { align: 'center' });
    doc.text('This is a computer generated receipt.', 105, 225, { align: 'center' });

    doc.save(`Bill_${room.room_number}_${room.customer_name}.pdf`);
    setBillGenerated(true);
  };

  const sendToWhatsApp = (room: Room, checkoutDate: string, checkoutTime: string) => {
    const checkIn = new Date(room.check_in_date!);
    const checkOut = new Date(`${checkoutDate} ${checkoutTime}`);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const totalRent = diffDays * room.price;
    const advance = room.advance_paid || 0;
    const balance = totalRent - advance;

    const message = `*INVOICE / RECEIPT*
*${lodgeName}*
${lodgeAddress}

*Guest:* ${room.customer_name}
*Room:* ${room.room_number} (${room.type})
*Check-In:* ${checkIn.toLocaleString()}
*Check-Out:* ${checkOut.toLocaleString()}
*Total Stay:* ${diffDays} Day(s)

*Total Rent:* Rs. ${totalRent}
*Advance Paid:* Rs. ${advance}
*Final Paid:* Rs. ${balance}

Thank you for staying with us!
_This is a digital receipt generated via LodgeEase._`;

    const encodedMessage = encodeURIComponent(message);
    const phone = room.customer_phone?.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCheckOut = async () => {
    const token = localStorage.getItem('lodgeease_token');
    if (!selectedRoom) return;

    const checkIn = new Date(selectedRoom.check_in_date!);
    const checkOut = new Date(`${checkOutDate} ${checkOutTime}`);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const totalAmount = diffDays * selectedRoom.price;
    const advance = selectedRoom.advance_paid || 0;
    const balance = totalAmount - advance;

    try {
      const res = await fetch('/api/check-out', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          totalAmount,
          checkOutDate,
          checkOutTime,
          paidAmount: balance, // Final balance paid at checkout
          stayDays: diffDays
        })
      });
      if (res.ok) {
        setIsCheckOutModal(false);
        fetchData();
      }
    } catch (err) {
      alert('Check-out failed');
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerAadhaar('');
    setNumGuests('1');
    setPaidAmount('');
    setCheckInTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    setCheckInDate(new Date().toISOString().split('T')[0]);
    setSelectedRoomId('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-zinc-900" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 lg:pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">
              Hello, {user?.name.split(' ')[0]}!
            </h1>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
              Live
            </span>
          </div>
          <p className="text-zinc-500 font-medium">Here's what's happening at <span className="text-zinc-900 font-bold">{lodgeName}</span> today.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-3xl border border-zinc-100 shadow-sm">
          <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white">
            <Calendar size={20} />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Current Date</p>
            <p className="text-sm font-bold text-zinc-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Integrated Stats & Property Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Available Rooms', value: stats?.available || 0, icon: Bed, color: 'emerald' },
            { label: 'Today Check-ins', value: stats?.checkins || 0, icon: UserPlus, color: 'blue' },
            { label: 'Today Check-outs', value: stats?.checkouts || 0, icon: LogOut, color: 'rose' },
            { label: 'Today Revenue', value: `₹${stats?.revenue || 0}`, icon: IndianRupee, color: 'zinc' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card p-8 group hover:shadow-2xl hover:shadow-zinc-200/50 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                  stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                  stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                  stat.color === 'rose' ? "bg-rose-50 text-rose-600" : "bg-zinc-100 text-zinc-900"
                )}>
                  <stat.icon size={28} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  <Activity size={12} />
                  Live
                </div>
              </div>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-zinc-900 tracking-tight">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group"
        >
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">{lodgeName}</h3>
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Property Profile</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-500">
                    <Zap size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Subscription</p>
                    <p className="text-sm font-bold">Premium Enterprise</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-500">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Location</p>
                    <p className="text-sm font-bold truncate max-w-[180px]">{lodgeAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setView('settings')}
              className="mt-12 w-full py-4 bg-white text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all"
            >
              Manage Property
            </button>
          </div>
          <Building2 className="absolute right-[-10%] bottom-[-10%] text-white/5 w-64 h-64 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Quick Operations</h3>
          <div className="h-px flex-1 bg-zinc-100 mx-8" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'New Check-in', icon: UserPlus, action: () => setIsCheckInModal(true), color: 'bg-zinc-900 text-white' },
            { label: 'Add Expense', icon: IndianRupee, action: () => setView('expenses'), color: 'bg-white text-zinc-900 border border-zinc-100' },
            { label: 'View Reports', icon: FileText, action: () => setView('reports'), color: 'bg-white text-zinc-900 border border-zinc-100' },
            { label: 'Property Settings', icon: Settings, action: () => setView('settings'), color: 'bg-white text-zinc-900 border border-zinc-100' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={action.action}
              className={cn(
                "flex flex-col items-center justify-center p-8 rounded-[2.5rem] transition-all hover:scale-105 active:scale-95 shadow-sm group",
                action.color
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all",
                action.color.includes('bg-zinc-900') ? "bg-white/10" : "bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white"
              )}>
                <action.icon size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Income Chart */}
        <div className="lg:col-span-2 bento-card p-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-zinc-900">Revenue Overview</h3>
              <p className="text-zinc-500 text-sm">Income vs Expenses for the last 7 days</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-900" />
                <span className="text-xs font-bold text-zinc-500">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-zinc-500">Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {analytics && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.incomeData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#18181b" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={4} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Property Profile Card */}
        <div className="bento-card p-8 bg-zinc-900 text-white relative overflow-hidden group">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10">
                  <Building2 size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-bold tracking-tight">{lodgeName}</h4>
                  <p className="text-zinc-400 text-xs font-black uppercase tracking-widest">{user?.subscription_status} Plan</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center">
                    <MapPin size={18} className="text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-300 font-medium leading-tight">{lodgeAddress}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center">
                    <Phone size={18} className="text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-300 font-medium">{lodgePhone}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setView('settings')}
              className="mt-10 w-full py-4 bg-white text-zinc-900 rounded-2xl font-bold hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
            >
              <Settings size={18} />
              Manage Property
            </button>
          </div>
          <div className="absolute right-[-20%] top-[-20%] w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        </div>

        {/* System Status Card */}
        <div className="bento-card p-8 bg-emerald-50 border-emerald-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest">System Status</h4>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-zinc-900 tracking-tight mb-2">All Systems Operational</h3>
            <p className="text-zinc-500 text-sm font-medium">Cloud sync active and data is secure.</p>
          </div>
          <div className="mt-8 pt-6 border-t border-emerald-100/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <ShieldCheck size={16} />
              </div>
              <span className="text-xs font-bold text-zinc-600">Security Verified</span>
            </div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">v2.4.0</span>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings Section */}
      {bookings.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                <Calendar size={24} className="text-zinc-400" />
                Upcoming Bookings
              </h2>
              <p className="text-zinc-500 text-sm font-medium mt-1">Advance reservations for the next few days</p>
            </div>
            <button 
              onClick={() => setView('bookings')}
              className="text-sm font-black text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-2 group uppercase tracking-widest"
            >
              View Calendar
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {bookings.slice(0, 5).map((booking) => (
              <div 
                key={booking.id}
                className="min-w-[320px] p-8 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-zinc-200/50 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 font-black text-xl group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                    {booking.room_number}
                  </div>
                  <span className="text-[10px] bg-zinc-100 text-zinc-500 px-3 py-1.5 rounded-xl font-black uppercase tracking-widest">
                    {booking.room_type}
                  </span>
                </div>
                <h4 className="text-xl font-black text-zinc-900 mb-1 tracking-tight">{booking.customer_name}</h4>
                <p className="text-sm text-zinc-400 font-bold mb-8">{booking.customer_phone}</p>
                <div className="flex items-center gap-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-t border-zinc-50 pt-6">
                  <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center">
                    <Clock size={14} />
                  </div>
                  <span>
                    {new Date(booking.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                    <span className="mx-2 text-zinc-200">→</span>
                    {new Date(booking.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                {/* Subtle accent */}
                <div className="absolute top-0 right-0 w-1 h-full bg-zinc-100 group-hover:bg-zinc-900 transition-colors" />
              </div>
            ))}
            {bookings.length > 5 && (
              <button 
                onClick={() => setView('bookings')}
                className="min-w-[160px] flex flex-col items-center justify-center bg-zinc-50 rounded-[2.5rem] border-2 border-dashed border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Plus size={32} />
                </div>
                <span className="text-sm font-black uppercase tracking-widest">View All</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Room Grid */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Room Status</h2>
            <p className="text-zinc-500 font-medium">Real-time availability and occupancy overview</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl border border-zinc-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-200" />
                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Occupied</span>
              </div>
            </div>
            <button 
              onClick={() => { setSelectedRoom(null); setIsCheckInModal(true); }}
              className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95"
            >
              <UserPlus size={20} />
              Quick Check-In
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {rooms.map((room) => (
            <motion.button
              key={room.id}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedRoom(room);
                if (room.status === 'available') {
                  setIsCheckInModal(true);
                } else {
                  setBillGenerated(false);
                  setCheckOutDate(new Date().toISOString().split('T')[0]);
                  setCheckOutTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
                  setIsCheckOutModal(true);
                }
              }}
              className={cn(
                "p-8 rounded-[2.5rem] border-2 text-left transition-all relative group overflow-hidden",
                room.status === 'available' 
                  ? "bg-white border-zinc-100 hover:border-zinc-900 hover:shadow-2xl hover:shadow-zinc-200" 
                  : "bg-zinc-900 border-zinc-900 text-white shadow-2xl shadow-zinc-200"
              )}
            >
              <div className="flex justify-between items-start mb-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl transition-all duration-300",
                  room.status === 'available' ? "bg-zinc-50 text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white" : "bg-zinc-800 text-white"
                )}>
                  {room.room_number}
                </div>
                <span className={cn(
                  "text-[10px] uppercase font-black px-3 py-1.5 rounded-xl tracking-widest",
                  room.status === 'available' ? "bg-emerald-50 text-emerald-600" : "bg-orange-500/20 text-orange-400"
                )}>
                  {room.type}
                </span>
              </div>
              
              <div className="space-y-1.5">
                <h4 className={cn("text-lg font-black tracking-tight truncate", room.status === 'available' ? "text-zinc-900" : "text-white")}>
                  {room.status === 'available' ? 'Ready to Book' : room.customer_name?.split(' ')[0]}
                </h4>
                <p className={cn("text-sm font-bold", room.status === 'available' ? "text-zinc-400" : "text-zinc-500")}>
                  {room.status === 'available' ? `₹${room.price}` : room.customer_phone}
                </p>
              </div>

              {room.status === 'occupied' && (
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Occupied</span>
                  </div>
                  <ArrowRight size={16} className="text-zinc-700 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
              
              {/* Decorative elements */}
              <div className={cn(
                "absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-100",
                room.status === 'available' ? "bg-emerald-100" : "bg-orange-500/10"
              )} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Check-In Modal */}
      <AnimatePresence>
        {isCheckInModal && selectedRoom && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckInModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">Customer Check-In</h3>
                  <p className="text-sm text-zinc-500">
                    {selectedRoom ? `Room #${selectedRoom.room_number} • ${selectedRoom.type}` : 'New Registration'}
                  </p>
                </div>
                <button onClick={() => setIsCheckInModal(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCheckIn} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Customer Name</label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                        placeholder="10-digit number"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-zinc-400" size={18} />
                    <textarea 
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 min-h-[80px]"
                      placeholder="Enter full address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Aadhaar Number</label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        required
                        value={customerAadhaar}
                        onChange={(e) => setCustomerAadhaar(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                        placeholder="12-digit Aadhaar"
                      />
                    </div>
                  </div>

                  {!selectedRoom && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Room Number</label>
                      <div className="relative">
                        <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <select 
                          required
                          value={selectedRoomId}
                          onChange={(e) => setSelectedRoomId(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 appearance-none"
                        >
                          <option value="">Select Room</option>
                          {rooms.filter(r => r.status === 'available').map(r => (
                            <option key={r.id} value={r.id}>#{r.room_number} ({r.type}) - ₹{r.price}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Number of Guests</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type="number"
                        required
                        min="1"
                        value={numGuests}
                        onChange={(e) => setNumGuests(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Advance Payment (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type="number"
                        required
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Check-in Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type="date"
                        required
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Check-in Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type="time"
                        required
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all mt-4"
                >
                  Confirm Check-In
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Check-Out Modal */}
      <AnimatePresence>
        {isCheckOutModal && selectedRoom && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckOutModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-zinc-900 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Room Check-Out</h3>
                    <p className="text-zinc-400 text-sm">Room #{selectedRoom.room_number}</p>
                  </div>
                  <button onClick={() => setIsCheckOutModal(false)} className="text-zinc-400 hover:text-white">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="bg-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Customer</span>
                    <span className="font-medium">{selectedRoom.customer_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Check-in</span>
                    <span className="font-medium">{new Date(selectedRoom.check_in_date!).toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Check-out Date</label>
                      <input 
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm outline-none focus:border-white/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Check-out Time</label>
                      <input 
                        type="time"
                        value={checkOutTime}
                        onChange={(e) => setCheckOutTime(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm outline-none focus:border-white/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  {(() => {
                    const checkIn = new Date(selectedRoom.check_in_date!);
                    const checkOut = new Date(`${checkOutDate} ${checkOutTime}`);
                    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                    const totalRent = diffDays * selectedRoom.price;
                    const advance = selectedRoom.advance_paid || 0;
                    const balance = totalRent - advance;

                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Total Days Stayed</span>
                          <span className="font-bold">{diffDays} Days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Total Rent (₹{selectedRoom.price} x {diffDays})</span>
                          <span className="font-bold">₹{totalRent}</span>
                        </div>
                        <div className="flex justify-between text-sm text-emerald-600">
                          <span>Advance Deduction</span>
                          <span className="font-bold">- ₹{advance}</span>
                        </div>
                        <div className="h-px bg-zinc-100 my-2" />
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-zinc-900">Final Payable Amount</span>
                          <span className="text-2xl font-bold text-zinc-900">₹{balance}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => generateBill(selectedRoom, checkOutDate, checkOutTime)}
                      className="flex-1 bg-zinc-100 text-zinc-900 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                    >
                      <FileText size={18} />
                      {billGenerated ? 'Re-generate' : 'Generate Bill'}
                    </button>
                    {billGenerated && (
                      <button 
                        onClick={() => sendToWhatsApp(selectedRoom, checkOutDate, checkOutTime)}
                        className="flex-1 bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={18} />
                        WhatsApp
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={handleCheckOut}
                    className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                  >
                    Confirm Check-Out
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BookingCalendar = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isBookingModal, setIsBookingModal] = useState(false);
  
  // New Booking Form
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  const fetchData = async () => {
    const token = localStorage.getItem('lodgeease_token');
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setRooms(await roomsRes.json());
      setBookings(await bookingsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('lodgeease_token');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: selectedRoomId,
          customerName,
          customerPhone,
          checkInDate,
          checkOutDate
        })
      });
      if (res.ok) {
        setIsBookingModal(false);
        fetchData();
        // Reset form
        setSelectedRoomId('');
        setCustomerName('');
        setCustomerPhone('');
        setCheckInDate('');
        setCheckOutDate('');
      } else {
        const data = await res.json();
        alert(data.error || 'Booking failed');
      }
    } catch (err) {
      alert('Booking failed');
    }
  };

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('Cancel this booking?')) return;
    const token = localStorage.getItem('lodgeease_token');
    await fetch(`/api/bookings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  const daysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const startOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentMonth);
    const startDay = startOfMonth(currentMonth);
    const days = [];

    // Header
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Previous month padding
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`pad-${i}`} className="h-24 border border-zinc-50 bg-zinc-50/50" />);
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayBookings = bookings.filter(b => {
        const start = new Date(b.check_in_date).toISOString().split('T')[0];
        const end = new Date(b.check_out_date).toISOString().split('T')[0];
        return dateStr >= start && dateStr <= end;
      });

      days.push(
        <div key={d} className="h-24 border border-zinc-100 p-2 relative group hover:bg-zinc-50 transition-colors">
          <span className="text-xs font-bold text-zinc-400">{d}</span>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-16 scrollbar-hide">
            {dayBookings.map(b => (
              <div 
                key={b.id} 
                className="text-[10px] bg-zinc-900 text-white px-1.5 py-0.5 rounded-md truncate cursor-pointer hover:scale-105 transition-transform"
                title={`${b.customer_name} - Room ${b.room_number}`}
              >
                {b.room_number}: {b.customer_name}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 border-l border-t border-zinc-100 rounded-2xl overflow-hidden shadow-sm bg-white">
        {weekdays.map(w => (
          <div key={w} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 border-r border-b border-zinc-100 bg-zinc-50">
            {w}
          </div>
        ))}
        {days}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Booking Calendar</h2>
          <p className="text-zinc-500 mt-2">Manage advance room bookings and availability.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-zinc-200 rounded-2xl p-1 shadow-sm">
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              className="p-2 hover:bg-zinc-50 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 flex items-center font-bold text-zinc-900 min-w-[140px] justify-center">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              className="p-2 hover:bg-zinc-50 rounded-xl transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button 
            onClick={() => setIsBookingModal(true)}
            className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-xl shadow-zinc-200"
          >
            <Plus size={20} />
            New Booking
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bento-card p-2 sm:p-6">
          {renderCalendar()}
        </div>
        
        <div className="space-y-6">
          <div className="bento-card p-8">
            <h4 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-3">
              <Clock size={20} className="text-zinc-400" />
              Upcoming
            </h4>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-3">
                    <Calendar size={24} />
                  </div>
                  <p className="text-zinc-400 text-sm font-medium italic">No upcoming bookings</p>
                </div>
              ) : (
                bookings.map(b => (
                  <div key={b.id} className="p-5 bg-zinc-50 rounded-3xl border border-zinc-100 group relative hover:bg-zinc-100 transition-colors">
                    <button 
                      onClick={() => handleDeleteBooking(b.id)}
                      className="absolute top-4 right-4 p-1.5 bg-white text-zinc-300 hover:text-rose-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={14} />
                    </button>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-zinc-900 font-bold shadow-sm">
                        {b.room_number}
                      </div>
                      <span className="text-[10px] bg-zinc-900 text-white px-2.5 py-1 rounded-full font-black uppercase tracking-widest">{b.room_type}</span>
                    </div>
                    <p className="font-bold text-zinc-900">{b.customer_name}</p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                      <Calendar size={12} />
                      {new Date(b.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(b.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 bg-zinc-900 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">New Advance Booking</h3>
                    <p className="text-zinc-400 text-sm">Reserve a room for future dates.</p>
                  </div>
                  <button onClick={() => setIsBookingModal(false)} className="text-zinc-400 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateBooking} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Select Room</label>
                  <select 
                    required
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium appearance-none"
                  >
                    <option value="">Choose a room...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>Room {r.room_number} ({r.type}) - Rs. {r.price}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Customer Name</label>
                    <input 
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Phone Number</label>
                    <input 
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                      placeholder="+91 00000 00000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Check-In Date</label>
                    <input 
                      required
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Check-Out Date</label>
                    <input 
                      required
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-2"
                >
                  <Calendar size={20} />
                  Confirm Booking
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

const LodgeSettings = () => {
  const [lodgeName, setLodgeName] = useState(localStorage.getItem('lodge_name') || 'Main Lodge');
  const [lodgeAddress, setLodgeAddress] = useState(localStorage.getItem('lodge_address') || '123 City Center, Bangalore');
  const [lodgePhone, setLodgePhone] = useState(localStorage.getItem('lodge_phone') || '+91 98765 43210');
  const [isSaved, setIsSaved] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lodge_name', lodgeName);
    localStorage.setItem('lodge_address', lodgeAddress);
    localStorage.setItem('lodge_phone', lodgePhone);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    window.dispatchEvent(new Event('storage')); // Notify other components
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    const token = localStorage.getItem('lodgeease_token');
    try {
      const res = await fetch('/api/backup', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LodgeEase_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (err) {
      alert('Backup failed');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('WARNING: This will overwrite all current data. Are you sure you want to proceed?')) return;

    setIsRestoring(true);
    const token = localStorage.getItem('lodgeease_token');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/restore', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          alert('Data restored successfully! The app will reload.');
          window.location.reload();
        } else {
          alert('Restore failed. Please check the file format.');
        }
      } catch (err) {
        alert('Invalid backup file');
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = async (table: string) => {
    const token = localStorage.getItem('lodgeease_token');
    window.open(`/api/export-csv?table=${table}&token=${token}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 lg:pb-12">
      <div className="mb-12">
        <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Property Settings</h2>
        <p className="text-zinc-500 font-medium mt-2">Manage your lodge profile and system configurations.</p>
      </div>

      <div className="bento-card p-8 md:p-12 mb-12">
        <form onSubmit={handleSave} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Lodge Name</label>
              <input 
                required
                value={lodgeName}
                onChange={(e) => setLodgeName(e.target.value)}
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
                placeholder="e.g. LodgeEase Grand"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Contact Phone</label>
              <input 
                required
                value={lodgePhone}
                onChange={(e) => setLodgePhone(e.target.value)}
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
                placeholder="+91 00000 00000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Property Address</label>
            <textarea 
              required
              rows={3}
              value={lodgeAddress}
              onChange={(e) => setLodgeAddress(e.target.value)}
              className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold resize-none"
              placeholder="Full address of the property..."
            />
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <button 
              type="submit"
              className="w-full sm:w-auto bg-zinc-900 text-white px-12 py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-3"
            >
              <Settings size={24} />
              Save Changes
            </button>
            
            <AnimatePresence>
              {isSaved && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-widest text-xs"
                >
                  <CheckCircle2 size={20} />
                  Settings saved successfully
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bento-card p-10">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Download size={28} />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-zinc-900 tracking-tight">Backup & Restore</h4>
              <p className="text-zinc-500 font-medium text-sm">Secure your data with manual backups.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleBackup}
              disabled={isBackingUp}
              className="w-full flex items-center justify-between p-6 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-all group border border-transparent hover:border-zinc-200"
            >
              <div className="flex items-center gap-4">
                <FileText className="text-zinc-400 group-hover:text-zinc-900 transition-colors" size={24} />
                <span className="font-bold text-zinc-700">Download Full Backup (JSON)</span>
              </div>
              <ArrowRight size={20} className="text-zinc-300 group-hover:text-zinc-900 transition-all group-hover:translate-x-1" />
            </button>

            <label className="w-full flex items-center justify-between p-6 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-zinc-200">
              <div className="flex items-center gap-4">
                <Plus className="text-zinc-400 group-hover:text-zinc-900 transition-colors" size={24} />
                <span className="font-bold text-zinc-700">Restore from Backup</span>
              </div>
              <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
              <ArrowRight size={20} className="text-zinc-300 group-hover:text-zinc-900 transition-all group-hover:translate-x-1" />
            </label>
          </div>
        </div>

        <div className="bento-card p-10">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <TrendingUp size={28} />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-zinc-900 tracking-tight">Data Exports</h4>
              <p className="text-zinc-500 font-medium text-sm">Download specific data for Excel.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {['rooms', 'customers', 'checkins', 'expenses'].map((table) => (
              <button 
                key={table}
                onClick={() => handleExportCSV(table)}
                className="flex items-center gap-4 p-5 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-all group capitalize border border-transparent hover:border-zinc-200"
              >
                <FileText className="text-zinc-400 group-hover:text-emerald-600 transition-colors" size={20} />
                <span className="font-bold text-zinc-700 text-sm">{table}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl">
          <div className="relative z-10">
            <h4 className="text-2xl font-extrabold mb-3 tracking-tight">Multi-Property Sync</h4>
            <p className="text-zinc-400 font-medium leading-relaxed">
              Your changes are automatically synced across all connected devices and branches in real-time.
            </p>
          </div>
          <div className="absolute right-[-10%] bottom-[-10%] w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        </div>
        
        <div className="bento-card p-10 relative overflow-hidden group">
          <div className="relative z-10">
            <h4 className="text-2xl font-extrabold text-zinc-900 mb-3 tracking-tight">Platform Security</h4>
            <p className="text-zinc-500 font-medium leading-relaxed">
              LodgeEase uses industry-standard encryption to protect your property and guest data.
            </p>
          </div>
          <ShieldCheck className="absolute right-[-5%] bottom-[-5%] text-zinc-100 w-32 h-32 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-12 pt-12 border-t border-zinc-200">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="text-rose-500" size={20} />
          <h3 className="text-xs font-black text-rose-500 uppercase tracking-[0.2em]">Danger Zone</h3>
        </div>
        <div className="bento-card p-8 border-rose-100 bg-rose-50/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-black text-zinc-900 tracking-tight">Erase All Property Data</h4>
              <p className="text-sm text-zinc-500 font-medium mt-1">This will permanently delete all rooms, check-ins, and expenses. This action cannot be undone.</p>
            </div>
            <button 
              onClick={() => {
                if (confirm('CRITICAL: Are you sure you want to delete ALL property data? This action is permanent and cannot be undone.')) {
                  alert('For security, please contact system administrator to perform a full data reset.');
                }
              }}
              className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [view, setView] = useState('dashboard');

  const isExpired = user?.subscription_status === 'expired' && !user?.is_super_admin;
  const isPublic = user?.type === 'public';

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
        {isAuthenticated && <Navbar onLogout={logout} currentView={view} setView={setView} />}
        {isAuthenticated && isExpired && !isPublic && <SubscriptionExpired />}
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLandingPage />} />
          <Route path="/public/login" element={!isAuthenticated ? <PublicLoginPage onLogin={login} /> : <Navigate to="/" />} />
          <Route path="/public/register" element={!isAuthenticated ? <PublicRegisterPage /> : <Navigate to="/" />} />
          <Route path="/public/lodge/:id" element={<PublicLodgeDetails />} />

          {/* Lodge Owner Routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginPage onLogin={login} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} 
          />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                isPublic ? (
                  view === 'dashboard' ? <PublicLandingPage /> : <PublicMyBookings />
                ) : (
                  user?.is_super_admin ? (
                    <SuperAdminDashboard />
                  ) : (
                    view === 'dashboard' ? <Dashboard setView={setView} user={user} /> : 
                    view === 'rooms' ? <RoomManagement /> :
                    view === 'bookings' ? <BookingCalendar /> :
                    view === 'expenses' ? <Expenses /> :
                    view === 'settings' ? <LodgeSettings /> :
                    <Reports />
                  )
                )
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
