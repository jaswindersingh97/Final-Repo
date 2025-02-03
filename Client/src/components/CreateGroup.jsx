import React, { useEffect, useState, useCallback } from 'react';
import styles from './CreateGroup.module.css';
import { useAuth } from './../context/AuthContext'; 
import SearchUsersApi from './../api/SearchUsersApi';
import createGroupChat from '../api/createGroupChat';

function CreateGroup() {
    const { token,setShowGroup } = useAuth();
    const [groupName, setGroupName] = useState("");
    const [search, setSearch] = useState("");
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]); // Fix naming consistency
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounced search to avoid API call on every keystroke
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search.trim()) {
                getSearchData();
            } else {
                setSearchedUsers([]); // Clear search results when search field is empty
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId); // Clean up timeout on unmount
    }, [search]);

    const onUserDeselect = (item) => {
        setSelectedUsers((prevUsers) => prevUsers.filter(user => user._id !== item._id));
    };

    const onUserSelect = (item) => {
        if (!selectedUsers.some(user => user._id === item._id)) {
            setSelectedUsers((prevUsers) => [...prevUsers, item]);
        }
    };

    const getSearchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await SearchUsersApi({ token, search });
            setSearchedUsers(data.users || []);
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to search users");
        }
        setLoading(false);
    };

    const onFieldChange = (e) => {
        const { name, value } = e.target;
        if (name === 'groupName') {
            setGroupName(value);
        } else if (name === 'search') {
            setSearch(value);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!groupName.trim() || selectedUsers.length === 0) {
            setError("Please enter a group name and select at least one user.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await createGroupChat({
                users: selectedUsers.map(user => user._id),
                groupName,
                token
            });
            console.log("Group created:", response.data);
            setShowGroup(false)
            // You can add a redirect or UI update after group creation
        } catch (error) {
            console.error("Error creating group chat:", error);
            setError("Failed to create group chat.");
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}> 
            <form className={styles.form} onSubmit={submitHandler}>
                <div className={styles.heading}>
                    <p>Create Group Chat</p>
                    <button onClick={()=>setShowGroup(false)}>X</button>
                </div>
                <div className={styles.textfields}>
                    <input
                        type="text"
                        value={groupName}
                        onChange={onFieldChange}
                        name="groupName"
                        placeholder="Enter the group name"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={onFieldChange}
                        name="search"
                        placeholder="Search for members"
                    />
                </div>
                <div className={styles.selectedMembers}>
                    {selectedUsers.map((user, index) => (
                        <div
                            key={index}
                            onClick={() => onUserDeselect(user)}
                            className={styles.selectedMember}
                        >
                            <span>{user.name} x</span>
                        </div>
                    ))}
                </div>
                <div className={styles.searchedMembers}>
                    {loading && <p>Loading...</p>}
                    {error && <p className={styles.error}>{error}</p>}
                    {searchedUsers.length > 0 ? (
                        searchedUsers.slice(0,4).map((user, index) => (
                            <div
                                key={index}
                                onClick={() => onUserSelect(user)}
                                className={styles.searchedMember}
                            >
                                <span>{user.name}</span>
                                <p>{user.email}</p>
                            </div>
                        ))
                    ) : (
                        search && !loading && <p>No users found</p>
                    )}
                </div>
                <div >
                <button className={styles.button} type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Chat"}
                </button>
                </div>
                
            </form>
        </div>
    );
}

export default CreateGroup;
