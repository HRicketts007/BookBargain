import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Account.css';

const Account = () => {
  const [userData, setUserData] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const [expandedBookId, setExpandedBookId] = useState(null);

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

  const handleBookClick = (bookId) => {
    setExpandedBookId(expandedBookId === bookId ? null : bookId);
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>Account Information</h1>
      </div>
      <div className="account-section">
        <p><strong>User ID:</strong> {userData.user_id}</p>
        <p><strong>Name:</strong> {userData.name}</p>
        <p><strong>Phone Number:</strong> {userData.phone}</p>
        <p><strong>Address:</strong> {userData.address}</p>
      </div>
      <div className="account-section">
        <h3>Books Added</h3>
        <ul>
          {userBooks.length > 0 ? (
            userBooks.map(book => (
              <li key={book.bookid} onClick={() => handleBookClick(book.bookid)}>
                {book.title}
                {expandedBookId === book.bookid && (
                  <div className="book-details">
                    <p><strong>IBSN:</strong> {book.ibsn}</p>
                    <p><strong>Author:</strong> {book.author}</p>
                    <p><strong>Genre:</strong> {book.genre}</p>
                    <p><strong>Description:</strong> {book.description}</p>
                    <p><strong>Availability:</strong> {book.availability}</p>
                    <p><strong>Condition:</strong> {book.condition}</p>

                  </div>
                )}
              </li>
            ))
          ) : (
            <li>No books added</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Account;