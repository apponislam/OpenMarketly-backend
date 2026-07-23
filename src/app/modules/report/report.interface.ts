import { Types } from "mongoose";

export type ReportType = "PRODUCT" | "USER";
export type ReportStatus = "PENDING" | "UNDER_INVESTIGATION" | "RESOLVED" | "DISMISSED";

export interface IReport {
    _id?: Types.ObjectId;
    reporter: Types.ObjectId;
    type: ReportType;
    reportedProduct?: Types.ObjectId;
    reportedUser?: Types.ObjectId;
    reason: string;
    description: string;
    images?: string[];
    status?: ReportStatus;
    adminNote?: string;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
