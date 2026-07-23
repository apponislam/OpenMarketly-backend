import { Types } from "mongoose";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "SELLER" | "CUSTOMER";

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
}

export interface User {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    balance?: number;
    gender?: Gender;
    phone?: string;
    profileImage?: string;
    language?: string;
    aboutme?: string;
    referralCode?: string;
    referredBy?: Types.ObjectId;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    isActive: boolean;
    isEmailVerified: boolean;
    isDeleted: boolean;
    lastLogin?: Date;

    // Password reset fields
    resetPasswordOtp?: string;
    resetPasswordOtpExpiry?: Date;
    resetPasswordToken?: string;
    resetPasswordTokenExpiry?: Date;

    // Email verification fields
    verificationToken?: string;
    verificationCode?: string;
    verificationExpiry?: Date;

    // Email update fields
    pendingEmail?: string;
    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;

    createdAt: Date;
    updatedAt: Date;
}
