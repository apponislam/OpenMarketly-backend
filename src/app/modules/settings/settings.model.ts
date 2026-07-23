import mongoose, { Schema } from "mongoose";
import { ISiteSettings } from "./settings.interface";

const socialLinksSchema = new Schema(
    {
        facebook: String,
        twitter: String,
        instagram: String,
        youtube: String,
        linkedin: String,
        tiktok: String,
    },
    { _id: false }
);

const settingsSchemaDefinition: any = {
    // Contact
    contactEmail: {
        type: String,
        trim: true,
        lowercase: true,
    },
    contactPhone: {
        type: String,
        trim: true,
    },
    contactAddress: {
        type: String,
        trim: true,
    },

    // Social
    socialLinks: {
        type: socialLinksSchema,
        default: {},
    },

    // Feature Flags
    isMaintenanceMode: {
        type: Boolean,
        default: false,
    },
    maintenanceMessage: {
        type: String,
        default: "We are currently under maintenance. Please check back later.",
        trim: true,
    },
    allowGuestCheckout: {
        type: Boolean,
        default: false,
    },
    allowSellerRegistration: {
        type: Boolean,
        default: true,
    },
    sellerCommissionRate: {
        type: Number,
        default: 10, // 10% default commission
    },
};

const SettingsSchema = new Schema<ISiteSettings>(settingsSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

export const SettingsModel = mongoose.model<ISiteSettings>("Settings", SettingsSchema);
