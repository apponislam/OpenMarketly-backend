import { Types } from "mongoose";

export enum ActivityType {
    // Auth & Profile
    REGISTER = "REGISTER",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    PASSWORD_CHANGE = "PASSWORD_CHANGE",
    PROFILE_UPDATE = "PROFILE_UPDATE",

    // Product
    PRODUCT_CREATE = "PRODUCT_CREATE",
    PRODUCT_UPDATE = "PRODUCT_UPDATE",
    PRODUCT_DELETE = "PRODUCT_DELETE",

    // Category
    CATEGORY_CREATE = "CATEGORY_CREATE",
    CATEGORY_UPDATE = "CATEGORY_UPDATE",
    CATEGORY_DELETE = "CATEGORY_DELETE",

    // Orders & Transactions
    ORDER_PLACE = "ORDER_PLACE",
    ORDER_STATUS_UPDATE = "ORDER_STATUS_UPDATE",
    PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
    PAYMENT_FAIL = "PAYMENT_FAIL",

    // Wishlist
    WISHLIST_ADD = "WISHLIST_ADD",
    WISHLIST_REMOVE = "WISHLIST_REMOVE",

    // Cart
    CART_SYNC = "CART_SYNC",
    CART_CLEAR = "CART_CLEAR",

    // Coupons
    COUPON_CREATE = "COUPON_CREATE",
    COUPON_UPDATE = "COUPON_UPDATE",
    COUPON_DELETE = "COUPON_DELETE",

    // Disputes & Reports
    DISPUTE_CREATE = "DISPUTE_CREATE",
    DISPUTE_RESOLVE = "DISPUTE_RESOLVE",
    REPORT_CREATE = "REPORT_CREATE",
    REPORT_ACTION = "REPORT_ACTION",

    // FAQ & Policy & Settings
    FAQ_CREATE = "FAQ_CREATE",
    FAQ_UPDATE = "FAQ_UPDATE",
    FAQ_DELETE = "FAQ_DELETE",
    POLICY_UPDATE = "POLICY_UPDATE",
    SETTINGS_UPDATE = "SETTINGS_UPDATE",
}

export interface IActivityLog {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    action: ActivityType | string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt?: Date;
}
