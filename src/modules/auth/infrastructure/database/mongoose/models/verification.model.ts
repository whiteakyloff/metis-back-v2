import mongoose from "mongoose";

const verificationCodeSchema = new mongoose.Schema({
    email: { type: String, required: true },
    verificationCode: { type: String, default: null },
    attemptsCount: { type: Number, default: 0 },
    codeExpiresAt: { type: Date, default: null }
}, { timestamps: true });

verificationCodeSchema.index({ codeExpiresAt: 1 }, {
    expireAfterSeconds: 0,
    partialFilterExpression: { codeExpiresAt: { $exists: true } }
});

verificationCodeSchema.index({ email: 1 }, { unique: true });

export const VerificationCodeModel = mongoose.connection.model('VerificationCode', verificationCodeSchema);