import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import checkAuth from "../../middlewares/checkAuth";
import { faqControllers } from "./faq.controllers";

const router = Router();

router.get("/", checkAuth, faqControllers.getAllFaqs);
router.post("/", auth, authorize(["SUPER_ADMIN", "ADMIN"]), faqControllers.createFaq);
router.patch("/:id", auth, authorize(["SUPER_ADMIN", "ADMIN"]), faqControllers.updateFaq);
router.delete("/:id", auth, authorize(["SUPER_ADMIN", "ADMIN"]), faqControllers.deleteFaq);

export const faqRoutes = router;
