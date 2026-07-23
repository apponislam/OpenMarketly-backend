import mongoose, { Schema } from "mongoose";
import { IWishlist } from "./wishlist.interface";

const wishlistSchemaDefinition: any = {
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product is required"],
    },
};

const WishlistSchema = new Schema<IWishlist>(wishlistSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

// Ensure a user can only add a product to their wishlist once
WishlistSchema.index({ user: 1, product: 1 }, { unique: true });

export const WishlistModel = mongoose.model<IWishlist>("Wishlist", WishlistSchema);
