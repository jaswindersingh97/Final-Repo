const mongoose = require('mongoose');
const User = require('./../models/User');
const Chat = require('./../models/ChatModel');
const Message = require('./../models/MessageModel');
const ChatUser = require('./../models/ChatUser');

const SyncUnseenCount = async ()=> {
    
    const chats = await Chat.find({});
    console.log(chats);
    for (const chat of chats){
        const messages = await Message.find({chat : chat._id}).sort({createdAt: 1});

        for (const user of chat.users) {

            const unseenCount = messages.filter(message => !message.readBy.includes(user._id)).length;

            await ChatUser.findOneAndUpdate({
                User_id: user._id,
                Chat_id: chat._id
            },{
                User_id: user._id,
                Chat_id: chat._id,
                unseen_count: unseenCount,
                last_seen_message_id: null, // Can leave this as null if you don't track it
              },
              { upsert: true, new: true } // Create if it doesn't exist
                );   
            }
        }
        console.log("ChatUser table synced successfully!");   
}

module.exports = SyncUnseenCount;