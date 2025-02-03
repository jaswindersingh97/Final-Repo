import React, { useEffect, useState, useRef, Fragment } from 'react';
import senticon from './../assets/senticon.png';
import style from './Right.module.css';
import getMessage from '../api/getMessage';
import { useAuth } from '../context/AuthContext';
import { sendMessage, onMessageReceived, removeMessageListener } from '../Sockets/socketService';

function Right() {
  const { token, currentUserId, selectedChat, chats, setChats, prevChats } = useAuth();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { _id, name } = selectedChat || {};
  const [unseenCount, setUnseenCount] = useState(0);
  const chatContainerRef = useRef(null); // Ref to the chat window container
  const firstUnseenMessageRef = useRef(null); // Ref for first unseen message

  // Get unseen count from previous chats
  const getUnseenCount = () => {
    const chat = prevChats.find(item => item._id === selectedChat._id);
    if (chat) {
      setUnseenCount(chat.unseen_count || 0);
    }
  };

  useEffect(() => {
    if (_id) {
      getUnseenCount(); // Update unseen count
      setLoading(true); // Start loading before fetching chats
      getChats(); // Fetch messages when the chat is selected
    }
  }, [_id]); // Refetch when selected chat changes

  const getChats = async () => {
    try {
      const data = await getMessage({ chatId: _id, token });
      setChats(data || []);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    } finally {
      setLoading(false); // Set loading to false after fetching chats
    }
  };

  // Function to scroll to the first unseen message or the last message
  const scrollToPosition = () => {
    if (unseenCount > 0 && firstUnseenMessageRef.current) {
      // Scroll to first unseen message if it exists
      firstUnseenMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Scroll to the bottom (last message) if no unseen messages
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (!loading) {
      scrollToPosition(); // Scroll to correct position after messages load
    }
  }, [loading, chats]); // Trigger on messages load or when loading changes

  useEffect(() => {
    const handleMessage = (data) => {
      // Ensure the message is for the currently selected chat
      if (data && data.chat === _id) {
        setChats((prevChats) => [...prevChats, data]); // Append the new message
        scrollToPosition(); // Scroll to bottom when a new message is received
        setUnseenCount(0); // Clear unseen count after a new message is received
      }
    };

    // Attach the message listener
    onMessageReceived(handleMessage);

    // Cleanup function to remove the listener
    return () => {
      removeMessageListener(handleMessage); // Remove the listener
    };
  }, [_id]); // Handle chat-specific messages

  const onKeysDown = (e) => {
    if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey)) {
      onFormSubmit(e);
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return; // Prevent sending empty messages

    try {
      sendMessage(_id, message); // Send message via socket
      setMessage(""); // Clear input after sending
      setUnseenCount(0); // Clear unseen count after sending a message
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <div className={style.container}><p>Loading chats...</p></div>;
  }

  return (
    <div className={style.container}>
      <div className={style.header}>
        <h1>{name || "Select a chat"}</h1>
      </div>
      <div 
        className={style.content} 
        ref={chatContainerRef} // Ref to chat container
      >
        {chats.length > 0 ? (
          chats.map((item, index) => (
            <Fragment 
            key={index}> {/* Moved key to Fragment */}
              {unseenCount > 0 && index === chats.length - unseenCount && <h1 className={style.newMessage}>New Messages</h1>}
              <div
                ref={unseenCount > 0 && index === chats.length - unseenCount ? firstUnseenMessageRef : null} // Ref to first unseen message
                className={`${style.element} ${item.sender._id === currentUserId ? style.sent : style.received}`}
              >
                <p>{item.content}</p>
                <span>{formatDate(item.updatedAt)}</span>
              </div>
            </Fragment>
          ))
        ) : (
          <p>No messages yet</p>
        )}
      </div>
      <div className={style.messageContainer}>
        <form onSubmit={onFormSubmit}>
          <textarea
            onKeyDown={onKeysDown}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit">
            <img src={senticon} alt="send" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Right;
