import mongoose, { Schema } from "mongoose";
import { IProduct } from "./product.interface";

const variantSchema = new Schema(
    {
        color: String,
        size: String,
        sku: String,
        price: Number,
        stockQuantity: Number,
        image: String,
    },
    { _id: false },
);

const specificationSchema = new Schema(
    {
        key: { type: String, required: true },
        value: { type: String, required: true },
    },
    { _id: false },
);

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
    sku: {
        type: String,
        trim: true,
    },
    brand: {
        type: String,
        trim: true,
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

    description: {
        type: String,
        required: [true, "Product description is required"],
        trim: true,
    },
    shortDescription: {
        type: String,
        trim: true,
    },
    specifications: {
        type: [specificationSchema],
        default: [],
    },

    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [0, "Price cannot be negative"],
    },
    originalPrice: {
        type: Number,
        min: [0, "Original price cannot be negative"],
    },
    discountPercentage: {
        type: Number,
        min: [0, "Discount percentage cannot be negative"],
        max: [100, "Discount percentage cannot exceed 100"],
    },

    stockQuantity: {
        type: Number,
        required: [true, "Stock quantity is required"],
        default: 0,
        min: [0, "Stock cannot be negative"],
    },
    colors: {
        type: [String],
        default: [],
    },
    sizes: {
        type: [String],
        default: [],
    },
    variants: {
        type: [variantSchema],
        default: [],
    },

    images: {
        type: [String],
        default: [],
    },
    thumbnail: {
        type: String,
    },

    unit: {
        type: String,
        default: "Piece",
    },
    weight: {
        type: String,
    },
    dimensions: {
        type: String,
    },

    warranty: {
        type: String,
    },
    returnPolicy: {
        type: String,
    },

    tags: {
        type: [String],
        default: [],
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

// Pre-save hook for auto slug & auto SKU generation
ProductSchema.pre("save", function () {
    if (!this.slug && this.name) {
        const randomHex = Math.floor(1000 + Math.random() * 9000);
        this.slug = `${this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")}-${randomHex}`;
    }

    if (!this.sku) {
        const randomCode = Math.floor(100000 + Math.random() * 900000);
        this.sku = `SKU-${randomCode}`;
    }
});

// Indexes for high performance search, filter and pagination
ProductSchema.index({ name: "text", description: "text", brand: "text", tags: "text" });
ProductSchema.index({ category: 1, isDeleted: 1 });
ProductSchema.index({ seller: 1, isDeleted: 1 });
ProductSchema.index({ brand: 1, isDeleted: 1 });
ProductSchema.index({ price: 1, isDeleted: 1 });
ProductSchema.index({ isFeatured: 1, isDeleted: 1 });
ProductSchema.index({ isActive: 1, isDeleted: 1 });

export const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
