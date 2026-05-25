import express from "express";
import { AuthMiddleware } from "../../middleware/auth";
import { getPost, getPostsByPagination } from "../../controller/api/postController";
const router = express.Router(); 

router.get("/posts/:id" , AuthMiddleware , getPost ) 
router.get("/posts" , AuthMiddleware , getPostsByPagination ) 


export default router;