import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import { disputeControllers } from "./dispute.controllers";

const router = Router();

// Customer endpoints
router.post("/", auth, disputeControllers.raiseDispute);
router.get("/my", auth, disputeControllers.getMyDisputes);

// Admin endpoints
router.get("/", auth, authorize(["SUPER_ADMIN", "ADMIN"]), disputeControllers.getAllDisputes);
router.patch("/resolve/:id", auth, authorize(["SUPER_ADMIN", "ADMIN"]), disputeControllers.resolveDispute);

export const disputeRoutes = router;
