import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Types } from "mongoose";
import ApiError from "../../../errors/ApiError";
import config from "../../config";
import { UserModel } from "../auth/auth.model";
import { ProductModel } from "../product/product.model";
import { OrderModel } from "../order/order.model";
import { ActivityLogModel } from "../activity/activity.model";
import { NotificationModel } from "../notification/notification.model";
import { RatingModel } from "../rating/rating.model";
import { UserRole } from "../auth/auth.interface";

// 1. Direct aggregate counting totalUsers, totalCustomers, totalSellers, totalAdmins
const getUserStats = async () => {
    const stats = await UserModel.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                totalCustomers: { $sum: { $cond: [{ $eq: ["$role", "CUSTOMER"] }, 1, 0] } },
                totalSellers: { $sum: { $cond: [{ $eq: ["$role", "SELLER"] }, 1, 0] } },
                totalAdmins: { $sum: { $cond: [{ $eq: ["$role", "ADMIN"] }, 1, 0] } },
            },
        },
        {
            $project: {
                _id: 0,
                totalUsers: 1,
                totalCustomers: 1,
                totalSellers: 1,
                totalAdmins: 1,
            },
        },
    ]);

    return (
        stats[0] || {
            totalUsers: 0,
            totalCustomers: 0,
            totalSellers: 0,
            totalAdmins: 0,
        }
    );
};

// 2. Create Admin (Super Admin only)
const createAdmin = async (payload: {
    name: string;
    email: string;
    password: string;
    gender?: string;
    phone?: string;
    profileImage?: string;
}) => {
    const existingUser = await UserModel.findOne({ email: payload.email.toLowerCase() });
    if (existingUser) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds));

    const adminUser = await UserModel.create({
        name: payload.name,
        email: payload.email.toLowerCase(),
        password: hashedPassword,
        role: "ADMIN",
        gender: payload.gender as any,
        phone: payload.phone,
        profileImage: payload.profileImage,
        isActive: true,
        isEmailVerified: true,
    });

    const userObj = (adminUser as any).toObject ? (adminUser as any).toObject() : adminUser;
    delete userObj.password;

    return userObj;
};

// 3. Set password for a user (Admin/Super Admin)
const setUserPassword = async (targetUserId: string, newPassword?: string) => {
    if (!newPassword) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Password is required");
    }

    const user = await UserModel.findById(targetUserId);
    if (!user || user.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    user.password = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));
    await user.save();

    return null;
};

// 4. Change role (Super Admin only)
const changeUserRole = async (targetUserId: string, newRole: UserRole) => {
    const validRoles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "SELLER", "CUSTOMER"];
    if (!validRoles.includes(newRole)) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid role: ${newRole}`);
    }

    const user = await UserModel.findById(targetUserId);
    if (!user || user.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    user.role = newRole;
    await user.save();

    const userObj = user.toObject() as any;
    delete userObj.password;

    return userObj;
};

// 5. Get all users with search, filter, pagination
const getAllUsers = async (query: Record<string, any>) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    const sortConditions: { [key: string]: 1 | -1 } = { [sortBy]: sortOrder };

    const andConditions: any[] = [{ isDeleted: false }];

    if (query.search) {
        andConditions.push({
            $or: [
                { name: { $regex: query.search, $options: "i" } },
                { email: { $regex: query.search, $options: "i" } },
                { phone: { $regex: query.search, $options: "i" } },
            ],
        });
    }

    if (query.role) {
        andConditions.push({ role: query.role });
    }

    if (query.isActive !== undefined) {
        andConditions.push({ isActive: query.isActive === "true" });
    }

    if (query.isEmailVerified !== undefined) {
        andConditions.push({ isEmailVerified: query.isEmailVerified === "true" });
    }

    const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};

    const users = await UserModel.find(whereConditions)
        .select("-password")
        .sort(sortConditions)
        .skip(skip)
        .limit(limit);

    const total = await UserModel.countDocuments(whereConditions);
    const totalPage = Math.ceil(total / limit);

    return {
        meta: {
            page,
            limit,
            total,
            totalPage,
        },
        data: users,
    };
};

// 6. Get single user
const getSingleUser = async (userId: string) => {
    const user = await UserModel.findOne({ _id: userId, isDeleted: false }).select("-password");
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    return user;
};

// 7. User wise resources with pagination
const getUserProducts = async (userId: string, query: Record<string, any>) => {
    const user = await UserModel.findById(userId);
    if (!user || user.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    const filter = { seller: new Types.ObjectId(userId), isDeleted: false };

    const products = await ProductModel.find(filter)
        .populate("category", "name slug")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);

    const total = await ProductModel.countDocuments(filter);
    const totalPage = Math.ceil(total / limit);

    return {
        meta: { page, limit, total, totalPage },
        data: products,
    };
};

const getUserOrders = async (userId: string, query: Record<string, any>) => {
    const user = await UserModel.findById(userId);
    if (!user || user.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    const filter = { user: new Types.ObjectId(userId) };

    const orders = await OrderModel.find(filter)
        .populate("items.product", "name thumbnail price")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);

    const total = await OrderModel.countDocuments(filter);
    const totalPage = Math.ceil(total / limit);

    return {
        meta: { page, limit, total, totalPage },
        data: orders,
    };
};

const getUserActivities = async (userId: string, query: Record<string, any>) => {
    const user = await UserModel.findById(userId);
    if (!user || user.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    const filter = { user: new Types.ObjectId(userId) };

    const activities = await ActivityLogModel.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);

    const total = await ActivityLogModel.countDocuments(filter);
    const totalPage = Math.ceil(total / limit);

    return {
        meta: { page, limit, total, totalPage },
        data: activities,
    };
};

const getUserNotifications = async (userId: string, query: Record<string, any>) => {
    const user = await UserModel.findById(userId);
    if (!user || user.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    const filter = { user: new Types.ObjectId(userId) };

    const notifications = await NotificationModel.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);

    const total = await NotificationModel.countDocuments(filter);
    const totalPage = Math.ceil(total / limit);

    return {
        meta: { page, limit, total, totalPage },
        data: notifications,
    };
};

const getUserRatings = async (userId: string, query: Record<string, any>) => {
    const user = await UserModel.findById(userId);
    if (!user || user.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    const filter = { user: new Types.ObjectId(userId), isDeleted: false };

    const ratings = await RatingModel.find(filter)
        .populate("product", "name thumbnail price")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);

    const total = await RatingModel.countDocuments(filter);
    const totalPage = Math.ceil(total / limit);

    return {
        meta: { page, limit, total, totalPage },
        data: ratings,
    };
};

export const userServices = {
    getUserStats,
    createAdmin,
    setUserPassword,
    changeUserRole,
    getAllUsers,
    getSingleUser,
    getUserProducts,
    getUserOrders,
    getUserActivities,
    getUserNotifications,
    getUserRatings,
};
