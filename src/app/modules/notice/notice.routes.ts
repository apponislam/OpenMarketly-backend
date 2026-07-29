import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import checkAuth from "../../middlewares/checkAuth";
import { noticeControllers } from "./notice.controllers";

const router = Router();

// Public
router.get("/default", noticeControllers.getDefaultNotice);
router.get("/", checkAuth, noticeControllers.getAllNotices);
router.get("/:id", noticeControllers.getNoticeById);

// Admin only
router.post("/", auth, authorize(["SUPER_ADMIN", "ADMIN"]), noticeControllers.createNotice);
router.patch("/:id", auth, authorize(["SUPER_ADMIN", "ADMIN"]), noticeControllers.updateNotice);
router.delete("/:id", auth, authorize(["SUPER_ADMIN", "ADMIN"]), noticeControllers.deleteNotice);

export const noticeRoutes = router;
