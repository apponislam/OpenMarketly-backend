import { Types } from "mongoose";
import { UserModel } from "../auth/auth.model";
import { ProductModel } from "../product/product.model";
import { OrderModel } from "../order/order.model";
import { WithdrawModel } from "../withdraw/withdraw.model";
import { WishlistModel } from "../wishlist/wishlist.model";

const getAdminStats = async () => {
    // 1. User stats by role
    const userStats = (await UserModel.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: null,
                totalCustomers: { $sum: { $cond: [{ $eq: ["$role", "CUSTOMER"] }, 1, 0] } },
                totalSellers: { $sum: { $cond: [{ $eq: ["$role", "SELLER"] }, 1, 0] } },
                totalAdmins: { $sum: { $cond: [{ $eq: ["$role", "ADMIN"] }, 1, 0] } },
                totalSuperAdmins: { $sum: { $cond: [{ $eq: ["$role", "SUPER_ADMIN"] }, 1, 0] } },
            },
        },
    ]))[0] || {
        totalCustomers: 0,
        totalSellers: 0,
        totalAdmins: 0,
        totalSuperAdmins: 0,
    };

    // 2. Product stats by status
    const productStats = (await ProductModel.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                draft: { $sum: { $cond: [{ $eq: ["$approvalStatus", "DRAFT"] }, 1, 0] } },
                pending: { $sum: { $cond: [{ $eq: ["$approvalStatus", "PENDING"] }, 1, 0] } },
                approved: { $sum: { $cond: [{ $eq: ["$approvalStatus", "APPROVED"] }, 1, 0] } },
                rejected: { $sum: { $cond: [{ $eq: ["$approvalStatus", "REJECTED"] }, 1, 0] } },
                needEdit: { $sum: { $cond: [{ $eq: ["$approvalStatus", "NEED_EDIT"] }, 1, 0] } },
            },
        },
    ]))[0] || {
        totalProducts: 0,
        draft: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        needEdit: 0,
    };

    // 3. Order stats & financial overview (revenue and commission)
    const orderStats = (await OrderModel.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "PAID"] }, "$totalPrice", 0] } },
                totalCommission: {
                    $sum: {
                        $cond: [
                            { $eq: ["$paymentStatus", "PAID"] },
                            { $sum: "$items.adminCommission" },
                            0,
                        ],
                    },
                },
                pending: { $sum: { $cond: [{ $eq: ["$orderStatus", "PENDING"] }, 1, 0] } },
                processing: { $sum: { $cond: [{ $eq: ["$orderStatus", "PROCESSING"] }, 1, 0] } },
                shipped: { $sum: { $cond: [{ $eq: ["$orderStatus", "SHIPPED"] }, 1, 0] } },
                delivered: { $sum: { $cond: [{ $eq: ["$orderStatus", "DELIVERED"] }, 1, 0] } },
                cancelled: { $sum: { $cond: [{ $eq: ["$orderStatus", "CANCELLED"] }, 1, 0] } },
            },
        },
    ]))[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
    };

    // 4. Withdraw stats
    const withdrawStats = (await WithdrawModel.aggregate([
        {
            $group: {
                _id: null,
                totalPendingAmount: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, "$amount", 0] } },
                totalApprovedAmount: { $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, "$amount", 0] } },
                totalRequests: { $sum: 1 },
            },
        },
    ]))[0] || {
        totalPendingAmount: 0,
        totalApprovedAmount: 0,
        totalRequests: 0,
    };

    // 5. Recent 5 orders
    const recentOrders = await OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email profileImage");

    // 6. Recent 5 signups
    const recentSignups = await UserModel.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt profileImage");

    return {
        userStats,
        productStats,
        orderStats,
        withdrawStats,
        recentOrders,
        recentSignups,
    };
};

