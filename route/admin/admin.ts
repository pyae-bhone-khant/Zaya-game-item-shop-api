import express from "express";
import upload from "../../middleware/uploadFile";
import { createPost } from "../../controller/admin/postController";
import { AuthMiddleware, isAdmin } from "../../middleware/auth";
const router = express.Router();


router.post("/posts"  , AuthMiddleware, isAdmin, upload.single("image"), createPost );
export default router;