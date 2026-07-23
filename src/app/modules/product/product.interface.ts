import { Types } from "mongoose";

export interface IProductVariant {
    color?: string;
    size?: string;
    sku?: string;
    price?: number;
    stockQuantity?: number;
    image?: string;
}

export interface IProductSpecification {
    key: string;
    value: string;
}

export interface IProduct {
    _id?: Types.ObjectId;
    name: string;
    slug: string;
    sku?: string;
    brand?: string;
    category: Types.ObjectId;
    seller: Types.ObjectId;

    description: string;
    shortDescription?: string;
    specifications?: IProductSpecification[];

    price: number;
    originalPrice?: number;
    discountPercentage?: number;

    stockQuantity: number;
    colors?: string[];
    sizes?: string[];
    variants?: IProductVariant[];

    images?: string[];
    thumbnail?: string;

    unit?: string;
    weight?: string;
    dimensions?: string;

    warranty?: string;
    returnPolicy?: string;

    tags?: string[];
    ratings?: number;
    totalReviews?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
