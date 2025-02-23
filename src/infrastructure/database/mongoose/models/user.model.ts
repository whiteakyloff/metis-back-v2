import mongoose from 'mongoose';

import { User } from "@domain/models/impl.user.model";

const userSchema = new mongoose.Schema({
    _id: String,
    email: { type: String, required: true, unique: true },
    password: { type: String,
        required: function(this: User) {
            return this.authMethod === 'email';
        }
    },
    username: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    authMethod: { type: String, enum: ['email', 'google'], default: 'email' },
}, { timestamps: true });

export const UserModel = mongoose.model('User', userSchema);