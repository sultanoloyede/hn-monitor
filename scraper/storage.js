const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const client = new S3Client({ region: process.env.AWS_REGION });

async function uploadScreenshot(buffer, runAt) {
  // runAt is a Date — build a time-based key so files are easy to browse
  const key = `screenshots/${runAt.toISOString().replace(/[:.]/g, "-")}.png`;

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
    }),
  );

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

module.exports = { uploadScreenshot };
