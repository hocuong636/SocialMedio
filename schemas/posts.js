const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    content: {
      type: String,
      default: ""
    },

    images: [{
      type: String
    }],

    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public"
    },

    reactionsCount: {
      type: Number,
      default: 0,
      min: 0
    },

    commentsCount: {
      type: Number,
      default: 0,
      min: 0
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

module.exports = mongoose.model("post", postSchema);
