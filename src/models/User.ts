import mongoose, { Schema, Document, Model } from "mongoose";

// User Interface
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    verificationToken?: string;
    verificationExpires?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isVerified: { type: Boolean, default: false },

        // 🔹 Email Verification Fields
        verificationToken: { type: String },
        verificationExpires: { type: Date },

        // 🔹 Password Reset Fields
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
    },
    { timestamps: true } // Automatically adds createdAt & updatedAt
);

// Export Model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
