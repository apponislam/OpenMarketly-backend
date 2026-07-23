import { Types } from "mongoose";

export interface ICategory {
    _id?: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentCategory?: Types.ObjectId;
    isActive?: boolean;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
