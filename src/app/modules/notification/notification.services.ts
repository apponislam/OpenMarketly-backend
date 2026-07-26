import { Types } from "mongoose";
import { NotificationModel } from "./notification.model";
import { NotificationType } from "./notification.interface";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";

const getMyNotifications = async (userId: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const notifications = await NotificationModel.find({ user: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await NotificationModel.countDocuments({ user: new Types.ObjectId(userId) });

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
        data: notifications,
    };
};

const markAsRead = async (notificationId: string, userId: string) => {
    const notification = await NotificationModel.findOneAndUpdate(
        { _id: new Types.ObjectId(notificationId), user: new Types.ObjectId(userId) },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        throw new ApiError(httpStatus.NOT_FOUND, "Notification not found or access denied");
    }

    return notification;
};

const markAllAsRead = async (userId: string) => {
    return await NotificationModel.updateMany(
        { user: new Types.ObjectId(userId), isRead: false },
        { isRead: true }
    );
};

const createNotification = async (
    userId: string | Types.ObjectId,
    title: string,
    message: string,
    type: NotificationType
) => {
    return await NotificationModel.create({
        user: new Types.ObjectId(userId),
        title,
        message,
        type,
        isRead: false,
    });
};

const getNotificationCount = async (userId: string) => {
    const unreadCount = await NotificationModel.countDocuments({
        user: new Types.ObjectId(userId),
        isRead: false,
    });
    const totalCount = await NotificationModel.countDocuments({
        user: new Types.ObjectId(userId),
    });
    return { unreadCount, totalCount };
};

export const notificationServices = {
    getMyNotifications,
    getNotificationCount,
    markAsRead,
    markAllAsRead,
    createNotification,
};
