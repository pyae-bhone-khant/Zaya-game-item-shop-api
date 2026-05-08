"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const admincontroller_1 = require("../controller/admincontroller");
const router = express_1.default.Router();
router.post("/createItem", auth_1.AuthMiddleware, auth_1.isAdmin, admincontroller_1.createDieItem);
router.get("/getItems", auth_1.AuthMiddleware, auth_1.isAdmin, admincontroller_1.getDieItems);
router.put("/updateItem/:id", auth_1.AuthMiddleware, auth_1.isAdmin, admincontroller_1.updateDieItem);
exports.default = router;
//# sourceMappingURL=admin.js.map