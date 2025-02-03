const Chat = require('../models/ChatModel');
const User = require('./../models/User');
const Message = require('./../models/MessageModel');

const SyncUnseenCount = require('./../utils/SyncUnseenCount');
const ChatUser = require('../models/ChatUser');
const searchUser = async (req, res) => {
    const { query } = req.query; // Extract the query from URL query string
    const userId = req.user._id; // Assuming the user ID is stored in req.user after authentication

    try {
        // Validate the query parameter
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // Search in both 'name' and 'email' fields using regex and case-insensitivity
        const users = await User.find({
            $and: [
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } }
                    ]
                },
                { _id: { $ne: userId } } // Exclude the logged-in user by checking that _id is not equal to the current user's ID
            ]
        });


        // Handle case when no users are found
        if (users.length === 0) {
            return res.status(200).json({ message: 'No users found', users: [] });
        }

        // Return the found users
        res.status(200).json({ message: "Users found", users });
    } catch (error) {
        console.error('Error while searching users:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const Users = async (req, res) =>{
    try {
        
        const users = await User.find();

        // Handle case when no users are found
        if (users.length === 0) {
            return res.status(200).json({ message: 'No users found', users: [] });
        }

        // Return the found users
        res.status(200).json({ message: "Users found", users });
    } catch (error) {
        console.error('Error while searching users:', error);
        res.status(500).json({ error: "Internal server error" });
    }

};

const getChat = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "userId not available" });
    }

    try {
        // Check if a one-on-one chat already exists between the two users
        var isChat = await Chat.findOne({
            isGroupChat: false,
            users: { $all: [req.user._id, userId] }
        })
        .populate("users") // Ensure all users are populated with name and email
        .populate("latestMessage");

        // Populate the sender of the latest message
        isChat = await User.populate(isChat, {
            path: 'latestMessage.sender',
            select: 'name email'
        });

        // If chat exists, return it
        if (isChat) {
            console.log(isChat)
            return res.status(200).send(isChat);
        }

        // If no chat exists, create a new one
        const chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId], // Add both users to the chat
        };

        const createChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ _id: createChat._id })
            .populate("users", "name email"); // Populate both users
        return res.status(200).send(fullChat);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while fetching or creating chat", error });
    }
};

const Chats = async (req, res) => {
    try {
      // Fetch chats for the user
      const chats = await Chat.find({
        users: { $elemMatch: { $eq: req.user._id } }
      })
      .populate("users groupAdmin")
        .populate({
            path: 'latestMessage', // Populate the latestMessage field
            populate: { 
              path: 'sender' // Nested populate for sender inside latestMessage
            }
        })
      .sort({ updatedAt: -1 });
  
      // Fetch unseen counts for the user
      const unseenCounts = await ChatUser.find({ User_id: req.user._id });
  
      // Create a map of unseen counts
      const unseenCountMap = {};
      unseenCounts.forEach(({ Chat_id, unseen_count }) => {
        unseenCountMap[Chat_id.toString()] = unseen_count; // Convert ObjectId to string for easy comparison
      });
  
      // Combine chats with their unseen counts
      const result = chats.map(chat => ({
        ...chat.toObject(), // Convert Mongoose document to plain object
        unseen_count: unseenCountMap[chat._id.toString()] || 0 // Default to 0 if not found
      }));
  
      // Return the combined result
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(400).json({
        message: "Error: something went wrong in chats",
        error: error.message
      });
    }
  };
  
  
  const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).json({ message: "Please provide all the fields." });
    }
    const users = req.body.users;

    if (users.length < 2) {
        return res.status(400).json({ message: "At least 2 users are required to create a group chat." });
    }
    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users")
            .populate("groupAdmin");

        return res.status(200).json(fullGroupChat);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const renameGrp = async(req,res) =>{
    const { chatId, chatName} = req.body;
    
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName,
        },
        {
            new: true,
        }
    ).populate("users")
    .populate("groupAdmin")

    if(!updatedChat){
        res.status(400)
        throw new Error("chat not found")
    }
    else{
        res.status(200).json(updatedChat);
    }
}

const addMembers = async (req, res) => {
    try {
      const { chatId, userId } = req.body;
  
      // Use await to ensure the operation completes before moving on
      const added = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } }, // Add user to chat
        { new: true } // Return the updated document
      )
        .populate("users") // Populate users array
        .populate("groupAdmin"); // Populate group admin
  
      if (!added) {
        return res.status(400).json({ message: "Chat not found" });
      }
  
      // Send back the updated chat with added users
      res.status(200).json(added);
    } catch (error) {
      res.status(500).json({ message: "Error adding members", error: error.message });
    }
  };
  

const removeMember = async(req,res) =>{
    try {
        const { chatId, userId } = req.body;
    
        // Use await to ensure the operation completes before moving on
        const removed = await Chat.findByIdAndUpdate(
          chatId,
          { $pull: { users: userId } }, // Add user to chat
          { new: true } // Return the updated document
        )
          .populate("users") // Populate users array
          .populate("groupAdmin"); // Populate group admin
    
        if (!removed) {
          return res.status(400).json({ message: "Chat not found" });
        }
    
        // Send back the updated chat with added users
        res.status(200).json(removed);
      } catch (error) {
        res.status(500).json({ message: "Error adding members", error: error.message });
      }
}

const createMessage = async(req,res) =>{
    const {content, chatId} = req.body;
    if(!content || !chatId){
        res.status(400).json({message:"send the content and chatId"})
    }
    var newMessage={
        sender:req.user._id,
        content:content,
        chat:chatId
    };

    try{
        var message = await Message.create(newMessage)

        message = await message.populate("sender");
        message = await message.populate("chat");
        message = await User.populate(message,{
            path:"chat.users"
        });

        await Chat.findByIdAndUpdate(req.body.chatId,{
            latestMessage:message,
        })
        res.status(200).json(message)
    }
    catch(error){
        res.status(500).json({message:"error", error})
    }
};

const getMessages = async (req,res) =>{
    const chatId = req.params.chatId;
    if(!chatId){
        res.status(400).json({message:"share the chatId"});
    }
    try{
        const message = await Message.find({chat:chatId})
        .populate("sender")
        .populate("chat");

        res.status(200).json(message);
    }
    catch(error){
        res.status(400).json({error})
    }
}

const UnseenCounterSync = async(req, res)=>{
    SyncUnseenCount();
    res.status(200).json("excuted");
}
const UnseenCount = async (req, res) => {
    const userId = req.user._id;
  
    try {
      // Fetch the unseen counts for the user
      const data = await ChatUser.find({ User_id: userId }); // Ensure the field name matches your schema
      console.log(userId);
      // Check if data is found
      if (!data) {
        return res.status(404).json({ message: "No unseen counts found for this user." });
      }
      // Return the unseen counts
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching unseen counts:", error);
      res.status(500).json({ message: "An error occurred while fetching unseen counts.", error: error.message });
    }
  };

  const seenChat = async(req,res) =>{
    const {chatId} = req.body;
    const userId = req.user._id;

  await ChatUser.updateOne(
        {ChatId:chatId,UserId:userId},
        {$set:{unseen_count:0}})
        await res.status(200).json("updated successfully")
  }


module.exports = { searchUser, Users, getChat, Chats, createGroupChat, renameGrp, addMembers, removeMember, createMessage, getMessages, UnseenCounterSync, UnseenCount, seenChat};
