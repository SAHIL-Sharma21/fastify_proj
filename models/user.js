import {model, Schema} from 'mongoose';

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    country: {
        type: String,
    },
    resetPasswordToken: {type: String},
    resetPasswordExpiry: {type: String}
});

export const User = model("user", userSchema);