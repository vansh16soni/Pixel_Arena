const express = require("express");
const router = express.Router();
const { readData, writeData } = require("../middleware/store");

// Get round status
router.get("/", (req, res) => {
  const data = readData();
  res.json({ round: data.round });
});

// Start a round
router.post("/start", (req, res) => {
  const { buildDuration = 30, analysisDuration = 2 } = req.body;
  const data = readData();

  if (!data.goldenImage) {
    return res.status(400).json({ error: "Upload a golden image before starting a round" });
  }

  const now = Date.now();
  // Analysis phase comes first (participants study the golden image)
  const analysisEnd = now + analysisDuration * 60 * 1000;
  // Build phase starts after analysis
  const buildEnd = analysisEnd + buildDuration * 60 * 1000;

  data.round = {
    active: true,
    startTime: new Date(now).toISOString(),
    analysisEndTime: new Date(analysisEnd).toISOString(),
    endTime: new Date(buildEnd).toISOString(),
    buildDuration,
    analysisDuration,
    phase: "analysis",
  };

  writeData(data);
  res.json({ success: true, round: data.round });
});

// End/lock a round
router.post("/lock", (req, res) => {
  const data = readData();
  data.round.phase = "locked";
  data.round.active = false;
  writeData(data);
  res.json({ success: true, round: data.round });
});

// Update round phase based on time
router.post("/sync", (req, res) => {
  const data = readData();
  if (!data.round.active) return res.json({ round: data.round });

  const now = Date.now();
  const analysisEnd = new Date(data.round.analysisEndTime).getTime();
  const buildEnd = new Date(data.round.endTime).getTime();

  if (now >= buildEnd) {
    data.round.phase = "locked";
    data.round.active = false;
  } else if (now >= analysisEnd) {
    data.round.phase = "build";
  } else {
    data.round.phase = "analysis";
  }

  writeData(data);
  res.json({ round: data.round });
});

module.exports = router;
