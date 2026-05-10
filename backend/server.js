const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure upload directories exist
const dirs = [
  path.join(__dirname, "uploads"),
  path.join(__dirname, "uploads/golden"),
  path.join(__dirname, "uploads/submissions"),
  path.join(__dirname, "uploads/diffs"),
];
dirs.forEach((d) => !fs.existsSync(d) && fs.mkdirSync(d, { recursive: true }));

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/admin", require("./routes/admin"));
app.use("/api/submissions", require("./routes/submissions"));
app.use("/api/round", require("./routes/round"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`🚀 Vibe Snapshot backend running on port ${PORT}`);
});
