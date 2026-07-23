import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { productServices } from "./product.services";

const createProduct = catchAsync(async (req: Request, res: Response) => {
    const sellerId = req.user._id;
    const result = await productServices.createProduct(sellerId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Product created successfully",
        data: result,
    });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
    const query = {
        search: req.query.search as string | undefined,
        category: req.query.category as string | undefined,
        brand: req.query.brand as string | undefined,
        color: req.query.color as string | undefined,
        size: req.query.size as string | undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        isFeatured: req.query.isFeatured as string | undefined,
        isTodayDeal: req.query.isTodayDeal as string | undefined,
        isTrending: req.query.isTrending as string | undefined,
        isApproved: req.query.isApproved as string | undefined,
        sellerId: req.query.sellerId as string | undefined,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await productServices.getAllProducts(query, req.user?._id as string | undefined, req.user?.role as string | undefined);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Products retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getProductById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await productServices.getProductById(id as string, req.user?._id as string | undefined, req.user?.role as string | undefined);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product retrieved successfully",
        data: result,
    });
});

const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const result = await productServices.getProductBySlug(slug as string, req.user?._id as string | undefined, req.user?.role as string | undefined);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product retrieved successfully",
        data: result,
    });
});

const getMyProducts = catchAsync(async (req: Request, res: Response) => {
    const sellerId = req.user._id;
    const result = await productServices.getMyProducts(sellerId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My products retrieved successfully",
        data: result,
    });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const sellerId = req.user._id;
    const userRole = req.user.role;

    const result = await productServices.updateProduct(id as string, sellerId, userRole, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product updated successfully",
        data: result,
    });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const sellerId = req.user._id;
    const userRole = req.user.role;

    const result = await productServices.deleteProduct(id as string, sellerId, userRole);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product deleted successfully",
        data: result,
    });
});

const approveProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isApproved } = req.body;
    const adminId = req.user._id;

    const result = await productServices.approveProduct(id as string, isApproved, adminId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Product ${isApproved ? "approved" : "rejected"} successfully`,
        data: result,
    });
});

export const productControllers = {
    createProduct,
    getAllProducts,
    getProductById,
    getProductBySlug,
    getMyProducts,
    updateProduct,
    deleteProduct,
    approveProduct,
};
