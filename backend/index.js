const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Mongo error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/items", require("./routes/items"));

// Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
