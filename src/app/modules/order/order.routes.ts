import { Router } from "express";
import auth from "../../middlewares/auth";
import { orderControllers } from "./order.controllers";

const router = Router();

// Order details & checkout (Require auth)
router.post("/checkout", auth, orderControllers.checkoutOrder);
router.get("/my", auth, orderControllers.getMyOrders);
router.get("/:id", auth, orderControllers.getOrderById);

// SSLCommerz payment callback endpoints (Redirect target for client browser from gateway)
router.post("/payment/success/:tranId", orderControllers.paymentSuccess);
router.post("/payment/fail/:tranId", orderControllers.paymentFail);
router.post("/payment/cancel/:tranId", orderControllers.paymentCancel);

export const orderRoutes = router;
