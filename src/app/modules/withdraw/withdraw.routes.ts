import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import { withdrawControllers } from "./withdraw.controllers";

const router = Router();

// Seller Routes
router.post("/", auth, authorize(["SELLER"]), withdrawControllers.createWithdrawRequest);
router.get("/my", auth, authorize(["SELLER"]), withdrawControllers.getMyWithdrawRequests);

// Admin Routes
router.get("/", auth, authorize(["SUPER_ADMIN", "ADMIN"]), withdrawControllers.getAllWithdrawRequests);
router.patch("/:id/resolve", auth, authorize(["SUPER_ADMIN", "ADMIN"]), withdrawControllers.resolveWithdrawRequest);

export const withdrawRoutes = router;
