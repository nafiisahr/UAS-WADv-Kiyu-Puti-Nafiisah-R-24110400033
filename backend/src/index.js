require("dotenv").config();
const PORT = process.env.PORT || 3000;

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient();

// middleware
const auth = require("./middleware/auth.js");
const role = require("./middleware/role.js");

const app = express();

app.use(cors());
app.use(express.json());

/* =====================
   LOGIN
===================== */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.password !== password) {
    return res.status(401).json({ message: "Wrong password" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ user, token });
});

/* =====================
   TENANT
===================== */
app.get("/tenants", async (req, res) => {
  const data = await prisma.tenant.findMany();
  res.json(data);
});

app.get("/tenants/:id", async (req, res) => {
  const data = await prisma.tenant.findUnique({
    where: { id: Number(req.params.id) },
  });

  res.json(data);
});

/* =====================
   TICKET SYSTEM
===================== */

// ambil antrian
app.post("/tenants/:id/tickets", auth, async (req, res) => {
  const tenantId = Number(req.params.id);

  const existing = await prisma.ticket.findFirst({
    where: {
      userId: req.user.id,
      tenantId,
      status: { in: ["waiting", "called"] },
    },
  });

  if (existing) {
    return res
      .status(400)
      .json({ message: "Masih punya antrian aktif" });
  }

  const last = await prisma.ticket.findFirst({
    where: { tenantId },
    orderBy: { queueNumber: "desc" },
  });

  const queueNumber = last ? last.queueNumber + 1 : 1;

  const ticket = await prisma.ticket.create({
    data: {
      queueNumber,
      userId: req.user.id,
      tenantId,
      status: "waiting",
    },
  });

  res.status(201).json(ticket);
});

// lihat antrian saya
app.get("/tickets/me", auth, async (req, res) => {
  const ticket = await prisma.ticket.findFirst({
    where: {
      userId: req.user.id,
      status: { in: ["waiting", "called"] },
    },
    include: { tenant: true },
  });

  res.json(ticket);
});

// lihat riwayat antrian saya (History)
app.get("/tickets/history", auth, async (req, res) => {
  try {
    const history = await prisma.ticket.findMany({
      where: {
        userId: req.user.id,
        status: "done" // Hanya ambil tiket yang sudah diselesaikan admin
      },
      include: { 
        tenant: true 
      },
      orderBy: { 
        createdAt: "desc" // Riwayat terbaru muncul paling atas
      }
    });
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil history" });
  }
});

// Rute Baru: Super Admin melihat seluruh tiket aktif di sistem Kiyu
app.get("/admin/all-tickets", auth, async (req, res) => {
  try {
    const data = await prisma.ticket.findMany({
      where: {
        status: { in: ["waiting", "called"] } 
      },
      include: { 
        tenant: true 
      },
      orderBy: { createdAt: "asc" } 
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil semua data antrean" });
  }
});

// admin lihat semua ticket
app.get(
  "/tenants/:id/tickets",
  auth,
  role("tenant_admin"),
  async (req, res) => {
    const data = await prisma.ticket.findMany({
      where: { tenantId: Number(req.params.id) },
      orderBy: { queueNumber: "asc" },
    });

    res.json(data);
  }
);

// next queue
app.put(
  "/tenants/:id/next",
  auth,
  role("tenant_admin"),
  async (req, res) => {
    const tenantId = Number(req.params.id);

    const next = await prisma.ticket.findFirst({
      where: { tenantId, status: "waiting" },
      orderBy: { queueNumber: "asc" },
    });

    if (!next) {
      return res.json({ message: "No queue" });
    }

    const updated = await prisma.ticket.update({
      where: { id: next.id },
      data: { status: "called" },
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { currentNumber: next.queueNumber },
    });

    res.json(updated);
  }
);

// done
app.put(
  "/tickets/:id/done",
  auth,
  role("tenant_admin"),
  async (req, res) => {
    const ticket = await prisma.ticket.update({
      where: { id: Number(req.params.id) },
      data: { status: "done" },
    });

    res.json(ticket);
  }
);

/* =====================
   START SERVER
===================== */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);

  // AUTH
  console.log(`  POST   /login`);

  // TENANTS
  console.log(`  GET    /tenants`);
  console.log(`  GET    /tenants/:id`);

  // TICKETS
  console.log(`  POST   /tenants/:id/tickets`);
  console.log(`  GET    /tickets/me`);
  console.log(`  GET    /tenants/:id/tickets (admin only)`);
  console.log(`  PUT    /tenants/:id/next (admin only)`);
  console.log(`  PUT    /tickets/:id/done (admin only)`);
});