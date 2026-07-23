import mongoose, { Schema } from "mongoose";
import { IPolicy } from "./policy.interface";

const policySchemaDefinition: any = {
    type: {
        type: String,
        enum: [
            "PRIVACY_POLICY",
            "TERMS_AND_CONDITIONS",
            "RETURN_POLICY",
            "REFUND_POLICY",
            "SHIPPING_POLICY",
            "ABOUT_US",
        ],
        required: [true, "Policy type is required"],
        unique: true,
    },
    title: {
        type: String,
        required: [true, "Policy title is required"],
        trim: true,
    },
    content: {
        type: String,
        required: [true, "Policy content is required"],
    },
    version: {
        type: String,
        default: "1.0",
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
};

const PolicySchema = new Schema<IPolicy>(policySchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

PolicySchema.index({ type: 1, isDeleted: 1 });
PolicySchema.index({ isPublished: 1, isDeleted: 1 });

export const PolicyModel = mongoose.model<IPolicy>("Policy", PolicySchema);
