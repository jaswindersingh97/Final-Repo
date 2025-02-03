import axios from 'axios';

function authApi({ endpoints, user }) {
    
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${import.meta.env.VITE_API_URL}/auth${endpoints}`,  // Dynamically include endpoint
      headers: { 
        'Content-Type': 'application/json'
      },
      data: user  // Send the user data in the request body
    };
    
    // Return the axios request (this will return a promise)
    return axios.request(config)
      .then((response) => {
        return response.data;  // Return response data for further use
      })
      .catch((error) => {
        console.log(error);
        throw error;  // Rethrow error for handling in the caller function
      });
}

export default authApi;
