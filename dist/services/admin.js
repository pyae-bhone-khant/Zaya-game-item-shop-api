"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDieItemService = exports.getDieItemsService = exports.createDieItem = void 0;
const prisma_1 = require("../lib/prisma");
const createDieItem = (price, diemondCount) => {
    return prisma_1.prisma.diamondPackage.create({
        data: {
            price,
            diemondCount
        }
    });
};
exports.createDieItem = createDieItem;
const getDieItemsService = () => {
    return prisma_1.prisma.diamondPackage.findMany();
};
exports.getDieItemsService = getDieItemsService;
const updateDieItemService = (id, price, diemondCount) => {
    return prisma_1.prisma.diamondPackage.update({
        where: {
            id
        },
        data: {
            price,
            diemondCount
        }
    });
};
exports.updateDieItemService = updateDieItemService;
//# sourceMappingURL=admin.js.map