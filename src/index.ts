import "dotenv/config";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { auth } from "../lib/auth";
import type { Request, Response, NextFunction } from "express";
import adminRoute from "../route/admin.js"

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use("/api/auth", toNodeHandler(auth));
app.use("/api/admin", adminRoute);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Server Error";
  const errorCode = error.code || "Error_Code";
  res.status(status).json({ message, error: errorCode });
});

app.listen(8000, () => {
    console.log("Server running on http://localhost:8000");
});