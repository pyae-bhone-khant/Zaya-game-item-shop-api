import { Request, Response, NextFunction } from "express";
import { body, query, validationResult } from "express-validator";
import sanitizeHtml from "sanitize-html";
import { unlink } from "node:fs/promises";
import path from "path";

import getPostById, {
  createOnePost,
  updateOnePost,
  PostArgs,
  deleteOnePost,
} from "../../services/postService";
import { cacheQueue } from "../../src/jobs/queues/cacheQueue";
import { imageQueue } from "../../src/jobs/queues/imageQueue";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

/**
 * Attempts to unlink a file, retrying on Windows EPERM/EBUSY.
 */
import { unlink as fsUnlink } from "fs/promises";
import { checkModelIfExist, checkUploadFile } from "../../utils/check";

async function safeUnlink(
  filePath: string,
  retries = 3,
  delayMs = 100
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await fsUnlink(filePath);
      return;
    } catch (err: any) {
      // Only retry on EPERM or EBUSY (Windows file-lock errors)
      if ((err.code === "EPERM" || err.code === "EBUSY") && attempt < retries) {
        // wait a bit, then retry
        await new Promise((res) => setTimeout(res, delayMs));
        continue;
      }
      // rethrow for any other error, or if out of retries
      throw err;
    }
  }
}

const removeFiles = async (
  originalFile: string,
  optimizedFile: string | null
) => {
  try {
    const originalFilePath = path.join(
      __dirname,
      "../..",
      "/uploads/images",
      originalFile
    );

    // await safeUnlink(originalFilePath);  // Use this For windows error - 'EPERM' or 'EBUSY'
    await unlink(originalFilePath);

    if (optimizedFile) {
      const optimizedFilePath = path.join(
        __dirname,
        "../..",
        "/uploads/optimize",
        optimizedFile
      );

      // await safeUnlink(optimizedFilePath);  // Use this For windows error - 'EPERM' or 'EBUSY'
      await unlink(optimizedFilePath);
    }
  } catch (error) {
    console.log(error);
  }
};

export const createPost = [
  body("title", "Title is required.").trim().notEmpty().escape(),
  body("content", "Content is required.").trim().notEmpty().escape(),
  body("body", "Body is required.")
    .trim()
    .notEmpty()
    .customSanitizer((value) => sanitizeHtml(value))
    .notEmpty(),
  body("category", "Category is required.").trim().notEmpty().escape(),
  body("type", "Type is required.").trim().notEmpty().escape(),
  body("tags", "Tag is invalid.")
    .optional({ nullable: true })
    .customSanitizer((value) => {
      if (value) {
        return value.split(",").filter((tag: string) => tag.trim() !== "");
      }
      return value;
    }),

  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      if (req.file) {
        await removeFiles(req.file.filename, null);
      }
      return next(new Error(errors[0].msg));
    }

    const { title, content, body, category, type, tags } = req.body;
    // const userId = req.userId;
    const user = req.user;
      checkUploadFile(req.file);
    // const user = await getUserById(userId!);
    // if (!user) {
    //   if (req.file) {
    //     await removeFiles(req.file.filename, null);
    //   }

    //   return next(
    //     createError(
    //       "This user has not registered.",
    //       401,
    //       errorCode.unauthenticated
    //     )
    //   );
    // }

    const splitFileName = req.file?.filename.split(".")[0];

    await imageQueue.add(
      "optimize-image",
      {
        filePath: req.file?.path,
        fileName: `${splitFileName}.webp`,
        width: 835,
        height: 577,
        quality: 100,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      }
    );

    const data: PostArgs = {
      title,
      content,
      body,
      image: req.file!.filename,
      authorId: user!.id,
      category,
      type,
      tags,
    };

    const post = await createOnePost(data);

    await cacheQueue.add(
      "invalidate-post-cache",
      {
        pattern: "posts:*",
      },
      {
        jobId: `invalidate-${Date.now()}`,
        priority: 1,
      }
    );

    res
      .status(201)
      .json({ message: "Successfully created a new post.", postId: post.id });
  },
];

