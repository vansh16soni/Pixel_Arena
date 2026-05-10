const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data.json");

const defaultData = {
  goldenImage: null,
  round: {
    active: false,
    startTime: null,
    endTime: null,
    buildDuration: 30, // minutes
    analysisDuration: 2, // minutes
    phase: "idle", // idle | analysis | build | locked
  },
  submissions: [],
};

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return { ...defaultData };
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return { ...defaultData };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = { readData, writeData };
