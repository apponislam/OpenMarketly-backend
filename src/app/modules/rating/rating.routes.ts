import { Router } from "express";
import auth from "../../middlewares/auth";
import { ratingControllers } from "./rating.controllers";

const router = Router();

// Public routes
router.get("/product/:productId", ratingControllers.getProductRatings);
router.get("/summary/:productId", ratingControllers.getRatingSummary);

// Protected routes (Require login)
router.post("/", auth, ratingControllers.createOrUpdateRating);
router.delete("/:id", auth, ratingControllers.deleteRating);

export const ratingRoutes = router;
