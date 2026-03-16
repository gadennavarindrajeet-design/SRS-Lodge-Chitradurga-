import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, FileText, User, Phone, Mail, Lock, Loader2
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserData } from '../types';
import { Button, Input } from './Common';

export function Login({ onSuccess }: any) {
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
