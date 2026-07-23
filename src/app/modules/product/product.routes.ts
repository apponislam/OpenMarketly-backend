import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import { productControllers } from "./product.controllers";

const router = Router();

// Public routes
router.get("/", productControllers.getAllProducts);
router.get("/slug/:slug", productControllers.getProductBySlug);
router.get("/:id", productControllers.getProductById);

// Protected routes (Seller / Authenticated users)
router.get("/my/products", auth, authorize(["SUPER_ADMIN", "ADMIN", "SELLER"]), productControllers.getMyProducts);
router.post("/", auth, authorize(["SUPER_ADMIN", "ADMIN", "SELLER"]), productControllers.createProduct);
router.patch("/:id", auth, authorize(["SUPER_ADMIN", "ADMIN", "SELLER"]), productControllers.updateProduct);
router.delete("/:id", auth, authorize(["SUPER_ADMIN", "ADMIN", "SELLER"]), productControllers.deleteProduct);

export const productRoutes = router;
