import { Types } from "mongoose";

export type PolicyType =
    | "PRIVACY_POLICY"
    | "TERMS_AND_CONDITIONS"
    | "RETURN_POLICY"
    | "REFUND_POLICY"
    | "SHIPPING_POLICY"
    | "ABOUT_US";

export interface IPolicy {
    _id?: Types.ObjectId;
    type: PolicyType;
    title: string;
    content: string;
    version?: string;
    isPublished?: boolean;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
