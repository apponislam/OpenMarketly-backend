import { Types } from "mongoose";

export interface IOrderItem {
    product: Types.ObjectId;
    quantity: number;
    color?: string;
    size?: string;
    price: number;
}

export interface IShippingAddress {
    street: string;
    city: string;
    state?: string;
    zipCode: string;
    country: string;
    phone: string;
}

export interface IOrder {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    items: IOrderItem[];
    totalPrice: number;
    shippingAddress: IShippingAddress;
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
    orderStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    transactionId: string;
    couponCode?: string;
    discountAmount?: number;
    paymentDetails?: {
        bankTranId?: string;
        cardType?: string;
        cardBrand?: string;
        cardIssuer?: string;
        amount?: number;
        paymentDate?: string;
        valId?: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
}
