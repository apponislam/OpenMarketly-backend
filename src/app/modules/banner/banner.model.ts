import mongoose, { Schema } from "mongoose";
import { IBanner } from "./banner.interface";

const bannerSchemaDefinition: any = {
    title: {
        type: String,
        required: [true, "Banner title is required"],
        trim: true,
    },
    subtitle: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
        required: [true, "Banner image is required"],
    },
    link: {
        type: String,
        trim: true,
    },
    type: {
        type: String,
        enum: ["HERO", "PROMO", "CATEGORY", "SIDEBAR", "POPUP"],
        default: "HERO",
    },
    position: {
        type: String,
        enum: ["TOP", "MIDDLE", "BOTTOM"],
        default: "TOP",
    },
    sortOrder: {
        type: Number,
        default: 0,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
};

const BannerSchema = new Schema<IBanner>(bannerSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

// Indexes
BannerSchema.index({ type: 1, isActive: 1, isDeleted: 1 });
BannerSchema.index({ position: 1, sortOrder: 1 });

export const BannerModel = mongoose.model<IBanner>("Banner", BannerSchema);
