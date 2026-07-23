import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import { couponControllers } from "./coupon.controllers";

const router = Router();

// Validation (Require auth for customers checking coupons)
router.get("/validate", auth, couponControllers.validateCoupon);

// General listings (Lists active for users, lists all for Admin check)
router.get("/", auth, couponControllers.getAllCoupons);

// Admin controls
router.post("/", auth, authorize(["SUPER_ADMIN", "ADMIN"]), couponControllers.createCoupon);
router.patch("/:id", auth, authorize(["SUPER_ADMIN", "ADMIN"]), couponControllers.updateCoupon);
router.delete("/:id", auth, authorize(["SUPER_ADMIN", "ADMIN"]), couponControllers.deleteCoupon);

export const couponRoutes = router;
