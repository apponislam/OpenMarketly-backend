import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { IProduct } from "./product.interface";
import { ProductModel } from "./product.model";
import { CategoryModel } from "../category/category.model";

export interface IProductQuery {
    search?: string;
    category?: string;
    brand?: string;
    color?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: string;
    sellerId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
}

const createProduct = async (sellerId: string, data: Partial<IProduct>) => {
    if (!data.name || !data.description || data.price === undefined || !data.category) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Name, description, price, and category are required");
    }

    // Verify category exists
    const category = await CategoryModel.findOne({ _id: data.category, isDeleted: false });
    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }

    const productData = {
        ...data,
        seller: sellerId,
    };

    const product = await ProductModel.create(productData);
    return await product.populate([
        { path: "category", select: "name slug" },
        { path: "seller", select: "name email phone profileImage" },
    ]);
};

const getAllProducts = async (query: IProductQuery) => {
    const filter: any = { isDeleted: false, isActive: true };

    if (query.search) {
        filter.$or = [
            { name: { $regex: query.search, $options: "i" } },
            { description: { $regex: query.search, $options: "i" } },
            { brand: { $regex: query.search, $options: "i" } },
            { tags: { $in: [new RegExp(query.search, "i")] } },
        ];
    }

    if (query.category) {
        filter.category = query.category;
    }

    if (query.brand) {
        filter.brand = { $regex: query.brand, $options: "i" };
    }

    if (query.color) {
        filter.$or = filter.$or || [];
        filter.$or.push(
            { colors: { $in: [new RegExp(query.color, "i")] } },
            { "variants.color": { $regex: query.color, $options: "i" } }
        );
    }

    if (query.size) {
        filter.$or = filter.$or || [];
        filter.$or.push(
            { sizes: { $in: [new RegExp(query.size, "i")] } },
            { "variants.size": { $regex: query.size, $options: "i" } }
        );
    }

    if (query.sellerId) {
        filter.seller = query.sellerId;
    }

    if (query.isFeatured !== undefined) {
        filter.isFeatured = query.isFeatured === "true";
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        filter.price = {};
        if (query.minPrice !== undefined) filter.price.$gte = Number(query.minPrice);
        if (query.maxPrice !== undefined) filter.price.$lte = Number(query.maxPrice);
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const sort: any = {};
    if (query.sortBy) {
        sort[query.sortBy] = query.sortOrder === "asc" ? 1 : -1;
    } else {
        sort.createdAt = -1;
    }

    const products = await ProductModel.find(filter)
        .populate("category", "name slug")
        .populate("seller", "name email profileImage")
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const total = await ProductModel.countDocuments(filter);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
        data: products,
    };
};

const getProductById = async (id: string) => {
    const product = await ProductModel.findOne({ _id: id, isDeleted: false })
        .populate("category", "name slug description")
        .populate("seller", "name email phone profileImage");

    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    return product;
};

const getProductBySlug = async (slug: string) => {
    const product = await ProductModel.findOne({ slug, isDeleted: false })
        .populate("category", "name slug description")
        .populate("seller", "name email phone profileImage");

    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    return product;
};

const getMyProducts = async (sellerId: string) => {
    return await ProductModel.find({ seller: sellerId, isDeleted: false })
        .populate("category", "name slug")
        .sort({ createdAt: -1 });
};

const updateProduct = async (id: string, sellerId: string, userRole: string, data: Partial<IProduct>) => {
    const existing = await ProductModel.findOne({ _id: id, isDeleted: false });
    if (!existing) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    // Permission check: only seller or admin can update product
    if (existing.seller.toString() !== sellerId && !["SUPER_ADMIN", "ADMIN"].includes(userRole)) {
        throw new ApiError(httpStatus.FORBIDDEN, "You do not have permission to update this product");
    }

    if (data.category) {
        const category = await CategoryModel.findOne({ _id: data.category, isDeleted: false });
        if (!category) {
            throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
        }
    }

    const updatedProduct = await ProductModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: data },
        { new: true, runValidators: true }
    )
        .populate("category", "name slug")
        .populate("seller", "name email profileImage");

    return updatedProduct;
};

const deleteProduct = async (id: string, sellerId: string, userRole: string) => {
    const existing = await ProductModel.findOne({ _id: id, isDeleted: false });
    if (!existing) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    // Permission check: only seller or admin can delete product
    if (existing.seller.toString() !== sellerId && !["SUPER_ADMIN", "ADMIN"].includes(userRole)) {
        throw new ApiError(httpStatus.FORBIDDEN, "You do not have permission to delete this product");
    }

    const deletedProduct = await ProductModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true } },
        { new: true }
    );

    return deletedProduct;
};

export const productServices = {
    createProduct,
    getAllProducts,
    getProductById,
    getProductBySlug,
    getMyProducts,
    updateProduct,
    deleteProduct,
};
