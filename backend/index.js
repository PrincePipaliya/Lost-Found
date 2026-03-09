require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const path = require("path");

const app = express();

/* =====================================================
   SECURITY MIDDLEWARE
===================================================== */

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

app.use(compression());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
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
   STATIC FILES (IMAGES)
===================================================== */

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* =====================================================
   DATABASE CONNECTION
===================================================== */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
  });

/* =====================================================
   ROUTES
===================================================== */

app.use("/api/auth", require("./routes/auth"));
app.use("/api/items", require("./routes/items"));
app.use("/api/users", require("./routes/users"));

/* =====================================================
   ERROR HANDLER
===================================================== */

app.use((err, req, res, next) => {

  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });

});

/* =====================================================
   START SERVER
===================================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(`🚀 Server running on port ${PORT}`);

});