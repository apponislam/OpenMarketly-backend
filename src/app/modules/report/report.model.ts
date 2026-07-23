import mongoose, { Schema } from "mongoose";
import { IReport } from "./report.interface";

const reportSchemaDefinition: any = {
    reporter: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Reporter ID is required"],
    },
    type: {
        type: String,
        enum: ["PRODUCT", "USER"],
        required: [true, "Report type is required"],
    },
    reportedProduct: {
        type: Schema.Types.ObjectId,
        ref: "Product",
    },
    reportedUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    reason: {
        type: String,
        required: [true, "Reason is required"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Detailed description is required"],
        trim: true,
    },
    images: {
        type: [String],
        default: [],
    },
    status: {
        type: String,
        enum: ["PENDING", "UNDER_INVESTIGATION", "RESOLVED", "DISMISSED"],
        default: "PENDING",
    },
    adminNote: {
        type: String,
        trim: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
};

const ReportSchema = new Schema<IReport>(reportSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

ReportSchema.index({ reporter: 1, type: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ reportedProduct: 1 });
ReportSchema.index({ reportedUser: 1 });

export const ReportModel = mongoose.model<IReport>("Report", ReportSchema);
