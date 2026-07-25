import { Types } from "mongoose";
import { UserModel } from "../auth/auth.model";
import { ProductModel } from "../product/product.model";
import { OrderModel } from "../order/order.model";
import { WithdrawModel } from "../withdraw/withdraw.model";
import { WishlistModel } from "../wishlist/wishlist.model";

const getAdminStats = async () => {
    // 1. User stats by role
    const userStatsData = await UserModel.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 },
            },
        },
    ]);

    const userStats = {
        totalCustomers: 0,
        totalSellers: 0,
        totalAdmins: 0,
        totalSuperAdmins: 0,
    };

    userStatsData.forEach((stat) => {
        if (stat._id === "CUSTOMER") userStats.totalCustomers = stat.count;
        else if (stat._id === "SELLER") userStats.totalSellers = stat.count;
        else if (stat._id === "ADMIN") userStats.totalAdmins = stat.count;
        else if (stat._id === "SUPER_ADMIN") userStats.totalSuperAdmins = stat.count;
    });

    // 2. Product stats by status
    const productStatsData = await ProductModel.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: "$approvalStatus",
                count: { $sum: 1 },
            },
        },
    ]);

    const productStats = {
        totalProducts: 0,
        draft: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        needEdit: 0,
    };

    productStatsData.forEach((stat) => {
        if (stat._id === "DRAFT") productStats.draft = stat.count;
        else if (stat._id === "PENDING") productStats.pending = stat.count;
        else if (stat._id === "APPROVED") productStats.approved = stat.count;
        else if (stat._id === "REJECTED") productStats.rejected = stat.count;
        else if (stat._id === "NEED_EDIT") productStats.needEdit = stat.count;
    });
    productStats.totalProducts = Object.values(productStats).reduce((a, b) => a + b, 0) - productStats.totalProducts;

    // 3. Order stats & financial overview (revenue and commission)
    const financialStats = await OrderModel.aggregate([
        {
            $facet: {
                summary: [
                    { $match: { paymentStatus: "PAID" } },
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: "$totalPrice" },
                            totalCommission: {
                                $sum: {
                                    $sum: "$items.adminCommission",
                                },
                            },
                        },
                    },
                ],
                statusCounts: [
                    {
                        $group: {
                            _id: "$orderStatus",
                            count: { $sum: 1 },
                        },
                    },
                ],
            },
        },
    ]);

    const summary = financialStats[0]?.summary[0] || { totalRevenue: 0, totalCommission: 0 };
    const statusCounts = financialStats[0]?.statusCounts || [];

    const orderStats = {
        totalOrders: 0,
        totalRevenue: summary.totalRevenue,
        totalCommission: summary.totalCommission,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
    };

    statusCounts.forEach((stat: any) => {
        if (stat._id === "PENDING") orderStats.pending = stat.count;
        else if (stat._id === "PROCESSING") orderStats.processing = stat.count;
        else if (stat._id === "SHIPPED") orderStats.shipped = stat.count;
        else if (stat._id === "DELIVERED") orderStats.delivered = stat.count;
        else if (stat._id === "CANCELLED") orderStats.cancelled = stat.count;
    });
    orderStats.totalOrders = await OrderModel.countDocuments();

    // 4. Withdraw stats
    const withdrawStatsData = await WithdrawModel.aggregate([
        {
            $group: {
                _id: "$status",
                amount: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
    ]);

    const withdrawStats = {
        totalPendingAmount: 0,
        totalApprovedAmount: 0,
        totalRequests: 0,
    };

    withdrawStatsData.forEach((stat) => {
        if (stat._id === "PENDING") withdrawStats.totalPendingAmount = stat.amount;
        else if (stat._id === "APPROVED") withdrawStats.totalApprovedAmount = stat.amount;
        withdrawStats.totalRequests += stat.count;
    });

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
