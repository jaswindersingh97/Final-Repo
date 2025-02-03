import React, { createContext, useState, useContext, useEffect } from 'react';
import isTokenValid from '../utils/isTokenValid';
import getPrevChats from '../api/chatGroups';

// Create context
const AuthContext = createContext();

// Create provider component
export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const isTokenValidContext = () => {
    return isTokenValid();
  };

  const [currentUserId,setCurrentUserId] = useState(localStorage.getItem("id") || '');

  const [searchVisible, setSearchVisible] = useState(false); // show / hide the search  bar 

  const [selectedChat, setSelectedChat] = useState(""); // to share the selected chat

  const [prevChats, setPrevChats] = useState([]); // get the chat menu at time of login

  const [prevChatsName, setPrevChatsName] = useState([]);
  
  const [chats, setChats] = useState([]);

  const [showGroup, setShowGroup] = useState(false);  

  // Fetch previous chats
  const fetchChats = async () => {
    try {
      const data = await getPrevChats({ token });
      setPrevChats(data);
      const chatNames = generateChatNames(data);
      setPrevChatsName(chatNames);
    } catch (error) {
      console.error('Error fetching previous chats:', error);
    }
  };
  
  const generateChatNames = (array) => {
    return array.map((item) => {
      if (item.isGroupChat) {
        return { _id: item._id, name: item.chatName };
      } else {
        const user = item.users.find((user) => user._id !== currentUserId);
        return { _id: item._id, name: user ? user.name : "Unknown User" };
      }
    });
  };


  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };


  const value = {
    token,
    setToken,
    currentUserId,
    setCurrentUserId,
    isTokenValid: isTokenValidContext,
    searchVisible,
    setSearchVisible,
    selectedChat, 
    setSelectedChat,
    prevChats, 
    setPrevChats,
    prevChatsName, 
    setPrevChatsName,
    toggleSearch,
    fetchChats,
    generateChatNames,
    chats, 
    setChats,
    showGroup, 
    setShowGroup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
