import mongoose, { Schema } from "mongoose";
import { IProduct } from "./product.interface";

const productSchemaDefinition: any = {
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
        trim: true,
    },
    shortDescription: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [0, "Price cannot be negative"],
    },
    discountPrice: {
        type: Number,
        min: [0, "Discount price cannot be negative"],
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Product category is required"],
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Product seller is required"],
    },
    images: {
        type: [String],
        default: [],
    },
    thumbnail: {
        type: String,
    },
    stockQuantity: {
        type: Number,
        required: [true, "Stock quantity is required"],
        default: 0,
        min: [0, "Stock cannot be negative"],
    },
    unit: {
        type: String,
        default: "Piece",
    },
    status: {
        type: String,
        enum: ["IN_STOCK", "OUT_OF_STOCK", "DISCONTINUED"],
        default: "IN_STOCK",
    },
    tags: {
        type: [String],
        default: [],
    },
    ratings: {
        type: Number,
        default: 0,
        min: [0, "Ratings cannot be less than 0"],
        max: [5, "Ratings cannot exceed 5"],
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
};

const ProductSchema = new Schema<IProduct>(productSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

// Auto-generate slug and update status based on stockQuantity
ProductSchema.pre("save", function () {
    if (!this.slug && this.name) {
        const randomHex = Math.floor(1000 + Math.random() * 9000);
        this.slug = `${this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}-${randomHex}`;
    }

    if (this.stockQuantity <= 0 && this.status !== "DISCONTINUED") {
        this.status = "OUT_OF_STOCK";
    } else if (this.stockQuantity > 0 && this.status === "OUT_OF_STOCK") {
        this.status = "IN_STOCK";
    }
});

// Indexes for high-performance search and filtering
ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ category: 1, isDeleted: 1 });
ProductSchema.index({ seller: 1, isDeleted: 1 });
ProductSchema.index({ price: 1, isDeleted: 1 });
ProductSchema.index({ isFeatured: 1, isDeleted: 1 });
ProductSchema.index({ isActive: 1, isDeleted: 1 });

export const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
