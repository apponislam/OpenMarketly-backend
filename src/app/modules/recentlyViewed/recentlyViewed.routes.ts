import { Router } from "express";
import auth from "../../middlewares/auth";
import { recentlyViewedControllers } from "./recentlyViewed.controllers";

const router = Router();

// All routes require user authentication
router.post("/", auth, recentlyViewedControllers.addProductToRecentlyViewed);
router.get("/", auth, recentlyViewedControllers.getRecentlyViewedProducts);
router.delete("/", auth, recentlyViewedControllers.clearRecentlyViewed);

export const recentlyViewedRoutes = router;
