import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("lodge.db");
const JWT_SECRET = process.env.JWT_SECRET || "srs-lodge-secret-key-2024";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_number TEXT UNIQUE,
    type TEXT, -- Single, Double, Deluxe
    price REAL,
    status TEXT DEFAULT 'available' -- available, occupied, maintenance
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER,
    customer_name TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    customer_aadhaar TEXT,
    num_guests INTEGER DEFAULT 1,
    check_in_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_in_time TEXT,
    check_out_date DATETIME,
    total_amount REAL,
    paid_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'active', -- active, completed, cancelled
    FOREIGN KEY (room_id) REFERENCES rooms(id)
  );
`);

// Seed Admin if not exists
const adminExists = db.prepare("SELECT * FROM admins WHERE email = ?").get("admin@srslodge.com");
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO admins (email, password, name) VALUES (?, ?, ?)").run(
    "admin@srslodge.com",
    hashedPassword,
    "SRS Admin"
  );
}

// Seed Rooms if empty
const roomCount = db.prepare("SELECT COUNT(*) as count FROM rooms").get() as { count: number };
if (roomCount.count === 0) {
  const insertRoom = db.prepare("INSERT INTO rooms (room_number, type, price) VALUES (?, ?, ?)");
  for (let i = 101; i <= 110; i++) insertRoom.run(i.toString(), "Single", 800);
  for (let i = 201; i <= 210; i++) insertRoom.run(i.toString(), "Double", 1200);
  for (let i = 301; i <= 305; i++) insertRoom.run(i.toString(), "Deluxe", 2000);
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

  // API Routes
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email) as any;
    
    if (admin && bcrypt.compareSync(password, admin.password)) {
      const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { name: admin.name, email: admin.email } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/rooms", authenticateToken, (req, res) => {
    const rooms = db.prepare(`
      SELECT r.*, b.customer_name, b.check_in_date 
      FROM rooms r 
      LEFT JOIN bookings b ON r.id = b.room_id AND b.status = 'active'
    `).all();
    res.json(rooms);
  });

  app.post("/api/check-in", authenticateToken, (req, res) => {
    const { roomId, customerName, customerPhone, customerAddress, customerAadhaar, numGuests, paidAmount, checkInTime } = req.body;
    
    const room = db.prepare("SELECT * FROM rooms WHERE id = ?").get(roomId) as any;
    if (!room || room.status !== 'available') {
      return res.status(400).json({ error: "Room not available" });
    }

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO bookings (
          room_id, customer_name, customer_phone, customer_address, 
          customer_aadhaar, num_guests, paid_amount, check_in_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(roomId, customerName, customerPhone, customerAddress, customerAadhaar, numGuests, paidAmount, checkInTime);
      
      db.prepare("UPDATE rooms SET status = 'occupied' WHERE id = ?").run(roomId);
    });

    transaction();
    res.json({ success: true });
  });

  app.post("/api/check-out", authenticateToken, (req, res) => {
    const { roomId, totalAmount } = req.body;
    
    const booking = db.prepare("SELECT * FROM bookings WHERE room_id = ? AND status = 'active'").get(roomId) as any;
    if (!booking) return res.status(404).json({ error: "No active booking found" });

    const transaction = db.transaction(() => {
      db.prepare("UPDATE bookings SET status = 'completed', check_out_date = CURRENT_TIMESTAMP, total_amount = ? WHERE id = ?")
        .run(totalAmount, booking.id);
      db.prepare("UPDATE rooms SET status = 'available' WHERE id = ?").run(roomId);
    });

    transaction();
    res.json({ success: true });
  });

  app.get("/api/stats", authenticateToken, (req, res) => {
    const totalRooms = db.prepare("SELECT COUNT(*) as count FROM rooms").get() as any;
    const occupiedRooms = db.prepare("SELECT COUNT(*) as count FROM rooms WHERE status = 'occupied'").get() as any;
    const todayRevenue = db.prepare("SELECT SUM(paid_amount) as total FROM bookings WHERE date(check_in_date) = date('now')").get() as any;
    
    res.json({
      total: totalRooms.count,
      occupied: occupiedRooms.count,
      available: totalRooms.count - occupiedRooms.count,
      revenue: todayRevenue.total || 0
    });
  });

  app.post("/api/rooms", authenticateToken, (req, res) => {
    const { roomNumber, type, price } = req.body;
    try {
      db.prepare("INSERT INTO rooms (room_number, type, price) VALUES (?, ?, ?)")
        .run(roomNumber, type, price);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to add room" });
    }
  });

  app.put("/api/rooms/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    const { roomNumber, type, price, status } = req.body;
    try {
      db.prepare("UPDATE rooms SET room_number = ?, type = ?, price = ?, status = ? WHERE id = ?")
        .run(roomNumber, type, price, status, id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to update room" });
    }
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
