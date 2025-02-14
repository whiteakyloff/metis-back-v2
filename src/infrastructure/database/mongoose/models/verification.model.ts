import mongoose from "mongoose";

const VerificationCodeSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    verificationCode: { type: String, default: null },
    attemptsCount: { type: Number, default: 0 },
    codeExpiresAt: { type: Date, default: null }
}, { timestamps: true });

VerificationCodeSchema.index({ codeExpiresAt: 1 }, {
    expireAfterSeconds: 0,
    partialFilterExpression: { codeExpiresAt: { $exists: true } }
});

export const VerificationCodeModel = mongoose.model('VerificationCode', VerificationCodeSchema);