import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import checkAuth from "../../middlewares/checkAuth";
import { visitorControllers } from "./visitor.controllers";

const router = Router();

// Public tracking endpoint (can be called by frontend clients)
router.post("/track", checkAuth, visitorControllers.trackVisit);

// Admin-only Visitor Analytics
router.get("/stats", auth, authorize(["SUPER_ADMIN", "ADMIN"]), visitorControllers.getVisitorStats);

export const visitorRoutes = router;
