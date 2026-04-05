const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            unique: true
        },
        phone: {
            type: String,
            default: ""
        },
        dateOfBirth: {
            type: Date,
            default: null
        },
        gender: {
            type: String,
            enum: ["male", "female", "other", ""],
            default: ""
        },
        address: {
            type: String,
            default: ""
        },
        website: {
            type: String,
            default: ""
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("userProfile", userProfileSchema);
