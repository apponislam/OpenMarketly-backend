import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { ICategory } from "./category.interface";
import { CategoryModel } from "./category.model";

const createCategory = async (data: Partial<ICategory>) => {
    if (!data.name) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Category name is required");
    }

    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const existing = await CategoryModel.findOne({ slug, isDeleted: false });
    if (existing) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Category with this name or slug already exists");
    }

    const categoryData = {
        ...data,
        slug,
    };

    return await CategoryModel.create(categoryData);
};

const getAllCategories = async (query: { search?: string; isActive?: string; page?: string; limit?: string }) => {
    const filter: any = { isDeleted: false };

    if (query.isActive !== undefined) {
        filter.isActive = query.isActive === "true";
    } else {
        filter.isActive = true;
    }

    if (query.search) {
        filter.name = { $regex: query.search, $options: "i" };
    }

    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const categories = await CategoryModel.find(filter)
        .populate("parentCategory", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await CategoryModel.countDocuments(filter);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
        data: categories,
    };
};

const getCategoryById = async (id: string) => {
    const category = await CategoryModel.findOne({ _id: id, isDeleted: false }).populate("parentCategory", "name slug");
    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }
    return category;
};

const updateCategory = async (id: string, data: Partial<ICategory>) => {
    if (data.name && !data.slug) {
        data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }

    if (data.slug) {
        const existing = await CategoryModel.findOne({ slug: data.slug, _id: { $ne: id }, isDeleted: false });
        if (existing) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Category slug already in use");
        }
    }

    const category = await CategoryModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: data },
        { new: true, runValidators: true }
    );

    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }

    return category;
};

const deleteCategory = async (id: string) => {
    const category = await CategoryModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true } },
        { new: true }
    );

    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }

    return category;
};

const getParentCategories = async (page = 1, limit = 10) => {
    const filter = {
        isDeleted: false,
        isActive: true,
        $or: [
            { parentCategory: { $exists: false } },
            { parentCategory: null },
        ],
    };

    const skip = (page - 1) * limit;

    const categories = await CategoryModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await CategoryModel.countDocuments(filter);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
        data: categories,
    };
};

const getSubcategories = async (parentId: string, page = 1, limit = 10) => {
    const filter = {
        parentCategory: parentId,
        isDeleted: false,
        isActive: true,
    };

    const skip = (page - 1) * limit;

    const categories = await CategoryModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await CategoryModel.countDocuments(filter);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
        data: categories,
    };
};

export const categoryServices = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getParentCategories,
    getSubcategories,
};
