import express from "express";
import { isAdmin, AuthMiddleware } from "../middleware/auth";
import { createDieItem , getDieItems , updateDieItem } from "../controller/admincontroller";
const router = express.Router();


router.post("/createItem" , AuthMiddleware, isAdmin , createDieItem)
router.get("/getItems" , AuthMiddleware, isAdmin , getDieItems)
router.put("/updateItem/:id" , AuthMiddleware, isAdmin , updateDieItem)

export default router;
