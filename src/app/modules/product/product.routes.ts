import { Router } from "express";
import auth from "../../middlewares/auth";
import { productControllers } from "./product.controllers";

const router = Router();

// Public routes
router.get("/", productControllers.getAllProducts);
router.get("/slug/:slug", productControllers.getProductBySlug);
router.get("/:id", productControllers.getProductById);

// Protected routes (Seller / Authenticated users)
router.get("/my/products", auth, productControllers.getMyProducts);
router.post("/", auth, productControllers.createProduct);
router.patch("/:id", auth, productControllers.updateProduct);
router.delete("/:id", auth, productControllers.deleteProduct);

export const productRoutes = router;
