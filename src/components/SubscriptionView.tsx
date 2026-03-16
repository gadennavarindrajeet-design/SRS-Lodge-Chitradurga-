import React, { useState } from 'react';
import { 
  Clock, CheckCircle2
} from 'lucide-react';
import { addDoc, collection, doc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserData } from '../types';
import { Button } from './Common';
import { loadRazorpay, createRazorpayOrder } from '../lib/payments';

export function SubscriptionView({ user }: { user: UserData | null }) {
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
