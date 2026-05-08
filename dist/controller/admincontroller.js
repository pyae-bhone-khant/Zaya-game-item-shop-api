"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDieItem = exports.getDieItems = exports.createDieItem = void 0;
const admin_1 = require("../services/admin");
const createDieItem = async (req, res, next) => {
    try {
        const { price, diemondCount } = req.body;
        const Item = await (0, admin_1.createDieItem)(price, diemondCount);
        res.status(201).json(Item);
    }
    catch (error) {
        next(error);
    }
};
exports.createDieItem = createDieItem;
const getDieItems = async (req, res, next) => {
    try {
        const items = await (0, admin_1.getDieItemsService)();
        if (items.length === 0) {
            return res.status(404).json({ message: "Items not found" });
        }
        else {
            res.status(200).json(items);
        }
    }
    catch (error) {
        next(error);
    }
};
exports.getDieItems = getDieItems;
const updateDieItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { price, diemondCount } = req.body;
        const Item = await (0, admin_1.updateDieItemService)(Array.isArray(id) ? id[0] : id, price, diemondCount);
        res.status(200).json(Item);
    }
    catch (error) {
        next(error);
    }
};
exports.updateDieItem = updateDieItem;
//# sourceMappingURL=admincontroller.js.map