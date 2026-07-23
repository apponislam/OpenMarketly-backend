import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { OrderModel } from "./order.model";
import { CartModel } from "../cart/cart.model";
import { ProductModel } from "../product/product.model";
import { CouponModel } from "../coupon/coupon.model";
import { couponServices } from "../coupon/coupon.services";
import { IShippingAddress } from "./order.interface";
import { validateSSLCommerzPayment, initiateSSLCommerzPayment } from "./sslcommerz.utils";
import { UserModel } from "../auth/auth.model";
import { activityServices } from "../activity/activity.services";
import { ActivityType } from "../activity/activity.interface";
import { SettingsModel } from "../settings/settings.model";

const checkoutOrder = async (
    userId: string,
    shippingAddress: IShippingAddress,
    userContext: { name: string; email: string; phone?: string },
    couponCode?: string
) => {
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.country || !shippingAddress.phone) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Complete shipping address is required");
    }

    const cart = await CartModel.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Your shopping cart is empty");
    }

    // Verify stock levels for all products in cart
    for (const item of cart.items) {
        const product: any = item.product;
        if (!product || product.isDeleted || !product.isActive) {
            throw new ApiError(httpStatus.NOT_FOUND, "One or more products in your cart are no longer available");
        }
        if (product.stockQuantity < item.quantity) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Insufficient stock for product '${product.name}'. Max available: ${product.stockQuantity}`
            );
        }
    }

    // Process coupon code if provided
    let finalPrice = cart.totalPrice;
    let discountAmount = 0;
    let appliedCouponCode = undefined;

    if (couponCode) {
        const couponValidation = await couponServices.validateCoupon(couponCode, cart.totalPrice);
        finalPrice = couponValidation.finalAmount;
        discountAmount = couponValidation.discountAmount;
        appliedCouponCode = couponValidation.code;
    }

    // Generate unique transaction ID
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const transactionId = `TXN-${Date.now()}-${randomSuffix}`;

    // Get current commission rate from settings
    const settings = await SettingsModel.findOne();
    const commissionRate = settings?.sellerCommissionRate ?? 10; // default 10%

    // Create pending order
    const orderItems = cart.items.map((item) => {
        const itemTotal = item.price * item.quantity;
        const adminCommission = Math.round((itemTotal * (commissionRate / 100)) * 100) / 100;
        const sellerEarnings = Math.round((itemTotal - adminCommission) * 100) / 100;

        return {
            product: item.product._id,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
            price: item.price,
            commissionRate,
            adminCommission,
            sellerEarnings,
        };
    });

    const order = await OrderModel.create({
        user: userId,
        items: orderItems,
        totalPrice: finalPrice,
        shippingAddress,
        couponCode: appliedCouponCode,
        discountAmount,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        transactionId,
    });

    // Log order placement
    activityServices.logActivity(
        userId,
        ActivityType.ORDER_PLACE,
        `Placed order with transaction ID ${transactionId} (Total: ${finalPrice} BDT)`
    );

    // Initiate payment via SSLCommerz
    const paymentUrl = await initiateSSLCommerzPayment({
        total_amount: finalPrice,
        tran_id: transactionId,
        cus_name: userContext.name,
        cus_email: userContext.email,
        cus_phone: shippingAddress.phone || userContext.phone || "01700000000",
        cus_add1: shippingAddress.street,
        cus_city: shippingAddress.city,
        cus_postcode: shippingAddress.zipCode,
        cus_country: shippingAddress.country,
        product_name: "Cart Checkout Purchase",
        product_category: "E-Commerce",
    });

    return { order, paymentUrl };
};

const handlePaymentSuccess = async (tran_id: string, val_id: string) => {
    // Validate transaction with SSLCommerz validator server
    const validationResult = await validateSSLCommerzPayment(val_id);
    if (!validationResult.isValid) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Payment validation failed");
    }

    const order = await OrderModel.findOne({ transactionId: tran_id });
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
    }

    if (order.paymentStatus === "PAID") {
        return order;
    }

    // Save payment details
    order.paymentDetails = {
        bankTranId: validationResult.bankTranId,
        cardType: validationResult.cardType,
        cardBrand: validationResult.cardBrand,
        cardIssuer: validationResult.cardIssuer,
        amount: validationResult.amount,
        paymentDate: validationResult.paymentDate,
        valId: val_id,
    };

    // Update payment status
    order.paymentStatus = "PAID";
    order.orderStatus = "PROCESSING";
    await order.save();

    // Increment coupon usage count if used
    if (order.couponCode) {
        await CouponModel.findOneAndUpdate(
            { code: order.couponCode },
            { $inc: { usageCount: 1 } }
        );
    }

    // Deduct stock levels and credit seller balances
    for (const item of order.items) {
        const product = await ProductModel.findById(item.product);
        if (product) {
            // Deduct stock (ensure stock doesn't go below 0)
            product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
            await product.save();

            // Credit seller balance (net earnings after site commission) if the product has a seller reference
            if (product.seller) {
                const commissionRate = item.commissionRate ?? 10;
                const defaultEarnings = (item.price * item.quantity) * (1 - commissionRate / 100);
                const netEarnings = Math.round((item.sellerEarnings ?? defaultEarnings) * 100) / 100;

                await UserModel.findByIdAndUpdate(product.seller, {
                    $inc: { balance: netEarnings },
                });
            }
        }
    }

    // Clear user's active shopping cart
    await CartModel.findOneAndUpdate({ user: order.user }, { $set: { items: [], totalPrice: 0 } });

    // Log payment success
    activityServices.logActivity(
        order.user.toString(),
        ActivityType.PAYMENT_SUCCESS,
        `Payment succeeded for transaction ID: ${tran_id}`
    );

    return order;
};

const handlePaymentFail = async (tran_id: string) => {
    const order = await OrderModel.findOneAndUpdate(
        { transactionId: tran_id },
        { $set: { paymentStatus: "FAILED", orderStatus: "CANCELLED" } },
        { new: true }
    );
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
    }

    // Log payment failure
    activityServices.logActivity(
        order.user.toString(),
        ActivityType.PAYMENT_FAIL,
        `Payment failed for transaction ID: ${tran_id}`
    );

    return order;
};

const handlePaymentCancel = async (tran_id: string) => {
    const order = await OrderModel.findOneAndUpdate(
        { transactionId: tran_id },
        { $set: { paymentStatus: "CANCELLED", orderStatus: "CANCELLED" } },
        { new: true }
    );
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
    }

    // Log payment cancellation
    activityServices.logActivity(
        order.user.toString(),
        ActivityType.PAYMENT_FAIL,
        `Payment cancelled for transaction ID: ${tran_id}`
    );

    return order;
};

const getMyOrders = async (userId: string) => {
    return await OrderModel.find({ user: userId })
        .populate({
            path: "items.product",
            select: "name slug images thumbnail price unit",
        })
        .sort({ createdAt: -1 });
};

const getOrderById = async (orderId: string, userId: string, userRole: string) => {
    const order = await OrderModel.findById(orderId).populate({
        path: "items.product",
        select: "name slug images thumbnail price unit seller",
    });

    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
    }

    // Authorization check
    if (order.user.toString() !== userId && !["SUPER_ADMIN", "ADMIN"].includes(userRole)) {
        throw new ApiError(httpStatus.FORBIDDEN, "You do not have access to this order details");
    }

    return order;
};

export const orderServices = {
    checkoutOrder,
    handlePaymentSuccess,
    handlePaymentFail,
    handlePaymentCancel,
    getMyOrders,
    getOrderById,
};
