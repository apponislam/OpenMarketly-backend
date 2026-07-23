import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import { activityControllers } from "./activity.controllers";

const router = Router();

// Retrieve own logs (any authenticated user)
router.get("/my", auth, activityControllers.getMyActivityLogs);

// Retrieve all logs (admin and super admin only)
router.get("/", auth, authorize(["SUPER_ADMIN", "ADMIN"]), activityControllers.getAllActivityLogs);

export const activityRoutes = router;
