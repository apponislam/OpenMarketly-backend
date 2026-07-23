import { Types } from "mongoose";

export interface IRecentlyViewed {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    product: Types.ObjectId;
    viewedAt: Date;
}
