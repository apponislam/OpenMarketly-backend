import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { categoryServices } from "./category.services";

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await categoryServices.createCategory(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Category created successfully",
        data: result,
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const query = {
        search: req.query.search as string | undefined,
        isActive: req.query.isActive as string | undefined,
        page: req.query.page as string | undefined,
        limit: req.query.limit as string | undefined,
    };

    const result = await categoryServices.getAllCategories(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Categories retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await categoryServices.getCategoryById(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category retrieved successfully",
        data: result,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await categoryServices.updateCategory(id as string, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category updated successfully",
        data: result,
    });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await categoryServices.deleteCategory(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category deleted successfully",
        data: result,
    });
});

const getParentCategories = catchAsync(async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await categoryServices.getParentCategories(page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Parent categories retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getSubcategories = catchAsync(async (req: Request, res: Response) => {
    const { parentId } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await categoryServices.getSubcategories(parentId as string, page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Subcategories retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

export const categoryControllers = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getParentCategories,
    getSubcategories,
};
