import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import checkAuth from "../../middlewares/checkAuth";
import { productControllers } from "./product.controllers";

const router = Router();

// Public routes
router.get("/", checkAuth, productControllers.getAllProducts);
router.get("/slug/:slug", checkAuth, productControllers.getProductBySlug);
router.get("/:id", checkAuth, productControllers.getProductById);

// Protected routes (Seller / Authenticated users)
router.get("/my/products", auth, authorize(["SUPER_ADMIN", "ADMIN", "SELLER"]), productControllers.getMyProducts);
router.post("/", auth, authorize(["SUPER_ADMIN", "ADMIN", "SELLER"]), productControllers.createProduct);
router.patch("/:id", auth, authorize(["SUPER_ADMIN", "ADMIN", "SELLER"]), productControllers.updateProduct);
router.delete("/:id", auth, authorize(["SUPER_ADMIN", "ADMIN", "SELLER"]), productControllers.deleteProduct);
router.patch("/:id/approve", auth, authorize(["SUPER_ADMIN", "ADMIN"]), productControllers.approveProduct);

export const productRoutes = router;
