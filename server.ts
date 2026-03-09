import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("lodge.db");
const JWT_SECRET = process.env.JWT_SECRET || "lodgeease-secret-key-2026";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS lodges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lodge_name TEXT,
    owner_name TEXT,
    phone TEXT,
    address TEXT,
    login_id TEXT UNIQUE,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    subscription_status TEXT DEFAULT 'trial', -- trial, active, expired
    subscription_end_date DATETIME,
    is_super_admin INTEGER DEFAULT 0,
    is_disabled INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lodge_id INTEGER,
    room_number TEXT,
    type TEXT, -- Single, Double, Deluxe
    price REAL,
    status TEXT DEFAULT 'available', -- available, occupied, maintenance
    FOREIGN KEY (lodge_id) REFERENCES lodges(id)
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lodge_id INTEGER,
    name TEXT,
    phone TEXT,
    address TEXT,
    aadhaar TEXT,
    FOREIGN KEY (lodge_id) REFERENCES lodges(id)
  );

  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lodge_id INTEGER,
    room_id INTEGER,
    customer_id INTEGER,
    num_guests INTEGER DEFAULT 1,
    check_in_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_in_time TEXT,
    advance_paid REAL DEFAULT 0,
    status TEXT DEFAULT 'active', -- active, completed
    FOREIGN KEY (lodge_id) REFERENCES lodges(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS checkouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lodge_id INTEGER,
    checkin_id INTEGER,
    check_out_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_out_time TEXT,
    total_amount REAL,
    balance_paid REAL,
    stay_days INTEGER,
    FOREIGN KEY (lodge_id) REFERENCES lodges(id),
    FOREIGN KEY (checkin_id) REFERENCES checkins(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lodge_id INTEGER,
    description TEXT,
    amount REAL,
    category TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lodge_id) REFERENCES lodges(id)
  );

  CREATE TABLE IF NOT EXISTS public_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lodge_id INTEGER,
    room_id INTEGER,
    public_user_id INTEGER,
    customer_name TEXT,
    customer_phone TEXT,
    check_in_date DATE,
    check_out_date DATE,
    status TEXT DEFAULT 'confirmed', -- confirmed, cancelled, checked_in
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lodge_id) REFERENCES lodges(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (public_user_id) REFERENCES public_users(id)
  );
