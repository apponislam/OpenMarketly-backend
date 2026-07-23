import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import { policyControllers } from "./policy.controllers";

const router = Router();

// Public routes
router.get("/", policyControllers.getAllPolicies);
router.get("/:type", policyControllers.getPolicyByType);

// Admin protected routes
router.post("/", auth, authorize(["SUPER_ADMIN", "ADMIN"]), policyControllers.createOrUpdatePolicy);
router.delete("/:type", auth, authorize(["SUPER_ADMIN", "ADMIN"]), policyControllers.deletePolicy);

export const policyRoutes = router;
