import mongoose, { Schema } from "mongoose";
import { ICategory } from "./category.interface";

const categorySchemaDefinition: any = {
    name: {
        type: String,
        required: [true, "Category name is required"],
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
        trim: true,
    },
    image: {
        type: String,
    },
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: "Category",
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

const CategorySchema = new Schema<ICategory>(categorySchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

// Auto-generate slug from name if not provided
CategorySchema.pre("save", function () {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }
});

// Indexes
CategorySchema.index({ name: 1, isDeleted: 1 });
CategorySchema.index({ isActive: 1, isDeleted: 1 });

export const CategoryModel = mongoose.model<ICategory>("Category", CategorySchema);
