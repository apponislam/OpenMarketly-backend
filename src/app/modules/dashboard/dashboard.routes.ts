import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import { dashboardControllers } from "./dashboard.controllers";

const router = Router();

// Retrieve admin & super admin dashboard statistics
router.get("/admin", auth, authorize(["SUPER_ADMIN", "ADMIN"]), dashboardControllers.getAdminStats);

// Retrieve seller dashboard statistics
router.get("/seller", auth, authorize(["SELLER"]), dashboardControllers.getSellerStats);

// Retrieve customer dashboard statistics
router.get("/customer", auth, authorize(["CUSTOMER"]), dashboardControllers.getCustomerStats);

export const dashboardRoutes = router;
