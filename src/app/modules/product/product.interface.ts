import { Types } from "mongoose";

export type ProductStatus = "IN_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED";

export interface IProduct {
    _id?: Types.ObjectId;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;
    price: number;
    discountPrice?: number;
    category: Types.ObjectId;
    seller: Types.ObjectId;
    images?: string[];
    thumbnail?: string;
    stockQuantity: number;
    unit?: string;
    status?: ProductStatus;
    tags?: string[];
    ratings?: number;
    totalReviews?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
