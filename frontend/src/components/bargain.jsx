import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Bargain = () => {
  const [sentBargains, setSentBargains] = useState([]);
  const [receivedBargains, setReceivedBargains] = useState([]);
  const [userBooks, setUserBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [selectedSentBargain, setSelectedSentBargain] = useState('');
  const [selectedReceivedBargain, setSelectedReceivedBargain] = useState('');
  const [selectedUserBook, setSelectedUserBook] = useState('');
  const [selectedAvailableBook, setSelectedAvailableBook] = useState('');

  useEffect(() => {
    // Fetch sent and received bargains
    axios.get('/retrieve_bargains')
      .then(response => {
        setSentBargains(response.data.transactions_sent);
        setReceivedBargains(response.data.transactions_received);
      })
      .catch(error => console.error('Error fetching bargains:', error));

    // Fetch user's books
    axios.get('/list_user_books')
      .then(response => setUserBooks(response.data.books))
      .catch(error => console.error('Error fetching user books:', error));

    // Fetch available books
    axios.get('/search_books')
      .then(response => setAvailableBooks(response.data.books))
      .catch(error => console.error('Error fetching available books:', error));
  }, []);

  const handleAcceptBargain = (bargainId) => {
    axios.post(`/accept_bargain/${bargainId}`)
      .then(response => {
        console.log('Bargain accepted:', response.data);
        // Optionally, update the UI or state here
      })
      .catch(error => console.error('Error accepting bargain:', error));
  };

  const handleCreateBargain = () => {
    const data = {
      desired_book: selectedAvailableBook,
      user_book: selectedUserBook,
      receiver_id: selectedReceivedBargain // Assuming receiver_id is the same as selectedReceivedBargain
    };

    axios.post('/bargain_invitation', data)
      .then(response => {
        console.log('Bargain created:', response.data);
        // Optionally, update the UI or state here
      })
      .catch(error => console.error('Error creating bargain:', error));
  };

  return (
    <div>
      <h2>Bargain Requests</h2>
      <div>
        <h3>Sent Bargains</h3>
        <select value={selectedSentBargain} onChange={(e) => setSelectedSentBargain(e.target.value)}>
          <option value="">Select a sent bargain</option>
          {sentBargains.map(bargain => (
            <option key={bargain.transactionid} value={bargain.transactionid}>
              {bargain.description}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h3>Received Bargains</h3>
        <select value={selectedReceivedBargain} onChange={(e) => setSelectedReceivedBargain(e.target.value)}>
          <option value="">Select a received bargain</option>
          {receivedBargains.map(bargain => (
            <option key={bargain.transactionid} value={bargain.transactionid}>
              {bargain.description}
            </option>
          ))}
        </select>
        <button onClick={() => handleAcceptBargain(selectedReceivedBargain)}>Accept Bargain</button>
      </div>
      <div>
        <h3>Create Bargain</h3>
        <div>
          <label>Select a book you want to receive:</label>
          <select value={selectedAvailableBook} onChange={(e) => setSelectedAvailableBook(e.target.value)}>
            <option value="">Select a book</option>
            {availableBooks.map(book => (
              <option key={book.IBSN} value={book.IBSN}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Select one of your books to send:</label>
          <select value={selectedUserBook} onChange={(e) => setSelectedUserBook(e.target.value)}>
            <option value="">Select a book</option>
            {userBooks.map(book => (
              <option key={book.IBSN} value={book.IBSN}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleCreateBargain}>Create Bargain</button>
      </div>
    </div>
  );
};

export default Bargain;