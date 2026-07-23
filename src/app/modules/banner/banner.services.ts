import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { IBanner } from "./banner.interface";
import { BannerModel } from "./banner.model";

const createBanner = async (data: Partial<IBanner>) => {
    if (!data.title || !data.image) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Title and image are required");
    }

    const banner = await BannerModel.create(data);
    return banner;
};

const getAllBanners = async (isAdmin: boolean, query: any) => {
    const filter: any = { isDeleted: false };

    // Public users only see active & currently scheduled banners
    if (!isAdmin) {
        filter.isActive = true;
        const now = new Date();
        filter.$or = [
            { startDate: { $exists: false }, endDate: { $exists: false } },
            { startDate: null, endDate: null },
            { startDate: { $lte: now }, endDate: { $gte: now } },
            { startDate: { $lte: now }, endDate: null },
            { startDate: null, endDate: { $gte: now } },
        ];
    }

    if (query.type) {
        filter.type = query.type;
    }

    if (query.position) {
        filter.position = query.position;
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const banners = await BannerModel.find(filter)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await BannerModel.countDocuments(filter);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
        data: banners,
    };
};

const getBannerById = async (id: string) => {
    const banner = await BannerModel.findOne({ _id: id, isDeleted: false });

    if (!banner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Banner not found");
    }

    return banner;
};

const updateBanner = async (id: string, data: Partial<IBanner>) => {
    const existing = await BannerModel.findOne({ _id: id, isDeleted: false });
    if (!existing) {
        throw new ApiError(httpStatus.NOT_FOUND, "Banner not found");
    }

    const updatedBanner = await BannerModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: data },
        { new: true, runValidators: true }
    );

    return updatedBanner;
};

const deleteBanner = async (id: string) => {
    const existing = await BannerModel.findOne({ _id: id, isDeleted: false });
    if (!existing) {
        throw new ApiError(httpStatus.NOT_FOUND, "Banner not found");
    }

    const deletedBanner = await BannerModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true } },
        { new: true }
    );

    return deletedBanner;
};

export const bannerServices = {
    createBanner,
    getAllBanners,
    getBannerById,
    updateBanner,
    deleteBanner,
};
