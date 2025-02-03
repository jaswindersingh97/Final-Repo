import React, { useEffect, useState } from 'react';
import styles from './ChatPage.module.css';
import SearchOverlay from '../components/SearchOverlay'; 
import Right from '../components/Right';
import { useAuth } from '../context/AuthContext';
import { connectSocket, disconnectSocket, joinRoom,onNewMessage ,removeNewMessage} from '../Sockets/socketService'; 

function ChatPage() {
  const {
    token,  
    searchVisible,
    toggleSearch, 
    selectedChat, 
    setSelectedChat,
    fetchChats, 
    prevChats,
    prevChatsName,
    setPrevChats,
  } = useAuth(); 
 
  useEffect(() => { 
    fetchChats(); 
  }, [searchVisible]);

  
  useEffect(() => { 
    connectSocket(import.meta.env.VITE_API_URL, token);
    return () => {
      disconnectSocket(); 
    };
  }, [token]);

  useEffect(()=>{
    const handleChat = (data) => {
      const updatePrevChats = (updatedChat) => {
        setPrevChats(prevChats => {
          const filteredChats = prevChats.filter(chat => chat._id !== updatedChat._id);
          return [updatedChat,...filteredChats ];
        });
      };
      updatePrevChats(data);
    };

    onNewMessage(handleChat);
    return () => {
      removeNewMessage(handleChat);
    };
  })

  const selectChat = ({ _id, name }) => {
    setSelectedChat({ _id, name });
    joinRoom(_id);  
  };

  return (
    <div className={styles.container}>
      {searchVisible && <SearchOverlay closeSearch={toggleSearch} />}
      <div className={styles.header}>
        <button onClick={toggleSearch}>SearchBar</button>
        <h1>ChatApp</h1>
        <button>Profile</button>
      </div>
      <div className={styles.body}>
        <div className={styles.left}>
          <div className={styles.leftheader}>
            <p>MY CHATS</p>
          </div>
          <div className={styles.leftbody}>
            {prevChats.map((chat, index) => (
              <div 
                key={chat._id} 
                onClick={() => selectChat(prevChatsName[index])} 
                className={`${styles.ele} ${chat._id === selectedChat._id && styles.selected }`}>
                <h2>{prevChatsName[index] ? prevChatsName[index].name : 'Loading...'}</h2>
                <div>
                  <span>{chat.latestMessage ? chat.latestMessage.sender.name : "No Sender"}</span>
                  <p>{chat.latestMessage ? chat.latestMessage.content : "No messages yet"}</p>
                </div>
                <div className={styles.unseenCounter}>
                  {chat.unseen_count>0 && <span>{chat.unseen_count}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.right}>
          {selectedChat ? (
            <Right/> 
          ) : (
            <div style={{ display: 'flex', padding: "20px" }}>
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default ChatPage;
