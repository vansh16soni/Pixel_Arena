const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { readData, writeData } = require("../middleware/store");
const { compareImages } = require("../middleware/imageCompare");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/submissions"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `submission-${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
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

// Submit screenshot
router.post("/", upload.single("screenshot"), async (req, res) => {
  try {
    const { teamName, githubUrl } = req.body;

    if (!teamName || teamName.trim() === "") {
      return res.status(400).json({ error: "Team name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Screenshot is required" });
    }

    const data = readData();

    if (!data.goldenImage) {
      return res.status(400).json({ error: "No golden image set by admin yet" });
    }

    // Check round status
    if (data.round.phase === "locked") {
      return res.status(403).json({ error: "Submissions are closed for this round" });
    }

    const id = uuidv4();
    const diffFilename = `diff-${id}.png`;
    const diffPath = path.join(__dirname, "../uploads/diffs", diffFilename);

    // Compare images
    const result = await compareImages(data.goldenImage.path, req.file.path, diffPath);

    const submission = {
      id,
      teamName: teamName.trim(),
      githubUrl: githubUrl || null,
      screenshotUrl: `/uploads/submissions/${req.file.filename}`,
      screenshotPath: req.file.path,
      diffUrl: `/uploads/diffs/${diffFilename}`,
      similarity: result.similarity,
      diffPixels: result.diffPixels,
      totalPixels: result.totalPixels,
      submittedAt: new Date().toISOString(),
    };

    // Update or add submission for team
    const existingIdx = data.submissions.findIndex(
      (s) => s.teamName.toLowerCase() === teamName.trim().toLowerCase()
    );

    if (existingIdx !== -1) {
      data.submissions[existingIdx] = submission;
    } else {
      data.submissions.push(submission);
    }

    writeData(data);

    res.json({ success: true, submission });
  } catch (err) {
    console.error("Submission error:", err);
    res.status(500).json({ error: err.message || "Failed to process submission" });
  }
});

// Get leaderboard (public)
router.get("/leaderboard", (req, res) => {
  const data = readData();
  const sorted = [...data.submissions]
    .sort((a, b) => b.similarity - a.similarity)
    .map((s, i) => ({ ...s, rank: i + 1 }));
  res.json({ leaderboard: sorted, round: data.round });
});

// Get a single submission by team name
router.get("/team/:teamName", (req, res) => {
  const data = readData();
  const submission = data.submissions.find(
    (s) => s.teamName.toLowerCase() === req.params.teamName.toLowerCase()
  );
  if (!submission) return res.status(404).json({ error: "Team not found" });
  res.json({ submission });
});

module.exports = router;
