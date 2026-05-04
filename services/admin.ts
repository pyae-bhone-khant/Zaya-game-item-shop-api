import { prisma } from "../lib/prisma";

export const createDieItem = (price: number, diemondCount: number) => {
    return prisma.diamondPackage.create({
        data: {
            price,
            diemondCount
        }
    })
}

export const getDieItemsService = () => {
    return prisma.diamondPackage.findMany()
} 

export const updateDieItemService = (id: string, price: number, diemondCount: number) => {
    return prisma.diamondPackage.update({
        where: {
            id
        },
        data: {
            price,
            diemondCount
        }
    })
} 
