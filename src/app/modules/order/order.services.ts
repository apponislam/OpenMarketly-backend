import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { OrderModel } from "./order.model";
import { CartModel } from "../cart/cart.model";
import { ProductModel } from "../product/product.model";
import { IShippingAddress } from "./order.interface";
import { initiateSSLCommerzPayment, validateSSLCommerzPayment } from "./sslcommerz.utils";

const checkoutOrder = async (
    userId: string,
    shippingAddress: IShippingAddress,
    userContext: { name: string; email: string; phone?: string }
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

    // Generate unique transaction ID
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const transactionId = `TXN-${Date.now()}-${randomSuffix}`;

    // Create pending order
    const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        price: item.price,
    }));

    const order = await OrderModel.create({
        user: userId,
        items: orderItems,
        totalPrice: cart.totalPrice,
        shippingAddress,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        transactionId,
    });

    // Initiate payment via SSLCommerz
    const paymentUrl = await initiateSSLCommerzPayment({
        total_amount: cart.totalPrice,
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
    const isValid = await validateSSLCommerzPayment(val_id);
    if (!isValid) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Payment validation failed");
    }

    const order = await OrderModel.findOne({ transactionId: tran_id });
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
    }

    if (order.paymentStatus === "PAID") {
        return order;
    }

    // Update payment status
    order.paymentStatus = "PAID";
    order.orderStatus = "PROCESSING";
    await order.save();

    // Deduct stock levels for purchased products
    for (const item of order.items) {
        await ProductModel.findByIdAndUpdate(item.product, {
            $inc: { stockQuantity: -item.quantity },
        });
    }

    // Clear user's active shopping cart
    await CartModel.findOneAndUpdate({ user: order.user }, { $set: { items: [], totalPrice: 0 } });

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
    if (order.user.toString() !== userId && userRole !== "ADMIN") {
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
