import express from "express";
import upload from "../../middleware/uploadFile";
import { createPost, deletePost, updatePost } from "../../controller/admin/postController";
import { AuthMiddleware, isAdmin } from "../../middleware/auth";
import { deleteOnePost } from "../../services/postService";
// import { createPost, updatePost } from "../../controller/admin/postController";
const router = express.Router();


router.post("/posts"  , AuthMiddleware, isAdmin, upload.single("image"), createPost );
router.patch("/posts", AuthMiddleware, isAdmin, upload.single("image"),updatePost  );
router.delete("/posts", AuthMiddleware, isAdmin, deletePost  );

export default router;