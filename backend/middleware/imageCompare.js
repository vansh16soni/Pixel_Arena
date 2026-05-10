const Jimp = require("jimp");
const pixelmatch = require("pixelmatch");
const { PNG } = require("pngjs");
const fs = require("fs");
const path = require("path");

/**
 * Resize image to target dimensions using Jimp
 */
async function resizeImage(imagePath, width, height) {
  const image = await Jimp.read(imagePath);
  image.resize(width, height);
  const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
  return buffer;
}

/**
 * Convert buffer to raw RGBA pixel data
 */
function bufferToRawPixels(buffer) {
  const png = PNG.sync.read(buffer);
  return { data: png.data, width: png.width, height: png.height };
}

/**
 * Compare two images and return similarity score + diff image path
 */
async function compareImages(goldenPath, submissionPath, diffOutputPath) {
  try {
    // Read both images to get dimensions
    const goldenImg = await Jimp.read(goldenPath);
    const TARGET_WIDTH = Math.min(goldenImg.getWidth(), 1280);
    const TARGET_HEIGHT = Math.min(goldenImg.getHeight(), 800);

    // Resize both images to same dimensions
    const goldenBuffer = await resizeImage(goldenPath, TARGET_WIDTH, TARGET_HEIGHT);
    const submissionBuffer = await resizeImage(submissionPath, TARGET_WIDTH, TARGET_HEIGHT);

    const golden = bufferToRawPixels(goldenBuffer);
    const submission = bufferToRawPixels(submissionBuffer);

    // Create diff output
    const diff = new PNG({ width: TARGET_WIDTH, height: TARGET_HEIGHT });

    const numDiffPixels = pixelmatch(
      golden.data,
      submission.data,
      diff.data,
      TARGET_WIDTH,
      TARGET_HEIGHT,
      {
        threshold: 0.1,
        includeAA: false,
        alpha: 0.3,
        diffColor: [255, 50, 50],
        aaColor: [255, 200, 0],
      }
    );

    // Save diff image
    const diffBuffer = PNG.sync.write(diff);
    fs.writeFileSync(diffOutputPath, diffBuffer);

    const totalPixels = TARGET_WIDTH * TARGET_HEIGHT;
    const matchedPixels = totalPixels - numDiffPixels;
    const similarityScore = Math.round((matchedPixels / totalPixels) * 100 * 100) / 100;

    return {
      similarity: similarityScore,
      diffPixels: numDiffPixels,
      totalPixels,
      matchedPixels,
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
    };
  } catch (err) {
    console.error("Image comparison error:", err);
    throw new Error("Failed to compare images: " + err.message);
  }
}

module.exports = { compareImages };
