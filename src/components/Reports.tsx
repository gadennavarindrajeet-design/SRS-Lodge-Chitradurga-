import React, { useState, useEffect } from 'react';
import { 
  Download, Loader2, ShieldCheck
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { decryptData } from '../lib/encryption';
import { UserData, Customer } from '../types';
import { Button } from './Common';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

export function Reports({ user }: { user: UserData | null }) {
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
