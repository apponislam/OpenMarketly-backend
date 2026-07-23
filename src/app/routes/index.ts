import express from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { contactRoutes } from "../modules/contact/contact.routes";
import { feedbackRoutes } from "../modules/feedback/feedback.routes";
import { faqRoutes } from "../modules/faq/faq.routes";
import { visitorRoutes } from "../modules/visitor/visitor.routes";
import { categoryRoutes } from "../modules/category/category.routes";
import { productRoutes } from "../modules/product/product.routes";
import { ratingRoutes } from "../modules/rating/rating.routes";
import { wishlistRoutes } from "../modules/wishlist/wishlist.routes";
import { policyRoutes } from "../modules/policy/policy.routes";
import { cartRoutes } from "../modules/cart/cart.routes";
import { orderRoutes } from "../modules/order/order.routes";
import { disputeRoutes } from "../modules/dispute/dispute.routes";
import { couponRoutes } from "../modules/coupon/coupon.routes";
import { reportRoutes } from "../modules/report/report.routes";
import { bannerRoutes } from "../modules/banner/banner.routes";
import { settingsRoutes } from "../modules/settings/settings.routes";
import { recentlyViewedRoutes } from "../modules/recentlyViewed/recentlyViewed.routes";

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
        path: "/wishlists",
        route: wishlistRoutes,
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
    {
        path: "/reports",
        route: reportRoutes,
    },
    {
        path: "/banners",
        route: bannerRoutes,
    },
    {
        path: "/settings",
        route: settingsRoutes,
    },
    {
        path: "/recently-viewed",
        route: recentlyViewedRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
