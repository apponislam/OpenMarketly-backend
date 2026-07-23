import { Types } from "mongoose";

export interface IRating {
    _id?: Types.ObjectId;
    product: Types.ObjectId;
    user: Types.ObjectId;
    rating: number;
    comment?: string;
    images?: string[];
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
