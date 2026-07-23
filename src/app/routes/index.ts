import express from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { contactRoutes } from "../modules/contact/contact.routes";
import { feedbackRoutes } from "../modules/feedback/feedback.routes";
import { faqRoutes } from "../modules/faq/faq.routes";
import { visitorRoutes } from "../modules/visitor/visitor.routes";
import { categoryRoutes } from "../modules/category/category.routes";
import { productRoutes } from "../modules/product/product.routes";
import { ratingRoutes } from "../modules/rating/rating.routes";
import { favoriteRoutes } from "../modules/favorite/favorite.routes";
import { policyRoutes } from "../modules/policy/policy.routes";
import { cartRoutes } from "../modules/cart/cart.routes";
import { orderRoutes } from "../modules/order/order.routes";
import { disputeRoutes } from "../modules/dispute/dispute.routes";
import { couponRoutes } from "../modules/coupon/coupon.routes";

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
    {
        path: "/categories",
        route: categoryRoutes,
    },
    {
        path: "/products",
        route: productRoutes,
    },
    {
        path: "/ratings",
        route: ratingRoutes,
    },
    {
        path: "/favorites",
        route: favoriteRoutes,
    },
    {
        path: "/policies",
        route: policyRoutes,
    },
    {
        path: "/carts",
        route: cartRoutes,
    },
    {
        path: "/orders",
        route: orderRoutes,
    },
    {
        path: "/disputes",
        route: disputeRoutes,
    },
    {
        path: "/coupons",
        route: couponRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
