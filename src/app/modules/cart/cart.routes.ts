import { Router } from "express";
import auth from "../../middlewares/auth";
import { cartControllers } from "./cart.controllers";

const router = Router();

// Protected routes (Require login)
router.get("/my", auth, cartControllers.getMyCart);
router.post("/add", auth, cartControllers.addToCart);
router.patch("/update", auth, cartControllers.updateCartItemQuantity);
router.delete("/item/:productId", auth, cartControllers.removeFromCart);
router.delete("/clear", auth, cartControllers.clearCart);

export const cartRoutes = router;
