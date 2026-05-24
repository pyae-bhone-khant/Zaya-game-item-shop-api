import { Router } from "express";
import upload, { uploadMemory } from "../../middleware/uploadFile";

import { AuthMiddleware } from "../../middleware/auth";
import { uploadProfile, uploadProfileMultiple, uploadProfileOptimized } from "../../controller/user/user";

const router = Router();

router.patch("/profile/upload", AuthMiddleware, upload.single("avatar") , uploadProfile );
router.patch("/profile/upload/multiple", AuthMiddleware, upload.array("avatar") , uploadProfileMultiple );
router.patch("/profile/upload/optimized", AuthMiddleware, upload.single("avatar") , uploadProfileOptimized );




export default router;