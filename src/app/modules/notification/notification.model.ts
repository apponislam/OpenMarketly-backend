import mongoose, { Schema } from "mongoose";
import { INotification } from "./notification.interface";

const notificationSchemaDefinition: any = {
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
    },
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true,
    },
    type: {
        type: String,
        enum: ["ORDER", "PAYMENT", "WITHDRAW", "SYSTEM"],
        required: [true, "Notification type is required"],
    },
    isRead: {
        type: Boolean,
        default: false,
    },
};

const NotificationSchema = new Schema<INotification>(notificationSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

// Indexes for high performance lookup
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);
