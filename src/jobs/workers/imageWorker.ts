import { Worker } from "bullmq";
import sharp from "sharp";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const imageWorker = new Worker(
  "imageQueue",
  async (job) => {
    try {
      const { filePath, fileName, width, height, quality } = job.data;

      // ✅ အသစ်: process.cwd() ကိုသုံးရင် အပြင်ဆုံးက uploads folder ထဲကို တန်းရောက်ပါတယ်
      const optimizedDir = path.join(process.cwd(), "uploads", "optimize");
      const optimizedImagePath = path.join(optimizedDir, fileName);

      // Folder မရှိသေးရင် auto ဆောက်ပေးမယ်
      // await fs.mkdir(optimizedDir, { recursive: true });

      console.log("Processing image from:", filePath);
      console.log("Saving to:", optimizedImagePath);

      await sharp(filePath)
        .resize(width, height)
        .webp({ quality: quality })
        .toFile(optimizedImagePath);

      console.log("Image optimized successfully!");
    } catch (error) {
      console.error("Error processing image job:", error);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  }
);