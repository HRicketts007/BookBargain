import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Account = () => {
  const [userData, setUserData] = useState(null);
  const [userBooks, setUserBooks] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/user_data', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchUserBooks = async () => {
      try {
        const response = await axios.get('/list_user_books', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        setUserBooks(response.data.books || []);
      } catch (error) {
        console.error('Error fetching user books:', error);
      }
    };

    fetchUserData();
    fetchUserBooks();
  }, []);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <h1>Account Information</h1>
      <p><strong>User ID:</strong> {userData.user_id}</p>
      <p><strong>Name:</strong> {userData.name}</p>
      <p><strong>Phone Number:</strong> {userData.phone}</p>
      <p><strong>Address:</strong> {userData.address}</p>
      <h2>Books Added</h2>
      <ul>
        {userBooks.length > 0 ? (
          userBooks.map(book => (
            <li key={book.ibsn}>{book.title}</li>
          ))
        ) : (
          <li>No books added</li>
        )}
      </ul>
    </div>
  );
};

export default Account;