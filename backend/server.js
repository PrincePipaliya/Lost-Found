
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const itemRoutes = require("./routes/items");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/lostfound")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.use("/api/items", itemRoutes);

app.listen(5000, () => console.log("Backend running on port 5000"));
