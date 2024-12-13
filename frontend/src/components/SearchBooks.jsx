import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SearchBooks = () => {
  const [searchQuery, setSearchQuery] = useState({
    title: '',
    author: '',
    genre: '',
    condition: '',
    ibsn: ''
  });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.get('/search_books', {
        params: searchQuery
      });
      setBooks(response.data.books || []);
    } catch (err) {
      setError('Failed to fetch books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
  };

  const handleSendMessage = () => {
    navigate('/inbox', { state: { receiverID: selectedBook.ownerid } });
  };

  return (
    <div className="container mt-5">
      <h2>Search Books</h2>
      <form onSubmit={handleSearch}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={searchQuery.title}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Author</label>
          <input
            type="text"
            className="form-control"
            name="author"
            value={searchQuery.author}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Genre</label>
          <input
            type="text"
            className="form-control"
            name="genre"
            value={searchQuery.genre}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Condition</label>
          <input
            type="text"
            className="form-control"
            name="condition"
            value={searchQuery.condition}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">ibsn</label>
          <input
            type="text"
            className="form-control"
            name="ibsn"
            value={searchQuery.ibsn}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {books.length > 0 && (
        <ul className="list-group mt-3">
          {books.map((book) => (
            <li key={book.ibsn} className="list-group-item">
              <button className="btn btn-link" onClick={() => handleBookClick(book)}>
                {book.title}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedBook && (
        <div className="mt-3">
          <h3>Book Details</h3>
          <p><strong>Title:</strong> {selectedBook.title}</p>
          <p><strong>Author:</strong> {selectedBook.author}</p>
          <p><strong>Genre:</strong> {selectedBook.genre}</p>
          <p><strong>ibsn:</strong> {selectedBook.ibsn}</p>
          <p><strong>Description:</strong> {selectedBook.description}</p>
          <p><strong>Owner ID:</strong> {selectedBook.ownerid}</p>
          <button className="btn btn-primary mt-3" onClick={handleSendMessage}>
            Send Message
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBooks;