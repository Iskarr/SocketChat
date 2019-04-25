const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const chatSchema = new Schema(
  {
    ChatId: {
      type: String
    },
    message: {
      type: String
    },
    Sender: {
      type: String
    }
  },
  {
    timestamps: true
  }
);
let Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
