import { RecentlyViewedModel } from "./recentlyViewed.model";

const addProductToRecentlyViewed = async (userId: string, productIds: string | string[]) => {
    const ids = Array.isArray(productIds) ? productIds : [productIds];
    
    // Perform bulk upserts/updates for each product ID
    for (const productId of ids) {
        await RecentlyViewedModel.findOneAndUpdate(
            { user: userId, product: productId },
            { viewedAt: new Date() },
            { upsert: true, new: true }
        );
    }

    // Limit history: only keep the most recent 20 viewed products per user
    const totalCount = await RecentlyViewedModel.countDocuments({ user: userId });
    if (totalCount > 20) {
        const oldestRecords = await RecentlyViewedModel.find({ user: userId })
            .sort({ viewedAt: 1 })
            .limit(totalCount - 20);

        const idsToDelete = oldestRecords.map((record) => record._id);
        await RecentlyViewedModel.deleteMany({ _id: { $in: idsToDelete } });
    }
};

const getRecentlyViewedProducts = async (userId: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const list = await RecentlyViewedModel.find({ user: userId })
        .populate({
            path: "product",
            match: { isDeleted: false, isActive: true },
            populate: { path: "category", select: "name slug" }
        })
        .sort({ viewedAt: -1 })
        .skip(skip)
        .limit(limit);

    // Filter out any populated elements that might have returned null (due to soft delete or inactive status)
    const filteredList = list.filter((item) => item.product !== null);
    const total = await RecentlyViewedModel.countDocuments({ user: userId });

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
        data: filteredList,
    };
};

const clearRecentlyViewed = async (userId: string) => {
    await RecentlyViewedModel.deleteMany({ user: userId });
    return true;
};

export const recentlyViewedServices = {
    addProductToRecentlyViewed,
    getRecentlyViewedProducts,
    clearRecentlyViewed,
};
