import type { Request, Response, NextFunction } from "express";
import { checkUserIfNotExist } from "../../utils/check";
import { checkfileIfNotExists } from "../../utils/check";
import { getUserById } from "../../services/user";
import { updateUser  } from "../../services/user";
import { unlink } from "fs/promises";
import sharp from "sharp";
import path from "path";
import { imageQueue } from "../../src/jobs/queues/imageQueue";
export const uploadProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,   
) => {
  const userId = req.user?.id;
  
  if (!userId) {
    const error: any = new Error("User not authenticated");
    error.statusCode = 401;
    throw error;
  }
 
  const user = await getUserById(userId);
  const image = req.file;

   await checkUserIfNotExist(user);
  await checkfileIfNotExists(image);

const filename = image!.filename;

if (user?.image){
  try {
     const filepath = path.join(__dirname, "../../uploads/images", user!.image!);
     await unlink(filepath);
   } catch (error: any) {
     console.log("Error deleting old profile image:", error);
   }
}

const userData = {
  image : filename
}

await updateUser(userId, userData);
  
return res.status(200).json({
    message: "User profile uploaded successfully",
    image : filename
  });
};


export const uploadProfileMultiple = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
 
  res.status(200).json({
    message: "User multiple files uploaded successfully",
    images: req.files
  });
};

export const uploadProfileOptimized = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {

 const userId = req.user?.id;
  
  if (!userId) {
    const error: any = new Error("User not authenticated");
    error.statusCode = 401;
    throw error;
  }
 
  const user = await getUserById(userId);
  const image = req.file;

   await checkUserIfNotExist(user);
  await checkfileIfNotExists(image);

  // const fileName =  Date.now() + "-" + `${Math.round(Math.random() * 1e9)}.webp`;
  // const splitfileName = req.file?.filename.split("."); 
  const fileBaseName = path.parse(image!.filename).name;
  const outputFileName = `${fileBaseName}.webp`;
  const job = await imageQueue.add("optimize-image", {
    filePath: req.file?.path,
    fileName:  `${outputFileName}`,
    width: 200,
    height: 200,
    quality: 50
  });


//   if (user?.image){
//   try {
//      const originalFilePath = path.join(__dirname, "../../uploads/images", user!.image!);
//      const optimizeFilePath = path.join(__dirname, "../../uploads/optimize", user!.image!.split(".")[0] + ".webp");

//      await unlink(originalFilePath);
//      await unlink(optimizeFilePath);

//    } catch (error: any) {
//      console.log("Error deleting old profile image:", error);
//    }
// } 
if (user?.image) {
  try {
    const oldFileBaseName = path.parse(user.image).name;
    
    // ✅ နေရာတိုင်းမှာ process.cwd() ကိုပဲ ပြောင်းသုံးပေးပါ
    const originalFilePath = path.join(process.cwd(), "uploads", "images", user.image);
    const optimizeFilePath = path.join(process.cwd(), "uploads", "optimize", `${oldFileBaseName}.webp`);

    await unlink(originalFilePath);
    await unlink(optimizeFilePath);
  } catch (error) {
    console.log("Error deleting old profile image:", error);
  }
}

const userData = {
  image : req.file?.filename
}

await updateUser(userId, userData);
  
  res.status(200).json({
    message: "User profile optimized successfully",
    image : outputFileName,
    jobId : job.id
  });
};
