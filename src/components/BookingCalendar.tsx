import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight
} from 'lucide-react';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay 
} from 'date-fns';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { UserData, Room } from '../types';
import { Button } from './Common';

export function BookingCalendar({ user }: { user: UserData | null }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'customers'), where('lodgeID', '==', user.lodgeID));
    const unsubscribeBookings = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const qRooms = query(collection(db, 'rooms'), where('lodgeID', '==', user.lodgeID));
    const unsubscribeRooms = onSnapshot(qRooms, (snap) => {
      setRooms(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room)));
    });
    return () => {
      unsubscribeBookings();
      unsubscribeRooms();
    };
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
