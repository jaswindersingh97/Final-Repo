import React, { useState } from 'react';
import styles from './SearchOverlay.module.css';
import SearchUsersApi from '../api/SearchUsersApi';
import createChatApi from '../api/createChatApi';

function SearchOverlay({ closeSearch }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]); // State to store search results
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [noUsers, setNoUsers] = useState(false); // State to handle no users found case

  const token = localStorage.getItem("token");

  const onSearchClk = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when starting API call
    setError(null); // Reset any previous error
    setNoUsers(false); // Reset no users state
    try {
      const data = await SearchUsersApi({ token, search });
      if (data.users && data.users.length > 0) {
        setResults(data.users); // Assuming 'users' is the array in the response
      } else {
        setNoUsers(true); // If no users found
        setResults([])
      }
    } catch (error) {
      setError('Error fetching users');
    } finally {
      setLoading(false); // Set loading to false when the API call finishes
    }
  };

  const onChatClk = async(item) =>{
    const _id= item._id;
      const response = await createChatApi({token,_id});
      console.log(response);
      closeSearch();
  }

  return (
    <div className={styles.searchOverlay}>
      <div className={styles.searchContainerLeft}>
        <div className={styles.top}>
          <form onSubmit={onSearchClk}>
            <input
              type="text"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              placeholder="Search..."
              className={styles.searchInput}
            />
            <button type="submit">Search</button> {/* Changed to button tag */}
          </form>
        </div>
        <div className={styles.down}>
          {/* Show loading spinner or message when loading */}
          {loading && <p>Loading...</p>}

          {/* Show error message if any error occurred */}
          {error && <p className={styles.error}>{error}</p>}

          {/* Show message when no users found */}
          {noUsers && <p>No users found matching the query.</p>}

          {/* Map through results and display users */}
          {!loading && !error && results.length > 0 && results.map((item, index) => (
            <div key={index} onClick={()=>onChatClk(item)} className={styles.element}>
              <span>PP</span>
              <p>{item.name}</p> {/* Assuming 'name' is a field in the user data */}
              <div className={`${styles.status}
              ${item.isActive?styles.green:styles.red}`} > hh</div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.searchContainerRight} onClick={closeSearch}>
        {/* Clicking this will close the search window */}
      </div>
    </div>
  );
}

export default SearchOverlay;
