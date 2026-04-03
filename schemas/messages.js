const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversation",
      required: true
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    messageContent: {
      type: {
        type: String,
        enum: ["file", "text", "image"],
        required: true
      },
      text: {
        type: String,
        required: true
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("message", messageSchema);
