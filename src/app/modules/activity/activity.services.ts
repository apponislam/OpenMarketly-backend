import { IActivityLog, ActivityType } from "./activity.interface";
import { ActivityLogModel } from "./activity.model";

const logActivity = async (
    userId: string,
    action: ActivityType | string,
    details?: string,
    ipAddress?: string,
    userAgent?: string
) => {
    return await ActivityLogModel.create({
        user: userId,
        action,
        details,
        ipAddress,
        userAgent,
    });
};

export interface IActivityQuery {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
}

const getMyActivityLogs = async (userId: string, query: IActivityQuery) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = { user: userId };

    if (query.action) {
        filter.action = query.action;
    }

    if (query.search) {
        filter.$or = [
            { action: { $regex: query.search, $options: "i" } },
            { details: { $regex: query.search, $options: "i" } },
        ];
    }

    if (query.startDate || query.endDate) {
        filter.createdAt = {};
        if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
        if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    const logs = await ActivityLogModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await ActivityLogModel.countDocuments(filter);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
        data: logs,
    };
};

const getAllActivityLogs = async (query: IActivityQuery) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.action) {
        filter.action = query.action;
    }

    if (query.userId) {
        filter.user = query.userId;
    }

    if (query.search) {
        filter.$or = [
            { action: { $regex: query.search, $options: "i" } },
            { details: { $regex: query.search, $options: "i" } },
        ];
    }

    if (query.startDate || query.endDate) {
        filter.createdAt = {};
        if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
        if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    const logs = await ActivityLogModel.find(filter)
        .populate("user", "name email role profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await ActivityLogModel.countDocuments(filter);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
        data: logs,
    };
};

export const activityServices = {
    logActivity,
    getMyActivityLogs,
    getAllActivityLogs,
};
