import type { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { getUserById } from "../../services/user";
import { checkUserIfNotExist, checkfileIfNotExists } from "../../utils/check";
import path from "path";
import { imageQueue } from "../../src/jobs/queues/imageQueue";
import { createOnePost, PostArgs } from "../../services/postService";
import { unlink } from "fs/promises";


interface CreatePostRequest extends Request {
  user? : any
} 

const removefile = async (filePath: string | null) => {
     if (!filePath) return;
     try {
        await unlink(filePath);
      } catch (error) {
        console.log("Error deleting file:", error);
      }
}

export const createPost =  [
    body("title" , "title is required").notEmpty().trim().escape(),
    body("content" , "content is required").notEmpty().trim().escape(),
    body("body" , "body is required").notEmpty().trim().escape(),
    body("category" , "category is required").notEmpty().trim().escape(),
    body("type" , "type is required").notEmpty().trim().escape(),
    body("tags" , "tags must be an array").optional({ nullable: true }).customSanitizer((value) => {
        if (value) {
            return value.split(",").filter((tag: string) => tag.trim() !== "");
        }
        return value
     
    }),
     async (req: CreatePostRequest, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
    if (errors.array().length > 0) {
        if( req.file) {
            await removefile(req.file.path);
        }
      return res.status(400).json({ errors: errors.array() });
    }
   
    const {title, content, body, category, type, tags} = req.body;

     const userId = req.user?.id;
  
  if (!userId) {
    const error: any = new Error("User not authenticated");
    error.statusCode = 401;
    throw error;
  }
 
  const image = req.file;
  await checkfileIfNotExists(image);
  const user = await getUserById(userId);

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
   
  const fileBaseName = path.parse(image!.filename).name;
  const outputFileName = `${fileBaseName}.webp`;
  await imageQueue.add("optimize-image", {
    filePath: req.file?.path,
    fileName:  `${outputFileName}`,
    width: 835,
    height: 577,
    quality: 100
  });
   
 const data : PostArgs = {
    title,
    content,
    body,
    category,
    type,
    tags,
    image: req.file!.filename,
    authorId: userId
 }
 const post = await createOnePost(data)

    res.status(201).json({
        status: "success",
        message: "Post created",
        postId : post.id
    });
}]; 

