import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { INotice } from "./notice.interface";
import { NoticeModel } from "./notice.model";

const createNotice = async (data: Partial<INotice>) => {
    if (!data.title || !data.type) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Title and type are required");
    }

    if (data.type === "TEXT" && !data.text) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Text content is required for TEXT notices");
    }

    if (data.type === "IMAGE" && !data.image) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Image URL is required for IMAGE notices");
    }

    if (data.isDefault) {
        // Reset default status of all other notices
        await NoticeModel.updateMany({}, { $set: { isDefault: false } });
    }

    const notice = await NoticeModel.create(data);
    return notice;
};

const getAllNotices = async (isAdmin: boolean, query: any) => {
    const filter: any = { isDeleted: false };

    if (!isAdmin) {
        filter.isActive = true;
    }

    if (query.type) {
        filter.type = query.type;
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const notices = await NoticeModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await NoticeModel.countDocuments(filter);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
        data: notices,
    };
};

const getNoticeById = async (id: string) => {
    const notice = await NoticeModel.findOne({ _id: id, isDeleted: false });

    if (!notice) {
        throw new ApiError(httpStatus.NOT_FOUND, "Notice not found");
    }

    return notice;
};

const getDefaultNotice = async (seen: boolean) => {
    if (seen) {
        return null;
    }
    try {
        // Find the default active notice
        const notice = await NoticeModel.findOne({
            isDefault: true,
            isActive: true,
            isDeleted: false,
        });

        return notice;
    } catch (error) {
        return null;
    }
};

const updateNotice = async (id: string, data: Partial<INotice>) => {
    const existing = await NoticeModel.findOne({ _id: id, isDeleted: false });
    if (!existing) {
        throw new ApiError(httpStatus.NOT_FOUND, "Notice not found");
    }

    if (data.isDefault) {
        // Reset default status of all other notices
        await NoticeModel.updateMany({ _id: { $ne: id } }, { $set: { isDefault: false } });
    }

    const updatedNotice = await NoticeModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: data },
        { returnDocument: 'after', runValidators: true }
    );

    return updatedNotice;
};

const deleteNotice = async (id: string) => {
    const existing = await NoticeModel.findOne({ _id: id, isDeleted: false });
    if (!existing) {
        throw new ApiError(httpStatus.NOT_FOUND, "Notice not found");
    }

    const deletedNotice = await NoticeModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true } },
        { returnDocument: 'after' }
    );

    return deletedNotice;
};

export const noticeServices = {
    createNotice,
    getAllNotices,
    getNoticeById,
    getDefaultNotice,
    updateNotice,
    deleteNotice,
};
