import axios from "axios";

const SearchUsersApi = async ({ token, search }) => {
  try {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${import.meta.env.VITE_API_URL}/secureRoute/search/?query=${search}`,
      headers: { 
        'Authorization': `${token}` // Ensure the token is properly formatted
      }
    };
    
    const response = await axios.request(config);
    return response.data; // Return the response data to the caller
  } catch (error) {
    throw error; // Throw the error to handle it in the caller function
  }
};

export default SearchUsersApi;