export const updatePost = [
  body("postId", "Post Id is required.").isInt({ min: 1 }),
  body("title", "Title is required.").trim().notEmpty().escape(),
  body("content", "Content is required.").trim().notEmpty().escape(),
  body("body", "Body is required.")
    .trim()
    .notEmpty()
    .customSanitizer((value) => sanitizeHtml(value))
    .notEmpty(),
  body("category", "Category is required.").trim().notEmpty().escape(),
  body("type", "Type is required.").trim().notEmpty().escape(),
  body("tags", "Tag is invalid.")
    .optional({ nullable: true })
    .customSanitizer((value) => {
      if (value) {
        return value.split(",").filter((tag: string) => tag.trim() !== "");
      }
      return value;
    }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      if (req.file) {
        await removeFiles(req.file.filename, null);
      }
      return next(new Error(errors[0].msg));
    }

    const { postId, title, content, body, category, type, tags } = req.body;

    // const userId = req.userId;
    const user = req.user;
    // const user = await getUserById(userId!);
    // if (!user) {
    //   if (req.file) {
    //     await removeFiles(req.file.filename, null);
    //   }

    //   return next(
    //     createError(
    //       "This user has not registered.",
    //       401,
    //       errorCode.unauthenticated
    //     )
    //   );
    // }

    const post = await getPostById(+postId); // "8" -> 8
    if (!post) {
      if (req.file) {
        await removeFiles(req.file.filename, null);
      }

      return next(new Error("This data model does not exist."));
    }

    // admin A ---> Post A --> update/delete
    // admin B ---> update/delete --> Post A X
    if (user.id !== post.authorId) {
      if (req.file) {
        await removeFiles(req.file.filename, null);
      }

      return next(new Error("This action is not allowed."));
    }

    const data: any = {
      title,
      content,
      body,
      image: req.file,
      category,
      type,
      tags,
    };

    if (req.file) {
      data.image = req.file.filename;

      const splitFileName = req.file.filename.split(".")[0];

      await imageQueue.add(
        "optimize-image",
        {
          filePath: req.file?.path,
          fileName: `${splitFileName}.webp`,
          width: 835,
          height: 577,
          quality: 100,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        }
      );

      const optimizedFile = post.image.split(".")[0] + ".webp";
      await removeFiles(post.image, optimizedFile);
    }

    const postUpdated = await updateOnePost(post.id, data);

    await cacheQueue.add(
      "invalidate-post-cache",
      {
        pattern: "posts:*",
      },
      {
        jobId: `invalidate-${Date.now()}`,
        priority: 1,
      }
    );

    res.status(200).json({
      message: "Successfully updated the post.",
      postId: postUpdated.id,
    });
  },
];

export const deletePost = [
  // 1. Validation Logic
  body("postId", "Post Id is required.").isInt({ gt: 0 }),

  // 2. Controller Logic
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req).array({ onlyFirstError: true });
      
      // Validation မအောင်ရင် 400 Bad Request ကို တန်းပြန်မယ် (next() ဆီ မပို့တော့ပါ)
      if (errors.length > 0) {
        return res.status(400).json({
          message: errors[0].msg,
          error: "VALIDATION_ERROR",
        });
      }

      const { postId } = req.body;
      const user = req.user;

      // Post ရှိ၊ မရှိ စစ်ဆေးခြင်း
      const post = await getPostById(+postId);
      if (!post) {
        return res.status(404).json({
          message: "Post not found.",
          error: "NOT_FOUND",
        });
      }

      // ပိုင်ရှင် ဟုတ်၊ မဟုတ် စစ်ဆေးခြင်း
      if (user!.id !== post.authorId) {
        return res.status(403).json({
          message: "This action is not allowed.",
          error: "FORBIDDEN",
        });
      }

      // Post ဖျက်ခြင်း နှင့် File များ ဖျက်ခြင်း
      const postDeleted = await deleteOnePost(post.id);
      const optimizedFile = post.image.split(".")[0] + ".webp";
      await removeFiles(post.image, optimizedFile);

      // Cache ဖျက်ခြင်း
      await cacheQueue.add(
        "invalidate-post-cache",
        { pattern: "posts:*" },
        {
          jobId: `invalidate-${Date.now()}`,
          priority: 1,
        }
      );

      // အောင်မြင်ကြောင်း Response ပြန်ခြင်း
      return res.status(200).json({
        message: "Successfully deleted the post.",
        postId: postDeleted.id,
      });

    } catch (error: any) {
      // မထင်မှတ်ထားတဲ့ Server Error တွေတက်ရင် ဗဟို Error Handler ဆီ ပို့မယ်
      next(error);
    }
  },
];
