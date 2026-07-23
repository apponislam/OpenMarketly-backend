import { Types } from "mongoose";

export interface IWishlist {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    product: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
