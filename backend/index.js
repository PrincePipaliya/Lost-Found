const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Chat = require("./models/Chat");
const Item = require("./models/Item");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

/* 🔐 SOCKET AUTH */
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

/* ================= SOCKET EVENTS ================= */

io.on("connection", (socket) => {
  console.log("User connected:", socket.user.id);

  /* JOIN ROOM */
  socket.on("join_room", async (roomId) => {
    try {
      const item = await Item.findById(roomId);

      if (!item || !item.claimed) return;

      const isOwner = item.userId.toString() === socket.user.id;

      const approvedClaim = item.claims.find(
        (c) =>
          c.userId.toString() === socket.user.id &&
          c.status === "approved"
      );

      // 🚫 Only owner or approved claimer can join
      if (!isOwner && !approvedClaim) return;

      socket.join(roomId);

      // ✅ Send chat history
      const messages = await Chat.find({ itemId: roomId }).sort({ createdAt: 1 });

      socket.emit("chat_history", messages.map((msg) => ({
        sender: msg.senderId,
        text: msg.message,
        time: new Date(msg.createdAt).toLocaleTimeString()
      })));

    } catch (err) {
      console.error("JOIN ROOM ERROR:", err);
    }
  });

  /* SEND MESSAGE */
  socket.on("send_message", async (data) => {
    try {
      const item = await Item.findById(data.roomId);
      if (!item || !item.claimed) return;

      const isOwner = item.userId.toString() === socket.user.id;

      const approvedClaim = item.claims.find(
        (c) =>
          c.userId.toString() === socket.user.id &&
          c.status === "approved"
      );

      // 🚫 Security check
      if (!isOwner && !approvedClaim) return;

      const newMessage = await Chat.create({
        itemId: data.roomId,
        senderId: socket.user.id,
        message: data.text
      });

      io.to(data.roomId).emit("receive_message", {
        sender: socket.user.id,
        text: data.text,
        time: new Date(newMessage.createdAt).toLocaleTimeString()
      });

    } catch (err) {
      console.error("CHAT SAVE ERROR:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.id);
  });
});

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ================= DATABASE ================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

mongoose.connection.once("open", () => {
  console.log("CONNECTED TO DB:", mongoose.connection.name);
});

/* ================= ROUTES ================= */

app.use("/api/auth", require("./routes/auth"));
app.use("/api/items", require("./routes/items"));
app.use("/api/users", require("./routes/users"));

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
