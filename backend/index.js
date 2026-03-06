require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const Chat = require("./models/Chat");
const Item = require("./models/Item");

const app = express();
const server = http.createServer(app);

/* =====================================================
   SECURITY MIDDLEWARE (Production Grade)
===================================================== */

app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

app.use(mongoSanitize());
app.use(xss());

const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests. Try again later.",
});

app.use("/api", limiter);

/* =====================================================
   STATIC FILES
===================================================== */

app.use("/uploads", express.static("uploads"));

/* =====================================================
   DATABASE CONNECTION (Optimized)
===================================================== */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
  });

/* =====================================================
   SOCKET.IO SETUP (Secure + Scalable)
===================================================== */

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.user.id);

  /* JOIN ROOM */
  socket.on("join_room", async (roomId) => {
    try {
      const item = await Item.findById(roomId);

      if (!item || item.status !== "matched") return;

      const isOwner = item.user.toString() === socket.user.id;

      const approvedClaim = item.claims?.find(
        (c) =>
          c.user.toString() === socket.user.id &&
          c.status === "approved"
      );

      if (!isOwner && !approvedClaim) return;

      socket.join(roomId);

      const messages = await Chat.find({ itemId: roomId })
        .sort({ createdAt: 1 });

      socket.emit("chat_history", messages);
    } catch (err) {
      console.error("JOIN ROOM ERROR:", err);
    }
  });

  /* SEND MESSAGE */
  socket.on("send_message", async ({ roomId, text }) => {
    try {
      const item = await Item.findById(roomId);
      if (!item || item.status !== "matched") return;

      const isOwner = item.user.toString() === socket.user.id;

      const approvedClaim = item.claims?.find(
        (c) =>
          c.user.toString() === socket.user.id &&
          c.status === "approved"
      );

      if (!isOwner && !approvedClaim) return;

      const newMessage = await Chat.create({
        itemId: roomId,
        senderId: socket.user.id,
        message: text,
      });

      io.to(roomId).emit("receive_message", newMessage);
    } catch (err) {
      console.error("CHAT ERROR:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.user.id);
  });
});

/* =====================================================
   ROUTES
===================================================== */

app.use("/api/auth", require("./routes/auth"));
app.use("/api/items", require("./routes/items"));
app.use("/api/users", require("./routes/users"));

/* =====================================================
   CENTRAL ERROR HANDLER
===================================================== */

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

/* =====================================================
   GRACEFUL SHUTDOWN
===================================================== */

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
  server.close(() => process.exit(1));
});

/* =====================================================
   START SERVER
===================================================== */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});