import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { IReport, ReportStatus, ReportType } from "./report.interface";
import { ReportModel } from "./report.model";
import mongoose from "mongoose";

const createReport = async (userId: string, data: Partial<IReport>) => {
    if (!data.type || !data.reason || !data.description) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Report type, reason, and description are required");
    }

    const reportData = {
        reporter: new mongoose.Types.ObjectId(userId),
        type: data.type as ReportType,
        reason: data.reason,
        description: data.description,
        images: data.images || [],
        status: "PENDING" as ReportStatus,
        isDeleted: false,
    } as any;

    // Check optional references depending on type
    if (data.type === "PRODUCT") {
        if (!data.reportedProduct) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Product reference is required for product reports");
        }
        reportData.reportedProduct = new mongoose.Types.ObjectId(data.reportedProduct.toString());
    } else if (data.type === "USER") {
        if (!data.reportedUser) {
            throw new ApiError(httpStatus.BAD_REQUEST, "User reference is required for user reports");
        }
        reportData.reportedUser = new mongoose.Types.ObjectId(data.reportedUser.toString());
    }

    return await ReportModel.create(reportData);
};

const getAllReports = async (type?: string, status?: string) => {
    const filter: any = { isDeleted: false };
    if (type) {
        filter.type = type.toUpperCase();
    }
    if (status) {
        filter.status = status.toUpperCase();
    }

    return await ReportModel.find(filter)
        .populate("reporter", "name email profileImage")
        .populate("reportedProduct", "name sku thumbnail price")
        .populate("reportedUser", "name email profileImage role")
        .sort({ createdAt: -1 });
};

const getReportById = async (id: string, userId: string, userRole: string) => {
    const report = await ReportModel.findOne({ _id: id, isDeleted: false })
        .populate("reporter", "name email profileImage")
        .populate("reportedProduct", "name sku thumbnail price")
        .populate("reportedUser", "name email profileImage role");

    if (!report) {
        throw new ApiError(httpStatus.NOT_FOUND, "Report ticket not found");
    }

    // Auth check: Admin or original reporter can view details
    if (report.reporter._id.toString() !== userId && userRole !== "ADMIN") {
        throw new ApiError(httpStatus.FORBIDDEN, "You do not have access to view this report");
    }

    return report;
};

const resolveReport = async (id: string, resolution: { status: ReportStatus; adminNote?: string }) => {
    const { status, adminNote } = resolution;

    if (!status || !["UNDER_INVESTIGATION", "RESOLVED", "DISMISSED"].includes(status)) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Valid resolution status is required (UNDER_INVESTIGATION, RESOLVED, DISMISSED)"
        );
    }

    const report = await ReportModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
            $set: {
                status,
                adminNote: adminNote || `Status updated to ${status} by Admin`,
            },
        },
        { new: true, runValidators: true }
    );

    if (!report) {
        throw new ApiError(httpStatus.NOT_FOUND, "Report ticket not found");
    }

    return report;
};

export const reportServices = {
    createReport,
    getAllReports,
    getReportById,
    resolveReport,
};
