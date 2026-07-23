import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { CartModel } from "./cart.model";
import { ProductModel } from "../product/product.model";
import { ICartItem } from "./cart.interface";
import { activityServices } from "../activity/activity.services";
import { ActivityType } from "../activity/activity.interface";

export interface IAddToCartPayload {
    productId: string;
    quantity?: number;
    color?: string;
    size?: string;
}

const addToCart = async (userId: string, payload: IAddToCartPayload) => {
    const { productId, color, size } = payload;
    const quantity = payload.quantity && payload.quantity > 0 ? payload.quantity : 1;

    if (!productId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Product ID is required");
    }

    // Verify product exists and has stock
    const product = await ProductModel.findOne({ _id: productId, isDeleted: false, isActive: true });
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found or unavailable");
    }

    if (product.stockQuantity < quantity) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Only ${product.stockQuantity} items in stock`);
    }

    // Determine unit price (use discount price if present)
    const unitPrice = product.discountPercentage
        ? Math.round((product.price * (1 - product.discountPercentage / 100)) * 100) / 100
        : product.price;

    let cart = await CartModel.findOne({ user: userId });

    if (!cart) {
        cart = new CartModel({
            user: userId,
            items: [],
            totalPrice: 0,
        });
    }

    // Check if matching item (same product, color, size) is already in cart
    const existingIndex = cart.items.findIndex(
        (item) =>
            item.product.toString() === productId &&
            (item.color || "") === (color || "") &&
            (item.size || "") === (size || "")
    );

    if (existingIndex > -1) {
        const newQty = cart.items[existingIndex].quantity + quantity;
        if (product.stockQuantity < newQty) {
            throw new ApiError(httpStatus.BAD_REQUEST, `Cannot add more. Max stock available: ${product.stockQuantity}`);
        }
        cart.items[existingIndex].quantity = newQty;
        cart.items[existingIndex].price = unitPrice;
    } else {
        cart.items.push({
            product: product._id,
            quantity,
            color,
            size,
            price: unitPrice,
        } as ICartItem);
    }

    await cart.save();

    // Log cart sync/add activity
    activityServices.logActivity(
        userId,
        ActivityType.CART_SYNC,
        `Added item: ${product.name} to cart`
    );

    return await cart.populate({
        path: "items.product",
        select: "name slug price discountPercentage images thumbnail category seller stockQuantity",
        populate: [
            { path: "category", select: "name slug" },
            { path: "seller", select: "name email profileImage" },
        ],
    });
};

const updateCartItemQuantity = async (userId: string, payload: { productId: string; quantity: number; color?: string; size?: string }) => {
    const { productId, quantity, color, size } = payload;

    if (!productId || quantity === undefined) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Product ID and quantity are required");
    }

    const cart = await CartModel.findOne({ user: userId });
    if (!cart) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(
        (item) =>
            item.product.toString() === productId &&
            (item.color || "") === (color || "") &&
            (item.size || "") === (size || "")
    );

    if (itemIndex === -1) {
        throw new ApiError(httpStatus.NOT_FOUND, "Item not found in cart");
    }

    if (quantity <= 0) {
        // Remove item if quantity set to 0 or negative
        cart.items.splice(itemIndex, 1);
    } else {
        // Verify stock limit
        const product = await ProductModel.findOne({ _id: productId, isDeleted: false });
        if (product && product.stockQuantity < quantity) {
            throw new ApiError(httpStatus.BAD_REQUEST, `Max stock available: ${product.stockQuantity}`);
        }
        cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    return await cart.populate({
        path: "items.product",
        select: "name slug price discountPercentage images thumbnail category seller stockQuantity",
    });
};

const removeFromCart = async (userId: string, productId: string, color?: string, size?: string) => {
    const cart = await CartModel.findOne({ user: userId });
    if (!cart) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");
    }

    cart.items = cart.items.filter(
        (item) =>
            !(
                item.product.toString() === productId &&
                (color ? item.color === color : true) &&
                (size ? item.size === size : true)
            )
    );

    await cart.save();

    return await cart.populate({
        path: "items.product",
        select: "name slug price discountPercentage images thumbnail category seller stockQuantity",
    });
};

const getMyCart = async (userId: string) => {
    let cart = await CartModel.findOne({ user: userId }).populate({
        path: "items.product",
        select: "name slug price discountPercentage images thumbnail category seller stockQuantity unit",
        populate: [
            { path: "category", select: "name slug" },
            { path: "seller", select: "name email profileImage" },
        ],
    });

    if (!cart) {
        cart = await CartModel.create({ user: userId, items: [], totalPrice: 0 });
    }

    return cart;
};

const clearCart = async (userId: string) => {
    const cart = await CartModel.findOneAndUpdate(
        { user: userId },
        { $set: { items: [], totalPrice: 0 } },
        { new: true }
    );

    // Log cart clear activity
    activityServices.logActivity(
        userId,
        ActivityType.CART_CLEAR,
        "Cleared shopping cart"
    );

    return cart;
};

export const cartServices = {
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    getMyCart,
    clearCart,
};
