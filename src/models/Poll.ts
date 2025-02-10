import mongoose, { Schema, Document } from "mongoose";

export interface IPoll extends Document {
    userId: mongoose.Types.ObjectId;
    question: string;
    options: { text: string; votes: number }[];
    createdAt: Date;
}

const PollSchema = new Schema<IPoll>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true },
    options: [
        { text: { type: String, required: true }, votes: { type: Number, default: 0 } },
    ],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Poll || mongoose.model<IPoll>("Poll", PollSchema);
