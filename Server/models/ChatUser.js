const mongoose = require("mongoose");

const ChatUserModel = mongoose.Schema(
  {
    User_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" , index: true },
    Chat_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" , index: true },
    unseen_count:{ type: Number , default : 0},
    last_seen_message_id: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

const ChatUser = mongoose.model("ChatUser", ChatUserModel);
module.exports = ChatUser;