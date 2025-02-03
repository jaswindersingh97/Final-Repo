import axios from 'axios';

async function getPrevChats({ token }) {
  try {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${import.meta.env.VITE_API_URL}/secureRoute/chats`,
      headers: { 
        'Authorization': token
      }
    };
    
    const response = await axios.request(config); // Wait for the response
    return response.data; // Return the response data

  } catch (error) {
    return error.response ? error.response.data : { message: 'An error occurred', error: error.message }; // Handle errors
  }
}

export default getPrevChats;
