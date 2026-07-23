import mongoose, { Schema } from "mongoose";
import crypto from "crypto";
import { User } from "./auth.interface";

const userSchemaDefinition: any = {
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },

    password: {
        type: String,
        required: [true, "Password is required"],
    },

    role: {
        type: String,
        enum: ["SUPER_ADMIN", "ADMIN", "SELLER", "CUSTOMER"],
        default: "CUSTOMER",
        required: true,
    },

    balance: {
        type: Number,
        default: 0,
    },

    gender: {
        type: String,
        enum: ["MALE", "FEMALE", "OTHER"],
    },

    referralCode: {
        type: String,
        unique: true,
        sparse: true,
    },

    referredBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    phone: {
        type: String,
    },

    profileImage: {
        type: String,
    },

    language: {
        type: String,
    },

    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
    },
    aboutme: {
        type: String,
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    isEmailVerified: {
        type: Boolean,
        default: false,
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },

    lastLogin: {
        type: Date,
    },

    resetPasswordOtp: String,
    resetPasswordOtpExpiry: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpiry: Date,

    verificationToken: String,
    verificationCode: String,
    verificationExpiry: Date,

    pendingEmail: String,
    emailVerificationToken: String,
    emailVerificationExpiry: Date,
};

const UserSchema = new Schema<User>(userSchemaDefinition, {
    timestamps: true,
    versionKey: false,

    toJSON: {
        transform(doc, ret: Partial<User>) {
            delete ret.password;
            delete ret.resetPasswordOtp;
            delete ret.resetPasswordOtpExpiry;
            delete ret.resetPasswordToken;
            delete ret.resetPasswordTokenExpiry;
            delete ret.verificationToken;
            delete ret.verificationCode;
            delete ret.verificationExpiry;
            delete ret.emailVerificationToken;
            delete ret.emailVerificationExpiry;
            delete ret.pendingEmail;
            return ret;
        },
    },
});

// Pre-save hook to generate a unique referralCode if not already set
UserSchema.pre("save", async function () {
    if (!this.referralCode) {
        let code = "";
        let isUnique = false;
        while (!isUnique) {
            code = crypto.randomBytes(4).toString("hex").toUpperCase();
            const existingUser = await mongoose.models.User.findOne({ referralCode: code });
            if (!existingUser) {
                isUnique = true;
            }
        }
        this.referralCode = code;
    }
});

// Authentication lookup (optimized for isDeleted filtering)
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ email: 1, isDeleted: 1 });
UserSchema.index({ name: 1, isDeleted: 1 });
UserSchema.index({ role: 1, isDeleted: 1 });
UserSchema.index({ isActive: 1, isDeleted: 1 });
UserSchema.index({ isEmailVerified: 1, isDeleted: 1 });
UserSchema.index({ groupId: 1, isDeleted: 1 });
UserSchema.index({ referredBy: 1 });

// Token & OTP lookup indexes (important for auth flows)
UserSchema.index({ resetPasswordToken: 1, isDeleted: 1 });
UserSchema.index({ resetPasswordOtp: 1, isDeleted: 1 });
UserSchema.index({ verificationToken: 1, isDeleted: 1 });
UserSchema.index({ verificationCode: 1, isDeleted: 1 });
UserSchema.index({ emailVerificationToken: 1, isDeleted: 1 });

// Activity tracking optimization
UserSchema.index({ lastLogin: -1 });

export const UserModel = mongoose.model<User>("User", UserSchema);
