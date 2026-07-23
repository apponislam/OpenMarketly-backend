import express from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { contactRoutes } from "../modules/contact/contact.routes";
import { feedbackRoutes } from "../modules/feedback/feedback.routes";
import { faqRoutes } from "../modules/faq/faq.routes";
import { visitorRoutes } from "../modules/visitor/visitor.routes";

const router = express.Router();

const moduleRoutes = [
    {
        path: "/auth",
        route: authRoutes,
    },
    {
        path: "/contacts",
        route: contactRoutes,
    },
    {
        path: "/feedbacks",
        route: feedbackRoutes,
    },
    {
        path: "/faqs",
        route: faqRoutes,
    },
    {
        path: "/visitors",
        route: visitorRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
