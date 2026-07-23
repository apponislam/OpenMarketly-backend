import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import { categoryControllers } from "./category.controllers";

const router = Router();

// Public routes
router.get("/", categoryControllers.getAllCategories);
router.get("/:id", categoryControllers.getCategoryById);

// Admin protected routes
router.post("/", auth, authorize(["ADMIN"]), categoryControllers.createCategory);
router.patch("/:id", auth, authorize(["ADMIN"]), categoryControllers.updateCategory);
router.delete("/:id", auth, authorize(["ADMIN"]), categoryControllers.deleteCategory);

export const categoryRoutes = router;
