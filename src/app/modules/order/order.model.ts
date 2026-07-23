import mongoose, { Schema } from "mongoose";
import { IOrder, IOrderItem, IShippingAddress } from "./order.interface";

const orderItemSchema = new Schema<IOrderItem>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product ID is required"],
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity cannot be less than 1"],
        },
        color: String,
        size: String,
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
    },
    { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
    {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: String,
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true },
    },
    { _id: false }
);

const orderSchemaDefinition: any = {
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
    },
    items: {
        type: [orderItemSchema],
        required: [true, "Order items are required"],
    },
    totalPrice: {
        type: Number,
        required: [true, "Total price is required"],
        min: [0, "Total price cannot be negative"],
    },
    shippingAddress: {
        type: shippingAddressSchema,
        required: [true, "Shipping address is required"],
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
        default: "PENDING",
    },
    orderStatus: {
        type: String,
        enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
        default: "PENDING",
    },
    transactionId: {
        type: String,
        required: [true, "Transaction ID is required"],
        unique: true,
    },
    paymentDetails: {
        bankTranId: String,
        cardType: String,
        cardBrand: String,
        cardIssuer: String,
        amount: Number,
        paymentDate: String,
        valId: String,
    },
};

const OrderSchema = new Schema<IOrder>(orderSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ transactionId: 1 }, { unique: true });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ orderStatus: 1 });

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
