import mongoose, { Schema } from "mongoose";
import { IActivityLog } from "./activity.interface";

const activityLogSchemaDefinition: any = {
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    action: {
        type: String,
        required: [true, "Action is required"],
        trim: true,
    },
    details: {
        type: String,
        trim: true,
    },
    ipAddress: {
        type: String,
        trim: true,
    },
    userAgent: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
};

const ActivityLogSchema = new Schema<IActivityLog>(activityLogSchemaDefinition, {
    timestamps: false,
    versionKey: false,
});

// Indexes for analytical fetching
ActivityLogSchema.index({ user: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });

export const ActivityLogModel = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
