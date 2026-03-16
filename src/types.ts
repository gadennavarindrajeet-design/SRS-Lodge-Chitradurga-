import { Timestamp } from 'firebase/firestore';

export interface UserData {
  lodgeID: string;
  name: string;
  owner_name: string;
  email: string;
  address?: string;
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

export interface MaintenanceTask {
  id: string;
  roomID: string;
  roomNumber: string;
  issue: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: any;
}

export interface HousekeepingTask {
  id: string;
  roomID: string;
  roomNumber: string;
  status: 'dirty' | 'cleaning' | 'clean';
  assignedTo?: string;
  updatedAt: any;
}

export interface Room {
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

export interface Customer {
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
  numPersons?: number;
  purposeOfVisit?: string;
}
