import mongoose from 'mongoose';

import { User } from "@modules/auth/domain/models/impl.user.model";

const userSchema = new mongoose.Schema({
    _id: String,
    email: { type: String, required: true },
    password: { type: String,
        required: function(this: User) {
            return this.authMethod === 'email';
        }
    },
    username: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    authMethod: { type: String, enum: ['email', 'third-party'], default: 'email' },
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 });

export const UserModel = mongoose.connection.model('User', userSchema);