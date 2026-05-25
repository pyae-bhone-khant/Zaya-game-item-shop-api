import type { Request, Response, NextFunction } from "express";

export const  getPost =  [

    (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        status: "success",
        message: "Post created",
        data: req.body
    });
}]; 

export const getPostsByPagination =  [

    (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        status: "success",
        message: "Post updated",
        data: req.body
    });
}]; 

