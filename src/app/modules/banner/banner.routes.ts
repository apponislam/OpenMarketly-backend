import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import checkAuth from "../../middlewares/checkAuth";
import { bannerControllers } from "./banner.controllers";

const router = Router();

// Public (uses checkAuth for optional admin detection)
router.get("/", checkAuth, bannerControllers.getAllBanners);
router.get("/:id", bannerControllers.getBannerById);

// Admin only
router.post("/", auth, authorize(["SUPER_ADMIN", "ADMIN"]), bannerControllers.createBanner);
router.patch("/:id", auth, authorize(["SUPER_ADMIN", "ADMIN"]), bannerControllers.updateBanner);
router.delete("/:id", auth, authorize(["SUPER_ADMIN", "ADMIN"]), bannerControllers.deleteBanner);

export const bannerRoutes = router;
