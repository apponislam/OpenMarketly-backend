import { Router } from "express";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorized";
import { reportControllers } from "./report.controllers";

const router = Router();

// Raise a ticket (Require auth for customers filing reports)
router.post("/", auth, reportControllers.createReport);

// View ticket detail (Reporter or Admin)
router.get("/:id", auth, reportControllers.getReportById);

// Admin controls
router.get("/", auth, authorize(["ADMIN"]), reportControllers.getAllReports);
router.patch("/resolve/:id", auth, authorize(["ADMIN"]), reportControllers.resolveReport);

export const reportRoutes = router;
