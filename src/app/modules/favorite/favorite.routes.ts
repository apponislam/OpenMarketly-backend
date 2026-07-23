import { Router } from "express";
import auth from "../../middlewares/auth";
import { favoriteControllers } from "./favorite.controllers";

const router = Router();

// Protected routes (Requires login)
router.post("/toggle", auth, favoriteControllers.toggleFavorite);
router.get("/my", auth, favoriteControllers.getMyFavorites);
router.get("/check/:productId", auth, favoriteControllers.checkIsFavorite);
router.delete("/:productId", auth, favoriteControllers.removeFavorite);

export const favoriteRoutes = router;
