import { Router } from "express";
import auth from "../../middlewares/auth";
import { notificationControllers } from "./notification.controllers";

const router = Router();

// Retrieve notifications for authenticated user
router.get("/my", auth, notificationControllers.getMyNotifications);

// Mark all notifications for authenticated user as read
router.patch("/read-all", auth, notificationControllers.markAllAsRead);

// Mark a specific notification as read
router.patch("/:id/read", auth, notificationControllers.markAsRead);

export const notificationRoutes = router;
