import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './bargain.css';

const Bargain = () => {
  const [sentBargains, setSentBargains] = useState([]);
  const [receivedBargains, setReceivedBargains] = useState([]);
  const [userBooks, setUserBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [selectedSentBargain, setSelectedSentBargain] = useState('');
  const [selectedReceivedBargain, setSelectedReceivedBargain] = useState('');
  const [selectedUserBook, setSelectedUserBook] = useState(null);
  const [selectedAvailableBook, setSelectedAvailableBook] = useState(null);
  const [message, setMessage] = useState('');
  const [expandedBookId, setExpandedBookId] = useState(null);

  useEffect(() => {
    axios.get('/retrieve_bargains')
      .then(response => {
        setSentBargains(response.data.transactions_sent);
        setReceivedBargains(response.data.transactions_received);
      })
      .catch(error => console.error('Error fetching bargains:', error));

    axios.get('/list_user_books')
      .then(response => setUserBooks(response.data.books))
      .catch(error => console.error('Error fetching user books:', error));

    axios.get('/search_books')
      .then(response => setAvailableBooks(response.data.books))
      .catch(error => console.error('Error fetching available books:', error));
  }, []);

  const handleAcceptBargain = (bargainId) => {
    axios.post('/accept_bargain', { transaction_id: bargainId })
      .then(response => {
        setMessage('Bargain accepted successfully!');
      })
      .catch(error => {
        console.error('Error accepting bargain:', error);
        setMessage('Error accepting bargain.');
      });
  };

  const handleCreateBargain = () => {
    const data = {
      desired_book: selectedAvailableBook,
      user_book: selectedUserBook,
      receiver_id: selectedAvailableBook.ownerid
    };

    axios.post('/bargain_invitation', data)
      .then(response => {
        setMessage('Bargain created successfully!');
      })
      .catch(error => {
        console.error('Error creating bargain:', error);
        setMessage('Error creating bargain.');
      });
  };

  const handleFinalizeBargain = (bargainId) => {
    axios.post('/finalize_bargain', { transaction_id: bargainId })
      .then(response => {
        setMessage('Bargain finalized successfully!');
      })
      .catch(error => {
        console.error('Error finalizing bargain:', error);
        setMessage('Error finalizing bargain.');
      });
  };

  const handleBookClick = (bookId) => {
    setExpandedBookId(expandedBookId === bookId ? null : bookId);
  };

  const acceptedBargains = [...sentBargains, ...receivedBargains].filter(bargain => bargain.status === 'in progress');

  return (
    <div className="bargain-container">
      <h2>Bargain Requests</h2>
      {message && <p className="message">{message}</p>}
      <div className="bargain-section">
        <h3>Sent Bargains</h3>
        <select value={selectedSentBargain} onChange={(e) => setSelectedSentBargain(e.target.value)}>
          <option value="">Select a sent bargain</option>
          {sentBargains.map(bargain => (
            <option key={bargain.transactionid} value={bargain.transactionid}>
              {bargain.title}
            </option>
          ))}
        </select>
      </div>
      <div className="bargain-section">
        <h3>Received Bargains</h3>
        <select value={selectedReceivedBargain} onChange={(e) => setSelectedReceivedBargain(e.target.value)}>
          <option value="">Select a received bargain</option>
          {receivedBargains.map(bargain => (
            <option key={bargain.transactionid} value={bargain.transactionid}>
              {bargain.title} (Receiver ID: {bargain.receiverid})
            </option>
          ))}
        </select>
        <button onClick={() => handleAcceptBargain(selectedReceivedBargain)}>Accept Bargain</button>
      </div>
      <div className="bargain-section">
        <h3>Create Bargain</h3>
        <div>
          <label>Select a book you want to receive:</label>
          <select value={selectedAvailableBook ? selectedAvailableBook.bookid : ''} onChange={(e) => setSelectedAvailableBook(availableBooks.find(book => book.bookid === parseInt(e.target.value)))}>
            <option value="">Select a book</option>
            {availableBooks.map(book => (
              <option key={book.bookid} value={book.bookid}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Select one of your books to send:</label>
          <select value={selectedUserBook ? selectedUserBook.bookid : ''} onChange={(e) => setSelectedUserBook(userBooks.find(book => book.bookid === parseInt(e.target.value)))}>
            <option value="">Select a book</option>
            {userBooks.map(book => (
              <option key={book.bookid} value={book.bookid}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleCreateBargain}>Create Bargain</button>
      </div>
      <div className="bargain-section">
        <h3>Accepted Bargains</h3>
        <ul>
          {acceptedBargains.map(bargain => (
            <li key={bargain.transactionid} onClick={() => handleBookClick(bargain.transactionid)}>
              {bargain.title}
              {expandedBookId === bargain.transactionid && (
                <div className="book-details">
                  <p><strong>Bargain Status:</strong> {bargain.status}</p>
                  <p><strong>Receiver ID:</strong> {bargain.receiverid}</p>
                  <button onClick={() => handleFinalizeBargain(bargain.transactionid)}>Finalize Bargain</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Bargain;