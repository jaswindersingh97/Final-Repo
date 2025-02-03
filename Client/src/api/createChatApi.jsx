import axios from 'axios';

async function createChatApi({ token, _id }) {
  let data = JSON.stringify({
    userId: _id
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${import.meta.env.VITE_API_URL}/secureRoute/chat/`,
    headers: { 
      Authorization: token,
      'Content-Type': 'application/json'
    },
    data: data
  };

  try {
    const response = await axios.request(config);
    return response.data; // Return the response data
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error; // Re-throw the error for further handling
  }
}

export default createChatApi;
