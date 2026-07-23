import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import { categoryControllers } from "./category.controllers";

const router = Router();

// Public routes
router.get("/parents", categoryControllers.getParentCategories);
router.get("/subcategories/:parentId", categoryControllers.getSubcategories);
router.get("/", categoryControllers.getAllCategories);
router.get("/:id", categoryControllers.getCategoryById);

// Admin protected routes
router.post("/", auth, authorize(["SUPER_ADMIN", "ADMIN"]), categoryControllers.createCategory);
router.patch("/:id", auth, authorize(["SUPER_ADMIN", "ADMIN"]), categoryControllers.updateCategory);
router.delete("/:id", auth, authorize(["SUPER_ADMIN", "ADMIN"]), categoryControllers.deleteCategory);

export const categoryRoutes = router;
