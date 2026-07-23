import mongoose, { Schema } from "mongoose";
import { IRecentlyViewed } from "./recentlyViewed.interface";

const recentlyViewedSchemaDefinition: any = {
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
    viewedAt: {
        type: Date,
        default: Date.now,
    },
};

const RecentlyViewedSchema = new Schema<IRecentlyViewed>(recentlyViewedSchemaDefinition, {
    timestamps: false,
    versionKey: false,
});

// Indexes for fast fetching and cleanup
RecentlyViewedSchema.index({ user: 1, product: 1 }, { unique: true });
RecentlyViewedSchema.index({ user: 1, viewedAt: -1 });

export const RecentlyViewedModel = mongoose.model<IRecentlyViewed>("RecentlyViewed", RecentlyViewedSchema);
