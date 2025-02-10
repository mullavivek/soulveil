import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
