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

const getAllCategories = async (query: { search?: string; isActive?: string }) => {
    const filter: any = { isDeleted: false };

    if (query.isActive !== undefined) {
        filter.isActive = query.isActive === "true";
    } else {
        filter.isActive = true;
    }

    if (query.search) {
        filter.name = { $regex: query.search, $options: "i" };
    }

    return await CategoryModel.find(filter).populate("parentCategory", "name slug").sort({ createdAt: -1 });
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

export const categoryServices = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
