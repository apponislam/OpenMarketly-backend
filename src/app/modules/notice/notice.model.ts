import mongoose, { Schema } from "mongoose";
import { INotice } from "./notice.interface";

const noticeSchemaDefinition: any = {
    title: {
        type: String,
        required: [true, "Notice title is required"],
        trim: true,
    },
    type: {
        type: String,
        enum: ["TEXT", "IMAGE"],
        required: [true, "Notice type is required"],
    },
    text: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
        trim: true,
    },
    redirectUrl: {
        type: String,
        trim: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
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

const NoticeSchema = new Schema<INotice>(noticeSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

// Indexes
NoticeSchema.index({ isDeleted: 1, isActive: 1, isDefault: 1 });
NoticeSchema.index({ isDeleted: 1, type: 1 });
NoticeSchema.index({ isDeleted: 1, isActive: 1, createdAt: -1 });

export const NoticeModel = mongoose.model<INotice>("Notice", NoticeSchema);
