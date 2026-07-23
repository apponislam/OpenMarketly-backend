import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import { settingsControllers } from "./settings.controllers";

const router = Router();

// Public — frontend needs settings for branding, currency, feature flags etc.
router.get("/", settingsControllers.getSettings);

// Admin only — update site settings
router.patch("/", auth, authorize(["SUPER_ADMIN", "ADMIN"]), settingsControllers.updateSettings);

export const settingsRoutes = router;
