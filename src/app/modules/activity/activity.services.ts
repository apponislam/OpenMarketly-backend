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

const getMyActivityLogs = async (userId: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const logs = await ActivityLogModel.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await ActivityLogModel.countDocuments({ user: userId });

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

const getAllActivityLogs = async (page: number = 1, limit: number = 10, search?: string) => {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (search) {
        filter.$or = [
            { action: { $regex: search, $options: "i" } },
            { details: { $regex: search, $options: "i" } },
        ];
    }

    const logs = await ActivityLogModel.find(filter)
        .populate("user", "name email role")
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
