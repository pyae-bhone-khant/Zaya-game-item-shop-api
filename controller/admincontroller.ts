import type { NextFunction, Request, Response } from "express";
import { createDieItem as createDieItemService, getDieItemsService , updateDieItemService } from "../services/admin";

export const createDieItem = async (req: Request, res: Response , next : NextFunction) => {
    try {
       const { price ,  diemondCount  } = req.body
      const Item =  await createDieItemService(price, diemondCount)
       res.status(201).json(Item)
    } catch (error) {
        next(error)
    }
}

export const getDieItems = async (req: Request, res: Response , next : NextFunction) => {
    try {
       const items = await getDieItemsService()
       if (items.length === 0) {
        return res.status(404).json({ message: "Items not found" })
       } else {
           res.status(200).json(items)
       }
    } catch (error) {
        next(error)
    }
}
interface customRequest extends Request {
    user?: any;
    id ? :any;
}
export const updateDieItem = async (req: customRequest, res: Response , next : NextFunction) => {
    try {
       const { id } = req.params
       const { price ,  diemondCount  } = req.body
       const Item =  await updateDieItemService(Array.isArray(id) ? id[0] : id, price, diemondCount)
       res.status(200).json(Item)
    } catch (error) {
        next(error)
    }
}


