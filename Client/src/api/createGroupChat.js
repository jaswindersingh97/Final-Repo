import axios from "axios";

async function createGroupChat({ users, groupName, token }) {
    try {
        let data = JSON.stringify({
            users: users,
            name: groupName
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${import.meta.env.VITE_API_URL}/secureRoute/gChat`,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token
            },
            data: data
        };

        const response = await axios.request(config);
        console.log("Group chat created:", response.data);
        return response.data; // Return the response data if needed
    } catch (error) {
        console.error("Error creating group chat:", error.response ? error.response.data : error.message);
        throw error; // Re-throw the error for further handling if needed
    }
}

export default createGroupChat;
