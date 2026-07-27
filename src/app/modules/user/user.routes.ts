import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import { userControllers } from "./user.controllers";

const router = Router();

// Stats (Admin and Super Admin)
router.get("/stats", auth, authorize(["SUPER_ADMIN", "ADMIN"]), userControllers.getUserStats);

// Create Admin (Super Admin only)
router.post("/create-admin", auth, authorize(["SUPER_ADMIN"]), userControllers.createAdmin);

// Change Password (Authenticated user)
router.post("/change-password", auth, userControllers.changePassword);

// Change User Role (Super Admin only)
router.patch("/change-role/:userId", auth, authorize(["SUPER_ADMIN"]), userControllers.changeUserRole);

// Get all users (Admin & Super Admin)
router.get("/", auth, authorize(["SUPER_ADMIN", "ADMIN"]), userControllers.getAllUsers);

// Get single user by ID (Admin & Super Admin)
router.get("/:userId", auth, authorize(["SUPER_ADMIN", "ADMIN"]), userControllers.getSingleUser);

// User-wise sub-resources with pagination (Admin & Super Admin)
router.get("/:userId/products", auth, authorize(["SUPER_ADMIN", "ADMIN"]), userControllers.getUserProducts);
router.get("/:userId/orders", auth, authorize(["SUPER_ADMIN", "ADMIN"]), userControllers.getUserOrders);
router.get("/:userId/activities", auth, authorize(["SUPER_ADMIN", "ADMIN"]), userControllers.getUserActivities);
router.get("/:userId/notifications", auth, authorize(["SUPER_ADMIN", "ADMIN"]), userControllers.getUserNotifications);
router.get("/:userId/ratings", auth, authorize(["SUPER_ADMIN", "ADMIN"]), userControllers.getUserRatings);

export const userRoutes = router;
