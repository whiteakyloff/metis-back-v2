import mongoose from "mongoose";

const recoverySchema = new mongoose.Schema({
    email: { type: String, required: true },
    recoveryKey: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false }
}, { timestamps: true });

recoverySchema.index({ recoveryKey: 1 }, { unique: true });

recoverySchema.index({ email: 1 });

recoverySchema.index({ expiresAt: 1 }, {
    expireAfterSeconds: 0,
    partialFilterExpression: { expiresAt: { $exists: true } }
});

export const RecoveryModel = mongoose.connection.model('Recovery', recoverySchema);