import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, QrCode, X, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, query, where, onSnapshot, getDocs, addDoc, updateDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';
import { jsPDF } from 'jspdf';
import { db, storage } from '../firebase';
import { cn } from '../lib/utils';
import { encryptData } from '../lib/encryption';
import { scanAadhaar } from '../lib/ocr';
import { parseAadhaarQR } from '../lib/aadhaar';
import { sendWhatsAppMessage } from '../lib/whatsapp';
import { UserData, Room } from '../types';
import { Button, Input } from './Common';
import { QRScanner } from './QRScanner';
import { Camera } from './Camera';

export function Rooms({ user }: { user: UserData | null }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [aadhaarImg, setAadhaarImg] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', aadhaar: '', paid: 0, numPersons: 1, purposeOfVisit: 'Tourism' });
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
        numPersons: formData.numPersons,
        purposeOfVisit: formData.purposeOfVisit,
        aadhaar: encryptedAadhaar,
        aadhaarDisplay: formData.aadhaar.slice(-4).padStart(12, '*'),
        aadhaarImageURL: aadhaarURL,
        room: selectedRoom.room_number,
        checkIn: serverTimestamp(),
        checkOut: null,
        amount: 0,
        advance_paid: formData.paid
      });

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
      setFormData({ name: '', phone: '', address: '', aadhaar: '', paid: 0, numPersons: 1, purposeOfVisit: 'Tourism' });
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

      const basePrice = selectedRoom.price || 0;
      const gstRate = basePrice > 7500 ? 0.18 : 0.12;
      const cgst = (basePrice * gstRate) / 2;
      const sgst = (basePrice * gstRate) / 2;
      const totalWithGst = basePrice + cgst + sgst;

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

      let remotePdfUrl = '';
      try {
        const pdfRef = ref(storage, `invoices/${user.lodgeID}/${selectedRoom.customer_id}_${Date.now()}.pdf`);
        await uploadBytes(pdfRef, pdfBlob);
        remotePdfUrl = await getDownloadURL(pdfRef);
      } catch (uploadErr) {
        console.error("PDF Upload Error:", uploadErr);
      }

      try {
        await sendWhatsAppMessage({
          to: selectedRoom.customer_phone || '',
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
      
      await updateDoc(doc(db, 'rooms', selectedRoom.id), {
        status: 'cleaning',
        customer_name: null,
        customer_id: null,
        check_in_date: null,
        advance_paid: 0
      });

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
                
                <div className="grid grid-cols-2 gap-4">
                  <Input label="No. of Persons" type="number" value={formData.numPersons} onChange={(e: any) => setFormData({...formData, numPersons: Number(e.target.value)})} />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Purpose</label>
                    <select 
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3 px-4 text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 transition-all"
                      value={formData.purposeOfVisit}
                      onChange={(e) => setFormData({...formData, purposeOfVisit: e.target.value})}
                    >
                      <option value="Tourism">Tourism</option>
                      <option value="Business">Business</option>
                      <option value="Medical">Medical</option>
                      <option value="Personal">Personal</option>
                    </select>
                  </div>
                </div>
                
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
