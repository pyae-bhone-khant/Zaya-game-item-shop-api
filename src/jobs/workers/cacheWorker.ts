// import { Worker } from "bullmq";
// import Redis from "ioredis";

// const redis = new Redis({
//   host: process.env.REDIS_HOST || "localhost",
//   port: parseInt(process.env.REDIS_PORT || "6379"),
// });

// const cacheWorker = new Worker("cache-invalidation", async (job) => {
//  const {pattern} = job.data;
//  await redis.del(pattern);
// },
// {
//  connection: {
//   host: process.env.REDIS_HOST || "localhost",
//   port: parseInt(process.env.REDIS_PORT || "6379"),
//  },
//  concurrency: 5,
// });

// cacheWorker.on('error', (error) => {
//   console.error('Cache worker error:', error);
// });

// cacheWorker.on('completed', (job) => {
//   console.log('Cache job completed:', job.id);
// });

// cacheWorker.on('failed', (job, error) => {
//   console.error('Cache job failed:', job?.id, error);
// });

// console.log('Cache worker started');

// export default cacheWorker;


