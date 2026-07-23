import mongoose, { Schema } from "mongoose";
import { IFavorite } from "./favorite.interface";

const favoriteSchemaDefinition: any = {
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product ID is required"],
    },
};

const FavoriteSchema = new Schema<IFavorite>(favoriteSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

// Compound index to prevent duplicate favorites per user
FavoriteSchema.index({ user: 1, product: 1 }, { unique: true });
FavoriteSchema.index({ user: 1 });

export const FavoriteModel = mongoose.model<IFavorite>("Favorite", FavoriteSchema);
