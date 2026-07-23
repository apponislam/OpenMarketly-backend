import { Types } from "mongoose";

export interface IActivityLog {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    action: string;      // e.g., "LOGIN", "LOGOUT", "PRODUCT_CREATE", "PROFILE_UPDATE"
    details?: string;    // Extra description
    ipAddress?: string;
    userAgent?: string;
    createdAt?: Date;
}
