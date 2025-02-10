import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
    timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.ActivityLog ||
mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
