// server.js or index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/UserRoutes");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON body

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB Error:", err));

// API Routes
app.use("/api/users", userRoutes);

app.listen(process.env.PORT || 8080, () =>
  console.log(`Server running on port ${process.env.PORT || 8080}`)
);
