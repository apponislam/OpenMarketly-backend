import { Router } from "express";
import auth from "../../middlewares/auth";
import { wishlistControllers } from "./wishlist.controllers";

const router = Router();

router.get("/", auth, wishlistControllers.getMyWishlist);
router.post("/toggle", auth, wishlistControllers.toggleWishlist);
router.get("/check/:productId", auth, wishlistControllers.checkIsWishlisted);

export const wishlistRoutes = router;
