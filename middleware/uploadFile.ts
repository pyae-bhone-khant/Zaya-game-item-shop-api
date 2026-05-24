
import multer from "multer"
import type { Request , Response , NextFunction } from "express"
import path from "path"

const fileStorage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    cb(null, 'uploads/images')
  },
  filename: function (req: Request, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, uniqueSuffix + ext)
  }
})

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/webp' || file.mimetype === 'image/gif') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const upload = multer({ 
    storage: fileStorage, 
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB
    }
})

export const uploadMemory = multer({ 
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB
    }
})

export default upload