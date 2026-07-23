import { Types } from "mongoose";

export interface ICartItem {
    product: Types.ObjectId;
    quantity: number;
    color?: string;
    size?: string;
    price: number;
}

export interface ICart {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    items: ICartItem[];
    totalPrice: number;
    createdAt?: Date;
    updatedAt?: Date;
}
