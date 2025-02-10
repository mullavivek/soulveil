import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
    userId: mongoose.Types.ObjectId;
    content: string;
    likes: mongoose.Types.ObjectId[];
    createdAt: Date;
}

const PostSchema = new Schema<IPost>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