`);

// Add public_user_id column if it doesn't exist (for existing databases)
try {
  db.prepare("ALTER TABLE bookings ADD COLUMN public_user_id INTEGER").run();
} catch (e) {
  // Column already exists or table doesn't exist yet
}

// Seed Default Lodge if not exists
const lodgeExists = db.prepare("SELECT * FROM lodges WHERE login_id = ?").get("admin@lodgeease.com");
if (!lodgeExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  const result = db.prepare(`
    INSERT INTO lodges (lodge_name, owner_name, phone, address, login_id, password, is_super_admin, subscription_status, subscription_end_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "LodgeEase Grand",
    "LodgeEase Admin",
    "+91 98765 43210",
    "123 City Center, Bangalore",
    "admin@lodgeease.com",
    hashedPassword,
    1, // is_super_admin
    'active',
    '2099-12-31 23:59:59'
  );
  
  const lodgeId = result.lastInsertRowid;
  
  // Seed Rooms for this lodge
  const insertRoom = db.prepare("INSERT INTO rooms (lodge_id, room_number, type, price) VALUES (?, ?, ?, ?)");
  for (let i = 101; i <= 110; i++) insertRoom.run(lodgeId, i.toString(), "Single", 800);
  for (let i = 201; i <= 210; i++) insertRoom.run(lodgeId, i.toString(), "Double", 1200);
  for (let i = 301; i <= 305; i++) insertRoom.run(lodgeId, i.toString(), "Deluxe", 2000);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const authenticatePublicToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err || user.type !== 'public') return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const sendBookingEmail = async (bookingData: any) => {
    const { lodgeId, roomId, publicUserId, customerName, checkInDate, checkOutDate } = bookingData;

    try {
      const lodge = db.prepare("SELECT lodge_name, login_id FROM lodges WHERE id = ?").get(lodgeId) as any;
      const room = db.prepare("SELECT room_number, type, price FROM rooms WHERE id = ?").get(roomId) as any;
      const user = db.prepare("SELECT email FROM public_users WHERE id = ?").get(publicUserId) as any;

      if (!lodge || !room || !user) {
        console.warn("Could not find lodge, room, or user for email notification");
        return;
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const emailContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #18181b;">Booking Confirmation</h2>
          <p>Dear ${customerName},</p>
          <p>Your booking at <strong>${lodge.lodge_name}</strong> has been confirmed.</p>
          <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; font-size: 16px;">Booking Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 8px;"><strong>Room:</strong> ${room.room_number} (${room.type})</li>
              <li style="margin-bottom: 8px;"><strong>Check-in:</strong> ${checkInDate}</li>
              <li style="margin-bottom: 8px;"><strong>Check-out:</strong> ${checkOutDate}</li>
              <li style="margin-bottom: 8px;"><strong>Price:</strong> ₹${room.price}/night</li>
            </ul>
          </div>
          <p>Thank you for choosing LodgeEase!</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #71717a;">This is an automated message, please do not reply.</p>
        </div>
      `;

      const ownerEmailContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #18181b;">New Booking Received</h2>
          <p>A new booking has been made for your lodge <strong>${lodge.lodge_name}</strong>.</p>
          <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; font-size: 16px;">Customer Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 8px;"><strong>Name:</strong> ${customerName}</li>
              <li style="margin-bottom: 8px;"><strong>Email:</strong> ${user.email}</li>
            </ul>
            <h3 style="margin-top: 20px; font-size: 16px;">Booking Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 8px;"><strong>Room:</strong> ${room.room_number} (${room.type})</li>
              <li style="margin-bottom: 8px;"><strong>Check-in:</strong> ${checkInDate}</li>
              <li style="margin-bottom: 8px;"><strong>Check-out:</strong> ${checkOutDate}</li>
            </ul>
          </div>
          <p>Please log in to your dashboard to manage this booking.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #71717a;">LodgeEase Notification System</p>
        </div>
      `;

      // Send to user
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"LodgeEase" <noreply@lodgeease.com>',
        to: user.email,
        subject: `Booking Confirmed - ${lodge.lodge_name}`,
        html: emailContent,
      });

      // Send to owner
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"LodgeEase" <noreply@lodgeease.com>',
        to: lodge.login_id,
        subject: `New Booking Alert - ${customerName}`,
        html: ownerEmailContent,
      });
    } catch (error) {
      console.error("Error sending booking email:", error);
    }
  };

  // API Routes
  app.post("/api/register", (req, res) => {
    const { lodgeName, ownerName, phone, address, loginId, password } = req.body;
    
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);
      
      const result = db.prepare(`
        INSERT INTO lodges (lodge_name, owner_name, phone, address, login_id, password, subscription_status, subscription_end_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(lodgeName, ownerName, phone, address, loginId, hashedPassword, 'trial', trialEndDate.toISOString());
      
      const lodgeId = result.lastInsertRowid;
      
      // Auto-seed some rooms for the new lodge
      const insertRoom = db.prepare("INSERT INTO rooms (lodge_id, room_number, type, price) VALUES (?, ?, ?, ?)");
      for (let i = 101; i <= 105; i++) insertRoom.run(lodgeId, i.toString(), "Single", 800);
      for (let i = 201; i <= 205; i++) insertRoom.run(lodgeId, i.toString(), "Double", 1200);
      
      res.status(201).json({ message: "Lodge registered successfully" });
    } catch (err: any) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: "Login ID already exists" });
      } else {
        res.status(500).json({ error: "Registration failed" });
      }
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body; // email is used as loginId
    const lodge = db.prepare("SELECT * FROM lodges WHERE login_id = ?").get(email) as any;
    
    if (lodge && bcrypt.compareSync(password, lodge.password)) {
      if (lodge.is_disabled && !lodge.is_super_admin) {
        return res.status(403).json({ error: "Your account has been disabled. Please contact support." });
      }
      const token = jwt.sign({ id: lodge.id, login_id: lodge.login_id, type: 'lodge' }, JWT_SECRET, { expiresIn: '24h' });
      
      // Check if trial/subscription has expired
      let subscriptionStatus = lodge.subscription_status;
      if (lodge.subscription_end_date && new Date(lodge.subscription_end_date) < new Date() && !lodge.is_super_admin) {
        subscriptionStatus = 'expired';
        // Update database if it was trial or active
        if (lodge.subscription_status !== 'expired') {
          db.prepare("UPDATE lodges SET subscription_status = 'expired' WHERE id = ?").run(lodge.id);
        }
      }

      res.json({ 
        token, 
        user: { 
          id: lodge.id,
          name: lodge.owner_name, 
          email: lodge.login_id,
          lodge_name: lodge.lodge_name,
          address: lodge.address,
          phone: lodge.phone,
          subscription_status: subscriptionStatus,
          subscription_end_date: lodge.subscription_end_date,
          is_super_admin: lodge.is_super_admin === 1,
          type: 'lodge'
        } 
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Public User Auth
  app.post("/api/public/register", (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      db.prepare("INSERT INTO public_users (name, email, password, phone) VALUES (?, ?, ?, ?)")
        .run(name, email, hashedPassword, phone);
      res.status(201).json({ message: "User registered successfully" });
    } catch (err: any) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Registration failed" });
      }
    }
  });

  app.post("/api/public/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM public_users WHERE email = ?").get(email) as any;
    
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, type: 'public' }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ 
        token, 
        user: { 
          id: user.id,
          name: user.name, 
          email: user.email,
          phone: user.phone,
          type: 'public'
        } 
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Public Search & Booking
  app.get("/api/public/search", (req, res) => {
    const { location } = req.query;
    let query = "SELECT id, lodge_name, owner_name, phone, address FROM lodges WHERE is_super_admin = 0 AND is_disabled = 0 AND subscription_status != 'expired'";
    const params: any[] = [];
    
    if (location) {
      query += " AND address LIKE ?";
      params.push(`%${location}%`);
    }
    
    const lodges = db.prepare(query).all(...params);
    res.json(lodges);
  });

  app.get("/api/public/lodge/:id/rooms", (req, res) => {
    const lodgeId = req.params.id;
    const rooms = db.prepare("SELECT id, room_number, type, price FROM rooms WHERE lodge_id = ? AND status = 'available'").all(lodgeId);
    res.json(rooms);
  });

  app.post("/api/public/book", authenticatePublicToken, (req, res) => {
    const { lodgeId, roomId, customerName, customerPhone, checkInDate, checkOutDate } = req.body;
    const publicUserId = (req as any).user.id;

    // Check for conflicts: Overlap if (S1 < E2) AND (S2 < E1)
    const conflict = db.prepare(`
      SELECT * FROM bookings 
      WHERE room_id = ? 
      AND status = 'confirmed'
      AND check_in_date < ? 
      AND check_out_date > ?
    `).get(roomId, checkOutDate, checkInDate);

    if (conflict) {
      return res.status(400).json({ error: "Room is already booked for these dates" });
    }

    db.prepare(`
      INSERT INTO bookings (lodge_id, room_id, public_user_id, customer_name, customer_phone, check_in_date, check_out_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(lodgeId, roomId, publicUserId, customerName, customerPhone, checkInDate, checkOutDate);

    // Send confirmation emails asynchronously
    sendBookingEmail({ lodgeId, roomId, publicUserId, customerName, checkInDate, checkOutDate });

    res.json({ success: true });
  });

  // Super Admin Endpoints
  app.get("/api/admin/lodges", authenticateToken, (req, res) => {
    if (!(req as any).user.is_super_admin) {
      // Check if they are actually super admin in DB
      const lodge = db.prepare("SELECT is_super_admin FROM lodges WHERE id = ?").get((req as any).user.id) as any;
      if (!lodge || !lodge.is_super_admin) return res.sendStatus(403);
    }
    const lodges = db.prepare("SELECT id, lodge_name, owner_name, phone, address, login_id, created_at, subscription_status, subscription_end_date, is_disabled FROM lodges WHERE is_super_admin = 0").all();
    res.json(lodges);
  });

  app.get("/api/admin/stats", authenticateToken, (req, res) => {
    if (!(req as any).user.is_super_admin) {
      const lodge = db.prepare("SELECT is_super_admin FROM lodges WHERE id = ?").get((req as any).user.id) as any;
      if (!lodge || !lodge.is_super_admin) return res.sendStatus(403);
    }
    
    const totalLodges = db.prepare("SELECT COUNT(*) as count FROM lodges WHERE is_super_admin = 0").get() as any;
    const activeSubscriptions = db.prepare("SELECT COUNT(*) as count FROM lodges WHERE subscription_status = 'active' AND is_super_admin = 0").get() as any;
    const expiredSubscriptions = db.prepare("SELECT COUNT(*) as count FROM lodges WHERE subscription_status = 'expired' AND is_super_admin = 0").get() as any;
    const disabledLodges = db.prepare("SELECT COUNT(*) as count FROM lodges WHERE is_disabled = 1 AND is_super_admin = 0").get() as any;
    
    res.json({
      totalLodges: totalLodges.count,
      activeSubscriptions: activeSubscriptions.count,
      expiredSubscriptions: expiredSubscriptions.count,
      disabledLodges: disabledLodges.count
    });
  });

  app.post("/api/admin/toggle-lodge-status", authenticateToken, (req, res) => {
    const { lodgeId, isDisabled } = req.body;
    
    if (!(req as any).user.is_super_admin) {
      const lodge = db.prepare("SELECT is_super_admin FROM lodges WHERE id = ?").get((req as any).user.id) as any;
      if (!lodge || !lodge.is_super_admin) return res.sendStatus(403);
    }

    db.prepare("UPDATE lodges SET is_disabled = ? WHERE id = ?").run(isDisabled ? 1 : 0, lodgeId);
    res.json({ success: true });
  });

  app.post("/api/admin/activate-subscription", authenticateToken, (req, res) => {
    const { lodgeId, planType } = req.body; // planType: 'monthly', 'yearly'
    
    if (!(req as any).user.is_super_admin) {
      const lodge = db.prepare("SELECT is_super_admin FROM lodges WHERE id = ?").get((req as any).user.id) as any;
      if (!lodge || !lodge.is_super_admin) return res.sendStatus(403);
    }

    const endDate = new Date();
    if (planType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (planType === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    db.prepare("UPDATE lodges SET subscription_status = 'active', subscription_end_date = ? WHERE id = ?").run(endDate.toISOString(), lodgeId);
    res.json({ success: true, endDate: endDate.toISOString() });
  });

  app.get("/api/admin/recent-activities", authenticateToken, (req, res) => {
    if (!(req as any).user.is_super_admin) {
      const lodge = db.prepare("SELECT is_super_admin FROM lodges WHERE id = ?").get((req as any).user.id) as any;
      if (!lodge || !lodge.is_super_admin) return res.sendStatus(403);
    }

    const activities: any[] = [];
    
    // New Lodges
    const newLodges = db.prepare("SELECT 'lodge_registration' as type, lodge_name as title, created_at as date FROM lodges WHERE is_super_admin = 0 ORDER BY created_at DESC LIMIT 10").all();
    activities.push(...newLodges);

    // New Public Users
    const newUsers = db.prepare("SELECT 'user_registration' as type, name as title, created_at as date FROM public_users ORDER BY created_at DESC LIMIT 10").all();
    activities.push(...newUsers);

    // New Bookings
    const newBookings = db.prepare(`
      SELECT 'booking' as type, l.lodge_name || ' - ' || b.customer_name as title, b.created_at as date 
      FROM bookings b 
      JOIN lodges l ON b.lodge_id = l.id 
      ORDER BY b.created_at DESC LIMIT 10
    `).all();
    activities.push(...newBookings);

    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(activities.slice(0, 20));
  });

  app.get("/api/admin/financials", authenticateToken, (req, res) => {
    if (!(req as any).user.is_super_admin) {
      const lodge = db.prepare("SELECT is_super_admin FROM lodges WHERE id = ?").get((req as any).user.id) as any;
      if (!lodge || !lodge.is_super_admin) return res.sendStatus(403);
    }

    const totalRevenue = db.prepare("SELECT SUM(total_amount) as total FROM checkouts").get() as any;
    const monthlyRevenue = db.prepare("SELECT SUM(total_amount) as total FROM checkouts WHERE check_out_date >= date('now', 'start of month')").get() as any;
    const totalExpenses = db.prepare("SELECT SUM(amount) as total FROM expenses").get() as any;

    res.json({
      totalRevenue: totalRevenue.total || 0,
      monthlyRevenue: monthlyRevenue.total || 0,
      totalExpenses: totalExpenses.total || 0,
      netProfit: (totalRevenue.total || 0) - (totalExpenses.total || 0)
    });
  });

  app.get("/api/admin/public-users", authenticateToken, (req, res) => {
    if (!(req as any).user.is_super_admin) {
      const lodge = db.prepare("SELECT is_super_admin FROM lodges WHERE id = ?").get((req as any).user.id) as any;
      if (!lodge || !lodge.is_super_admin) return res.sendStatus(403);
    }
    const users = db.prepare("SELECT id, name, email, phone, created_at FROM public_users ORDER BY created_at DESC").all();
    res.json(users);
  });

  app.post("/api/admin/impersonate", authenticateToken, (req, res) => {
    const { lodgeId } = req.body;
    
    if (!(req as any).user.is_super_admin) {
      const lodge = db.prepare("SELECT is_super_admin FROM lodges WHERE id = ?").get((req as any).user.id) as any;
      if (!lodge || !lodge.is_super_admin) return res.sendStatus(403);
    }

    const targetLodge = db.prepare("SELECT * FROM lodges WHERE id = ?").get(lodgeId) as any;
    if (!targetLodge) return res.status(404).json({ error: "Lodge not found" });

    const token = jwt.sign(
      { id: targetLodge.id, login_id: targetLodge.login_id, type: 'lodge', is_super_admin: false },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: targetLodge.id,
        name: targetLodge.owner_name,
        lodge_name: targetLodge.lodge_name,
        type: 'lodge',
        is_super_admin: false
      }
    });
  });
  app.get("/api/rooms", authenticateToken, (req, res) => {
    const lodgeId = (req as any).user.id;
    const rooms = db.prepare(`
      SELECT r.*, c.name as customer_name, ci.check_in_date, ci.advance_paid, c.phone as customer_phone, ci.num_guests
      FROM rooms r 
      LEFT JOIN checkins ci ON r.id = ci.room_id AND ci.status = 'active' AND ci.lodge_id = ?
      LEFT JOIN customers c ON ci.customer_id = c.id AND c.lodge_id = ?
      WHERE r.lodge_id = ?
    `).all(lodgeId, lodgeId, lodgeId);
    res.json(rooms);
  });

  app.post("/api/check-in", authenticateToken, (req, res) => {
    const { roomId, customerName, customerPhone, customerAddress, customerAadhaar, numGuests, paidAmount, checkInDate, checkInTime } = req.body;
    const lodgeId = (req as any).user.id;
    
    const room = db.prepare("SELECT * FROM rooms WHERE id = ? AND lodge_id = ?").get(roomId, lodgeId) as any;
    if (!room || room.status !== 'available') {
      return res.status(400).json({ error: "Room not available" });
    }

    const transaction = db.transaction(() => {
      // Find or create customer for this lodge
      let customer = db.prepare("SELECT id FROM customers WHERE (phone = ? OR aadhaar = ?) AND lodge_id = ?").get(customerPhone, customerAadhaar, lodgeId) as any;
      
      if (!customer) {
        const result = db.prepare(`
          INSERT INTO customers (lodge_id, name, phone, address, aadhaar) 
          VALUES (?, ?, ?, ?, ?)
        `).run(lodgeId, customerName, customerPhone, customerAddress, customerAadhaar);
        customer = { id: result.lastInsertRowid };
      } else {
        // Update existing customer info
        db.prepare(`
          UPDATE customers SET name = ?, address = ?, aadhaar = ? WHERE id = ? AND lodge_id = ?
        `).run(customerName, customerAddress, customerAadhaar, customer.id, lodgeId);
      }

      db.prepare(`
        INSERT INTO checkins (
          lodge_id, room_id, customer_id, num_guests, advance_paid, check_in_date, check_in_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(lodgeId, roomId, customer.id, numGuests, paidAmount, checkInDate, checkInTime);
      
      db.prepare("UPDATE rooms SET status = 'occupied' WHERE id = ? AND lodge_id = ?").run(roomId, lodgeId);
    });

    transaction();
    res.json({ success: true });
  });

  app.post("/api/check-out", authenticateToken, (req, res) => {
    const { roomId, totalAmount, checkOutDate, checkOutTime, paidAmount, stayDays } = req.body;
    const lodgeId = (req as any).user.id;
    
    const checkin = db.prepare("SELECT * FROM checkins WHERE room_id = ? AND status = 'active' AND lodge_id = ?").get(roomId, lodgeId) as any;
    if (!checkin) return res.status(404).json({ error: "No active check-in found" });

    const transaction = db.transaction(() => {
      const checkoutTs = checkOutDate && checkOutTime ? `${checkOutDate} ${checkOutTime}` : new Date().toISOString();
      
      db.prepare(`
        INSERT INTO checkouts (lodge_id, checkin_id, check_out_date, check_out_time, total_amount, balance_paid, stay_days)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(lodgeId, checkin.id, checkoutTs, checkOutTime, totalAmount, paidAmount, stayDays);

      db.prepare(`
        UPDATE checkins 
        SET status = 'completed'
        WHERE id = ? AND lodge_id = ?
      `).run(checkin.id, lodgeId);
      
      db.prepare("UPDATE rooms SET status = 'available' WHERE id = ? AND lodge_id = ?").run(roomId, lodgeId);
    });

    transaction();
    res.json({ success: true });
  });

  app.get("/api/reports", authenticateToken, (req, res) => {
    const lodgeId = (req as any).user.id;
    const { search, startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = " WHERE ci.lodge_id = ?";
    const params: any[] = [lodgeId];

    if (search) {
      whereClause += " AND c.name LIKE ?";
      params.push(`%${search}%`);
    }

    if (startDate) {
      whereClause += " AND date(ci.check_in_date) >= date(?)";
      params.push(startDate);
    }

    if (endDate) {
      whereClause += " AND date(ci.check_in_date) <= date(?)";
      params.push(endDate);
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM checkins ci
      JOIN customers c ON ci.customer_id = c.id
      ${whereClause}
    `;
    const totalCount = (db.prepare(countQuery).get(...params) as any).total;

    const summaryQuery = `
      SELECT 
        SUM(co.total_amount) as total_income,
        SUM(ci.advance_paid) as total_advance
      FROM checkins ci
      JOIN customers c ON ci.customer_id = c.id
      LEFT JOIN checkouts co ON ci.id = co.checkin_id
      ${whereClause}
    `;
    const summary = db.prepare(summaryQuery).get(...params) as any;

    const dataQuery = `
      SELECT 
        ci.*, 
        c.name as customer_name, 
        c.phone as customer_phone,
        r.room_number, 
        r.type as room_type,
        co.total_amount,
        co.check_out_date
      FROM checkins ci
      JOIN customers c ON ci.customer_id = c.id
      JOIN rooms r ON ci.room_id = r.id
      LEFT JOIN checkouts co ON ci.id = co.checkin_id
      ${whereClause}
      ORDER BY ci.check_in_date DESC
      LIMIT ? OFFSET ?
    `;
    const reports = db.prepare(dataQuery).all(...params, Number(limit), offset);

    res.json({
      data: reports,
      total: totalCount,
      summary: {
        totalIncome: summary.total_income || 0,
        totalAdvance: summary.total_advance || 0
      },
      page: Number(page),
      limit: Number(limit)
    });
  });

  app.get("/api/stats", authenticateToken, (req, res) => {
    const lodgeId = (req as any).user.id;
    const totalRooms = db.prepare("SELECT COUNT(*) as count FROM rooms WHERE lodge_id = ?").get(lodgeId) as any;
    const occupiedRooms = db.prepare("SELECT COUNT(*) as count FROM rooms WHERE status = 'occupied' AND lodge_id = ?").get(lodgeId) as any;
    const todayCheckins = db.prepare("SELECT COUNT(*) as count FROM checkins WHERE date(check_in_date) = date('now') AND lodge_id = ?").get(lodgeId) as any;
    const todayCheckouts = db.prepare("SELECT COUNT(*) as count FROM checkouts WHERE date(check_out_date) = date('now') AND lodge_id = ?").get(lodgeId) as any;
    
    const todayRevenueCheckin = db.prepare("SELECT SUM(advance_paid) as total FROM checkins WHERE date(check_in_date) = date('now') AND lodge_id = ?").get(lodgeId) as any;
    const todayRevenueCheckout = db.prepare("SELECT SUM(balance_paid) as total FROM checkouts WHERE date(check_out_date) = date('now') AND lodge_id = ?").get(lodgeId) as any;
    const todayExpenses = db.prepare("SELECT SUM(amount) as total FROM expenses WHERE date(date) = date('now') AND lodge_id = ?").get(lodgeId) as any;
    
    const revenue = (todayRevenueCheckin.total || 0) + (todayRevenueCheckout.total || 0);
    
    res.json({
      total: totalRooms.count,
      occupied: occupiedRooms.count,
      available: totalRooms.count - occupiedRooms.count,
      checkins: todayCheckins.count,
      checkouts: todayCheckouts.count,
      revenue: revenue - (todayExpenses.total || 0),
      grossRevenue: revenue,
      expenses: todayExpenses.total || 0
    });
  });

  // Expenses API
  app.get("/api/expenses", authenticateToken, (req, res) => {
    const lodgeId = (req as any).user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const totalCount = (db.prepare("SELECT COUNT(*) as total FROM expenses WHERE lodge_id = ?").get(lodgeId) as any).total;
    const expenses = db.prepare("SELECT * FROM expenses WHERE lodge_id = ? ORDER BY date DESC LIMIT ? OFFSET ?")
      .all(lodgeId, Number(limit), offset);

    res.json({
      data: expenses,
      total: totalCount,
      page: Number(page),
      limit: Number(limit)
    });
  });

  app.post("/api/expenses", authenticateToken, (req, res) => {
    const { description, amount, category, date } = req.body;
    const lodgeId = (req as any).user.id;
    db.prepare("INSERT INTO expenses (lodge_id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)")
      .run(lodgeId, description, amount, category, date || new Date().toISOString());
    res.json({ success: true });
  });

  app.delete("/api/expenses/:id", authenticateToken, (req, res) => {
    const lodgeId = (req as any).user.id;
    db.prepare("DELETE FROM expenses WHERE id = ? AND lodge_id = ?").run(req.params.id, lodgeId);
    res.json({ success: true });
  });

  // Bookings API
  app.get("/api/bookings", authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (user.type === 'public') {
      const bookings = db.prepare(`
        SELECT b.*, r.room_number, r.type as room_type, l.lodge_name, l.address as lodge_address
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN lodges l ON b.lodge_id = l.id
        WHERE b.public_user_id = ?
        ORDER BY b.created_at DESC
      `).all(user.id);
      res.json(bookings);
    } else {
      const lodgeId = user.id;
      const bookings = db.prepare(`
        SELECT b.*, r.room_number, r.type as room_type
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        WHERE b.lodge_id = ?
        ORDER BY b.check_in_date ASC
      `).all(lodgeId);
      res.json(bookings);
    }
  });

  app.post("/api/bookings", authenticateToken, (req, res) => {
    const lodgeId = (req as any).user.id;
    const { roomId, customerName, customerPhone, checkInDate, checkOutDate } = req.body;

    // Check for conflicts: Overlap if (S1 < E2) AND (S2 < E1)
    const conflict = db.prepare(`
      SELECT * FROM bookings 
      WHERE room_id = ? 
      AND status = 'confirmed'
      AND check_in_date < ? 
      AND check_out_date > ?
    `).get(roomId, checkOutDate, checkInDate);

    if (conflict) {
      return res.status(400).json({ error: "Room is already booked for these dates" });
    }

    db.prepare(`
      INSERT INTO bookings (lodge_id, room_id, customer_name, customer_phone, check_in_date, check_out_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(lodgeId, roomId, customerName, customerPhone, checkInDate, checkOutDate);

    res.json({ success: true });
  });

  app.delete("/api/bookings/:id", authenticateToken, (req, res) => {
    const lodgeId = (req as any).user.id;
    db.prepare("DELETE FROM bookings WHERE id = ? AND lodge_id = ?").run(req.params.id, lodgeId);
    res.json({ success: true });
  });

  app.post("/api/rooms", authenticateToken, (req, res) => {
    const { roomNumber, type, price } = req.body;
    const lodgeId = (req as any).user.id;
    try {
      db.prepare("INSERT INTO rooms (lodge_id, room_number, type, price) VALUES (?, ?, ?, ?)")
        .run(lodgeId, roomNumber, type, price);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to add room" });
    }
  });

  app.put("/api/rooms/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    const { roomNumber, type, price, status } = req.body;
    const lodgeId = (req as any).user.id;
    try {
      db.prepare("UPDATE rooms SET room_number = ?, type = ?, price = ?, status = ? WHERE id = ? AND lodge_id = ?")
        .run(roomNumber, type, price, status, id, lodgeId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to update room" });
    }
  });

  app.get("/api/analytics", authenticateToken, (req, res) => {
    const lodgeId = (req as any).user.id;
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push(dateStr);
    }

    const incomeData = last7Days.map(date => {
      const advance = db.prepare("SELECT SUM(advance_paid) as total FROM checkins WHERE date(check_in_date) = date(?) AND lodge_id = ?").get(date, lodgeId) as any;
      const balance = db.prepare("SELECT SUM(balance_paid) as total FROM checkouts WHERE date(check_out_date) = date(?) AND lodge_id = ?").get(date, lodgeId) as any;
      const expenses = db.prepare("SELECT SUM(amount) as total FROM expenses WHERE date(date) = date(?) AND lodge_id = ?").get(date, lodgeId) as any;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        income: (advance.total || 0) + (balance.total || 0),
        expenses: expenses.total || 0,
        profit: ((advance.total || 0) + (balance.total || 0)) - (expenses.total || 0)
      };
    });

    const occupancyData = last7Days.map(date => {
      const count = db.prepare(`
        SELECT COUNT(DISTINCT room_id) as count 
        FROM checkins ci
        LEFT JOIN checkouts co ON ci.id = co.checkin_id
        WHERE date(ci.check_in_date) <= date(?) 
        AND (ci.status = 'active' OR date(co.check_out_date) >= date(?))
        AND ci.lodge_id = ?
      `).get(date, date, lodgeId) as any;

      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        rooms: count.count
      };
    });

    res.json({ incomeData, occupancyData });
  });

  app.get("/api/backup", authenticateToken, (req, res) => {
    const lodgeId = (req as any).user.id;
    const rooms = db.prepare("SELECT * FROM rooms WHERE lodge_id = ?").all(lodgeId);
    const customers = db.prepare("SELECT * FROM customers WHERE lodge_id = ?").all(lodgeId);
    const checkins = db.prepare("SELECT * FROM checkins WHERE lodge_id = ?").all(lodgeId);
    const checkouts = db.prepare("SELECT * FROM checkouts WHERE lodge_id = ?").all(lodgeId);
    const expenses = db.prepare("SELECT * FROM expenses WHERE lodge_id = ?").all(lodgeId);
    const bookings = db.prepare("SELECT * FROM bookings WHERE lodge_id = ?").all(lodgeId);

    res.json({
      rooms,
      customers,
      checkins,
      checkouts,
      expenses,
      bookings,
      backupDate: new Date().toISOString()
    });
  });

  app.post("/api/restore", authenticateToken, express.json({ limit: '50mb' }), (req, res) => {
    const lodgeId = (req as any).user.id;
    const { rooms, customers, checkins, checkouts, expenses, bookings } = req.body;

    try {
      const transaction = db.transaction(() => {
        // Clear existing data for this lodge
        db.prepare("DELETE FROM checkouts WHERE lodge_id = ?").run(lodgeId);
        db.prepare("DELETE FROM checkins WHERE lodge_id = ?").run(lodgeId);
        db.prepare("DELETE FROM rooms WHERE lodge_id = ?").run(lodgeId);
        db.prepare("DELETE FROM customers WHERE lodge_id = ?").run(lodgeId);
        db.prepare("DELETE FROM expenses WHERE lodge_id = ?").run(lodgeId);
        db.prepare("DELETE FROM bookings WHERE lodge_id = ?").run(lodgeId);

        // Restore Rooms
        if (rooms) {
          const insertRoom = db.prepare(`
            INSERT INTO rooms (id, lodge_id, room_number, type, price, status)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          for (const r of rooms) insertRoom.run(r.id, lodgeId, r.room_number, r.type, r.price, r.status);
        }

        // Restore Customers
        if (customers) {
          const insertCustomer = db.prepare(`
            INSERT INTO customers (id, lodge_id, name, phone, address, aadhaar)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          for (const c of customers) insertCustomer.run(c.id, lodgeId, c.name, c.phone, c.address, c.aadhaar);
        }

        // Restore Checkins
        if (checkins) {
          const insertCheckin = db.prepare(`
            INSERT INTO checkins (id, lodge_id, room_id, customer_id, num_guests, check_in_date, check_in_time, advance_paid, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const ci of checkins) insertCheckin.run(ci.id, lodgeId, ci.room_id, ci.customer_id, ci.num_guests, ci.check_in_date, ci.check_in_time, ci.advance_paid, ci.status);
        }

        // Restore Checkouts
        if (checkouts) {
          const insertCheckout = db.prepare(`
            INSERT INTO checkouts (id, lodge_id, checkin_id, check_out_date, check_out_time, total_amount, balance_paid, stay_days)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const co of checkouts) insertCheckout.run(co.id, lodgeId, co.checkin_id, co.check_out_date, co.check_out_time, co.total_amount, co.balance_paid, co.stay_days);
        }

        // Restore Expenses
        if (expenses) {
          const insertExpense = db.prepare(`
            INSERT INTO expenses (id, lodge_id, description, amount, category, date)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          for (const e of expenses) insertExpense.run(e.id, lodgeId, e.description, e.amount, e.category, e.date);
        }

        // Restore Bookings
        if (bookings) {
          const insertBooking = db.prepare(`
            INSERT INTO bookings (id, lodge_id, room_id, customer_name, customer_phone, check_in_date, check_out_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const b of bookings) insertBooking.run(b.id, lodgeId, b.room_id, b.customer_name, b.customer_phone, b.check_in_date, b.check_out_date, b.status);
        }
      });

      transaction();
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Restore failed" });
    }
  });

  app.get("/api/export-csv", authenticateToken, (req, res) => {
    const lodgeId = (req as any).user.id;
    const { table } = req.query;
    
    let data: any[] = [];
    if (table === 'rooms') data = db.prepare("SELECT * FROM rooms WHERE lodge_id = ?").all(lodgeId);
    else if (table === 'customers') data = db.prepare("SELECT * FROM customers WHERE lodge_id = ?").all(lodgeId);
    else if (table === 'checkins') data = db.prepare(`
      SELECT ci.*, r.room_number, c.name as customer_name 
      FROM checkins ci
      JOIN rooms r ON ci.room_id = r.id
      JOIN customers c ON ci.customer_id = c.id
      WHERE ci.lodge_id = ?
    `).all(lodgeId);
    else if (table === 'expenses') data = db.prepare("SELECT * FROM expenses WHERE lodge_id = ?").all(lodgeId);

    if (data.length === 0) return res.send("No data found");

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => 
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${table}_export.csv`);
    res.send(`${headers}\n${rows}`);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SRS Lodge Manager running on http://localhost:${PORT}`);
  });
}

startServer();
