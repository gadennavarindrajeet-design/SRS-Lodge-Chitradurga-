/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bed, 
  UserPlus, 
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
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Room {
  id: number;
  room_number: string;
  type: string;
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
  customer_name?: string;
  check_in_date?: string;
}

interface Stats {
  total: number;
  occupied: number;
  available: number;
  revenue: number;
}

// --- Auth Context Mock ---
const useAuth = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem('srs_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData: { name: string; email: string }, token: string) => {
    localStorage.setItem('srs_token', token);
    localStorage.setItem('srs_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('srs_token');
    localStorage.removeItem('srs_user');
    setUser(null);
  };

  return { user, login, logout, isAuthenticated: !!user };
};

// --- Components ---

const Navbar = ({ onLogout, currentView, setView }: { onLogout: () => void, currentView: string, setView: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold">
                SRS
              </div>
              <span className="text-xl font-bold text-zinc-900 hidden sm:block">Lodge Manager</span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              <button 
                onClick={() => setView('dashboard')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                  currentView === 'dashboard' ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                )}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
              <button 
                onClick={() => setView('rooms')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                  currentView === 'rooms' ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                )}
              >
                <Settings size={18} />
                Manage Rooms
              </button>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-4">
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          <div className="sm:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sm:hidden bg-white border-b border-zinc-200 px-4 pt-2 pb-4 space-y-1"
          >
            <button 
              onClick={() => { setView('dashboard'); setIsOpen(false); }}
              className={cn(
                "flex w-full items-center gap-2 px-4 py-3 text-base font-medium rounded-lg",
                currentView === 'dashboard' ? "bg-zinc-900 text-white" : "text-zinc-600"
              )}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>
            <button 
              onClick={() => { setView('rooms'); setIsOpen(false); }}
              className={cn(
                "flex w-full items-center gap-2 px-4 py-3 text-base font-medium rounded-lg",
                currentView === 'rooms' ? "bg-zinc-900 text-white" : "text-zinc-600"
              )}
            >
              <Settings size={20} />
              Manage Rooms
            </button>
            <button 
              onClick={() => { onLogout(); setIsOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-3 text-base font-medium text-zinc-600 hover:bg-zinc-50 rounded-lg"
            >
              <LogOut size={20} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (u: any, t: string) => void }) => {
  const [email, setEmail] = useState('admin@srslodge.com');
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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-zinc-200 p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            SRS
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">SRS Lodge Manager</h1>
          <p className="text-zinc-500 mt-2">Chitradurga, Karnataka</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none"
                placeholder="admin@srslodge.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 text-white py-3 rounded-xl font-semibold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>
      </motion.div>
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
    const token = localStorage.getItem('srs_token');
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
    const token = localStorage.getItem('srs_token');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Room Management</h2>
          <p className="text-zinc-500">Add or edit lodge rooms</p>
        </div>
        <button 
          onClick={() => { setEditingRoom(null); resetForm(); setIsModalOpen(true); }}
          className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all"
        >
          <Plus size={20} />
          Add New Room
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Room #</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-bold text-zinc-900">#{room.room_number}</td>
                <td className="px-6 py-4 text-zinc-600">{room.type}</td>
                <td className="px-6 py-4 text-zinc-900 font-medium">₹{room.price}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] uppercase font-bold px-2 py-1 rounded-full",
                    room.status === 'available' ? "bg-emerald-100 text-emerald-700" : 
                    room.status === 'occupied' ? "bg-orange-100 text-orange-700" : "bg-zinc-100 text-zinc-700"
                  )}>
                    {room.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => openEditModal(room)}
                    className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-zinc-900">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Room Number</label>
                  <input 
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                    placeholder="e.g. 101"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Room Type</label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Deluxe">Deluxe</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Price (₹)</label>
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

const Dashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isCheckInModal, setIsCheckInModal] = useState(false);
  const [isCheckOutModal, setIsCheckOutModal] = useState(false);

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
    const token = localStorage.getItem('srs_token');
    try {
      const [roomsRes, statsRes] = await Promise.all([
        fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/stats', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setRooms(await roomsRes.json());
      setStats(await statsRes.json());
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
    const token = localStorage.getItem('srs_token');
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

  const handleCheckOut = async () => {
    const token = localStorage.getItem('srs_token');
    try {
      const res = await fetch('/api/check-out', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: selectedRoom?.id,
          totalAmount: selectedRoom?.price
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Rooms', value: stats?.total, icon: Bed, color: 'bg-blue-50 text-blue-600' },
          { label: 'Occupied', value: stats?.occupied, icon: UserPlus, color: 'bg-orange-50 text-orange-600' },
          { label: 'Available', value: stats?.available, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Today Revenue', value: `₹${stats?.revenue}`, icon: IndianRupee, color: 'bg-purple-50 text-purple-600' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
            <p className="text-xl font-bold text-zinc-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Room Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900">Room Status</h2>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => { setSelectedRoom(null); setIsCheckInModal(true); }}
            className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all"
          >
            <UserPlus size={16} />
            New Check-In
          </button>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-xs font-medium text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> Occupied
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {rooms.map((room) => (
          <motion.button
            key={room.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedRoom(room);
              if (room.status === 'available') setIsCheckInModal(true);
              else setIsCheckOutModal(true);
            }}
            className={cn(
              "p-4 rounded-2xl border text-left transition-all relative overflow-hidden",
              room.status === 'available' 
                ? "bg-white border-zinc-200 hover:border-emerald-500" 
                : "bg-zinc-900 border-zinc-900 text-white"
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-lg font-bold">#{room.room_number}</span>
              <span className={cn(
                "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                room.status === 'available' ? "bg-emerald-100 text-emerald-700" : "bg-orange-500 text-white"
              )}>
                {room.type}
              </span>
            </div>
            <p className={cn("text-xs font-medium", room.status === 'available' ? "text-zinc-500" : "text-zinc-400")}>
              {room.status === 'available' ? `₹${room.price}/day` : room.customer_name}
            </p>
            {room.status === 'occupied' && (
              <div className="mt-2 text-[10px] text-zinc-400 flex items-center gap-1">
                <Loader2 size={10} /> Active
              </div>
            )}
          </motion.button>
        ))}
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
                    <span className="text-zinc-400">Check-in Date</span>
                    <span className="font-medium">{new Date(selectedRoom.check_in_date!).toLocaleDateString()}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Total Bill</span>
                    <span className="text-2xl font-bold">₹{selectedRoom.price}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <button 
                  onClick={handleCheckOut}
                  className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                >
                  Confirm Check-Out & Billing
                </button>
                <p className="text-center text-xs text-zinc-400 mt-4">
                  Billing record will be saved to daily records.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [view, setView] = useState('dashboard');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
        {isAuthenticated && <Navbar onLogout={logout} currentView={view} setView={setView} />}
        
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginPage onLogin={login} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                view === 'dashboard' ? <Dashboard /> : <RoomManagement />
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
