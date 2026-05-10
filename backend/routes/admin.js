const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { readData, writeData } = require("../middleware/store");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/golden"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `golden${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

// Upload golden image
router.post("/golden-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });

  const data = readData();
  data.goldenImage = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: req.file.path,
    url: `/uploads/golden/${req.file.filename}`,
    uploadedAt: new Date().toISOString(),
  };
  writeData(data);

  res.json({ success: true, goldenImage: data.goldenImage });
});

// Delete golden image
router.delete("/golden-image", (req, res) => {
  const data = readData();
  if (!data.goldenImage) {
    return res.status(404).json({ error: "No golden image to delete" });
  }

  // Delete the actual file from disk
  const fs = require("fs");
  if (fs.existsSync(data.goldenImage.path)) {
    fs.unlinkSync(data.goldenImage.path);
  }

  // Remove from data store
  data.goldenImage = null;
  writeData(data);

  res.json({ success: true });
});

// Get golden image info
router.get("/golden-image", (req, res) => {
  const data = readData();
  res.json({ goldenImage: data.goldenImage });
});

// Get all submissions (admin view)
router.get("/submissions", (req, res) => {
  const data = readData();
  const sorted = [...data.submissions].sort((a, b) => b.similarity - a.similarity);
  res.json({ submissions: sorted });
});

// Delete a submission
router.delete("/submissions/:id", (req, res) => {
  const data = readData();
  const idx = data.submissions.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  data.submissions.splice(idx, 1);
  writeData(data);
  res.json({ success: true });
});

// Reset all submissions
router.post("/reset", (req, res) => {
  const data = readData();
  data.submissions = [];
  data.round = {
    active: false,
    startTime: null,
    endTime: null,
    buildDuration: data.round.buildDuration || 30,
    analysisDuration: data.round.analysisDuration || 2,
    phase: "idle",
  };
  writeData(data);

  // Clean up submission files
  const subDir = path.join(__dirname, "../uploads/submissions");
  const diffDir = path.join(__dirname, "../uploads/diffs");
  [subDir, diffDir].forEach((dir) => {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach((f) => fs.unlinkSync(path.join(dir, f)));
    }
  });

  res.json({ success: true });
});

module.exports = router;
