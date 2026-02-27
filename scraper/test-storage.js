require("dotenv").config({ path: "../.env" });
const { uploadScreenshot } = require("./storage");

// 1×1 transparent PNG (minimal valid PNG)
const minimalPng = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6260000000020001e221bc330000000049454e44ae426082",
  "hex",
);

uploadScreenshot(minimalPng, new Date())
  .then((url) => console.log("Uploaded:", url))
  .catch((err) => console.error("Failed:", err));
