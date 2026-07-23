import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { IPolicy, PolicyType } from "./policy.interface";
import { PolicyModel } from "./policy.model";
import { activityServices } from "../activity/activity.services";
import { ActivityType } from "../activity/activity.interface";

const createOrUpdatePolicy = async (data: Partial<IPolicy>, userId: string) => {
    if (!data.type || !data.title || !data.content) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Policy type, title, and content are required");
    }

    const policy = await PolicyModel.findOneAndUpdate(
        { type: data.type },
        {
            $set: {
                title: data.title,
                content: data.content,
                version: data.version || "1.0",
                isPublished: data.isPublished !== undefined ? data.isPublished : true,
                isDeleted: false,
            },
        },
        { new: true, upsert: true, runValidators: true }
    );

    // Log policy update
    activityServices.logActivity(
        userId,
        ActivityType.POLICY_UPDATE,
        `Updated policy statement for type: ${data.type}`
    );

    return policy;
};

const getPolicyByType = async (type: string) => {
    const policy = await PolicyModel.findOne({
        type: type.toUpperCase() as PolicyType,
        isDeleted: false,
        isPublished: true,
    });

    if (!policy) {
        throw new ApiError(httpStatus.NOT_FOUND, `Policy for '${type}' not found`);
    }

    return policy;
};

const getAllPolicies = async (isAdmin = false) => {
    const filter: any = { isDeleted: false };
    if (!isAdmin) {
        filter.isPublished = true;
    }

    return await PolicyModel.find(filter).sort({ createdAt: -1 });
};

const deletePolicy = async (type: string, userId: string) => {
    const policy = await PolicyModel.findOneAndUpdate(
        { type: type.toUpperCase() as PolicyType, isDeleted: false },
        { $set: { isDeleted: true } },
        { new: true }
    );

    if (!policy) {
        throw new ApiError(httpStatus.NOT_FOUND, `Policy for '${type}' not found`);
    }

    // Log policy deletion
    activityServices.logActivity(
        userId,
        ActivityType.POLICY_UPDATE,
        `Deleted policy statement for type: ${type}`
    );

    return policy;
};

export const policyServices = {
    createOrUpdatePolicy,
    getPolicyByType,
    getAllPolicies,
    deletePolicy,
};