const getSellerStats = async (sellerId: string) => {
    const sellerObjectId = new Types.ObjectId(sellerId);

    // 1. Total products listed by the seller
    const totalProducts = await ProductModel.countDocuments({ seller: sellerObjectId, isDeleted: false });

    // 2. Low stock alerts (stock < 10)
    const lowStockAlerts = await ProductModel.find({
        seller: sellerObjectId,
        stockQuantity: { $lt: 10 },
        isDeleted: false,
    }).select("name stockQuantity thumbnail price");

    // 3. Store sales/earnings from PAID orders
    // We aggregate paid orders, unwind items, lookup products to filter by this seller, then sum earnings.
    const salesData = await OrderModel.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "productInfo",
            },
        },
        { $unwind: "$productInfo" },
        { $match: { "productInfo.seller": sellerObjectId } },
        {
            $group: {
                _id: null,
                totalEarnings: { $sum: "$items.sellerEarnings" },
                totalOrdersCount: { $addToSet: "$_id" }, // count unique orders containing seller's products
            },
        },
    ]);

    const storeSales = salesData[0]?.totalEarnings || 0;
    const totalOrders = salesData[0]?.totalOrdersCount?.length || 0;

    // 4. Withdrawal stats
    const withdrawData = await WithdrawModel.aggregate([
        { $match: { seller: sellerObjectId } },
        {
            $group: {
                _id: "$status",
                amount: { $sum: "$amount" },
            },
        },
    ]);

    const withdrawStats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        totalWithdrawn: 0,
    };

    withdrawData.forEach((stat) => {
        if (stat._id === "PENDING") withdrawStats.pending = stat.amount;
        else if (stat._id === "APPROVED") {
            withdrawStats.approved = stat.amount;
            withdrawStats.totalWithdrawn = stat.amount;
        } else if (stat._id === "REJECTED") withdrawStats.rejected = stat.amount;
    });

    // 5. Recent 5 orders containing seller's products
    const recentOrders = await OrderModel.aggregate([
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "productInfo",
            },
        },
        { $unwind: "$productInfo" },
        { $match: { "productInfo.seller": sellerObjectId } },
        {
            $group: {
                _id: "$_id",
                totalPrice: { $first: "$totalPrice" },
                paymentStatus: { $first: "$paymentStatus" },
                orderStatus: { $first: "$orderStatus" },
                transactionId: { $first: "$transactionId" },
                createdAt: { $first: "$createdAt" },
                user: { $first: "$user" },
                items: {
                    $push: {
                        product: "$items.product",
                        quantity: "$items.quantity",
                        price: "$items.price",
                        sellerEarnings: "$items.sellerEarnings",
                        name: "$productInfo.name",
                        thumbnail: "$productInfo.thumbnail",
                    },
                },
            },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userInfo",
            },
        },
        {
            $project: {
                _id: 1,
                totalPrice: 1,
                paymentStatus: 1,
                orderStatus: 1,
                transactionId: 1,
                createdAt: 1,
                items: 1,
                user: {
                    $let: {
                        vars: { firstUser: { $arrayElemAt: ["$userInfo", 0] } },
                        in: {
                            name: "$$firstUser.name",
                            email: "$$firstUser.email",
                        },
                    },
                },
            },
        },
    ]);

    return {
        storeSales,
        totalOrders,
        totalProducts,
        lowStockAlerts,
        withdrawStats,
        recentOrders,
    };
};

const getCustomerStats = async (customerId: string) => {
    const customerObjectId = new Types.ObjectId(customerId);

    // 1. Total orders placed
    const totalOrders = await OrderModel.countDocuments({ user: customerObjectId });

    // 2. Pending orders count
    const pendingOrders = await OrderModel.countDocuments({ user: customerObjectId, orderStatus: "PENDING" });

    // 3. Active wishlist count
    const wishlistCount = await WishlistModel.countDocuments({ user: customerObjectId });

    // 4. Total spent on paid orders
    const spendStats = await OrderModel.aggregate([
        { $match: { user: customerObjectId, paymentStatus: "PAID" } },
        {
            $group: {
                _id: null,
                totalSpent: { $sum: "$totalPrice" },
            },
        },
    ]);
    const totalSpent = spendStats[0]?.totalSpent || 0;

    // 5. Recent 5 orders
    const recentOrders = await OrderModel.find({ user: customerObjectId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("totalPrice paymentStatus orderStatus transactionId createdAt");

    return {
        totalOrders,
        totalSpent,
        pendingOrders,
        wishlistCount,
        recentOrders,
    };
};

export const dashboardServices = {
    getAdminStats,
    getSellerStats,
    getCustomerStats,
};
