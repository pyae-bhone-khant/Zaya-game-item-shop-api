import { Queue } from "bullmq";


export const imageQueue = new Queue("imageQueue", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});