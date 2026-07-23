import mongoose, { Schema } from "mongoose";
import { IRating } from "./rating.interface";

const ratingSchemaDefinition: any = {
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product ID is required"],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: [1, "Rating must be at least 1 star"],
        max: [5, "Rating cannot exceed 5 stars"],
    },
    comment: {
        type: String,
        trim: true,
    },
    images: {
        type: [String],
        default: [],
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
};

const RatingSchema = new Schema<IRating>(ratingSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

// Enforce one rating per user per product
RatingSchema.index({ product: 1, user: 1 }, { unique: true });
RatingSchema.index({ product: 1, isDeleted: 1 });
RatingSchema.index({ user: 1, isDeleted: 1 });

export const RatingModel = mongoose.model<IRating>("Rating", RatingSchema);
