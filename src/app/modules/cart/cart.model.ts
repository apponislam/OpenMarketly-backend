import mongoose, { Schema } from "mongoose";
import { ICart, ICartItem } from "./cart.interface";

const cartItemSchema = new Schema<ICartItem>(
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
            default: 1,
        },
        color: {
            type: String,
        },
        size: {
            type: String,
        },
        price: {
            type: Number,
            required: [true, "Item price is required"],
            min: [0, "Price cannot be negative"],
        },
    },
    { _id: false },
);

const cartSchemaDefinition: any = {
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        unique: true,
    },
    items: {
        type: [cartItemSchema],
        default: [],
    },
    totalPrice: {
        type: Number,
        default: 0,
    },
};

const CartSchema = new Schema<ICart>(cartSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

// Calculate totalPrice before save
CartSchema.pre("save", function () {
    this.totalPrice = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.totalPrice = Math.round(this.totalPrice * 100) / 100;
});

// CartSchema.index({ user: 1 }, { unique: true });

export const CartModel = mongoose.model<ICart>("Cart", CartSchema);
