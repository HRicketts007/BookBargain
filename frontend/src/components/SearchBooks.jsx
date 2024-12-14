import React, { useState } from 'react';
import axios from 'axios';
import './SearchBooks.css';

const SearchBooks = () => {
  const [searchQuery, setSearchQuery] = useState({
    title: '',
    author: '',
    genre: '',
    condition: '',
    ibsn: '',
  });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [externalBookDetails, setExternalBookDetails] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/search_books', { params: searchQuery });
      setBooks(response.data.books);
    } catch (err) {
      setError('No Books found! Please try a different search.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = async (book) => {
    setSelectedBook(book);
    try {
      const response = await axios.get('/fetch_book_details', { params: { ibsn: book.ibsn } });
      setExternalBookDetails(response.data);
    } catch (err) {
      setExternalBookDetails(null);
    }
  };

  return (
    <div className="searchbooks-container">
      <div className="searchbooks-header">
        <h1>Search Books</h1>
      </div>
      <form onSubmit={handleSearch}>
        <div className="searchbooks-section">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={searchQuery.title}
            onChange={handleInputChange}
          />
        </div>
        <div className="searchbooks-section">
          <label className="form-label">Author</label>
          <input
            type="text"
            className="form-control"
            name="author"
            value={searchQuery.author}
            onChange={handleInputChange}
          />
        </div>
        <div className="searchbooks-section">
          <label className="form-label">Genre</label>
          <input
            type="text"
            className="form-control"
            name="genre"
            value={searchQuery.genre}
            onChange={handleInputChange}
          />
        </div>
        <div className="searchbooks-section">
          <label className="form-label">Condition</label>
          <input
            type="text"
            className="form-control"
            name="condition"
            value={searchQuery.condition}
            onChange={handleInputChange}
          />
        </div>
        <div className="searchbooks-section">
          <label className="form-label">IBSN</label>
          <input
            type="text"
            className="form-control"
            name="ibsn"
            value={searchQuery.ibsn}
            onChange={handleInputChange}
          />
        </div>
        <div className="searchbooks-section">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
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
        <div className="book-details mt-3">
          <h3>Book Details</h3>
          <p><strong>Title:</strong> {selectedBook.title}</p>
          <p><strong>Author:</strong> {selectedBook.author}</p>
          <p><strong>Genre:</strong> {selectedBook.genre}</p>
          <p><strong>IBSN:</strong> {selectedBook.ibsn}</p>
          <p><strong>Description:</strong> {selectedBook.description}</p>
          <p><strong>Owner ID:</strong> {selectedBook.ownerid}</p>
          {externalBookDetails && (
            <>
              <p><strong>Publisher:</strong> {externalBookDetails.publisher}</p>
              <p><strong>Published Date:</strong> {externalBookDetails.publishedDate}</p>
              <p><strong>Page Count:</strong> {externalBookDetails.pageCount}</p>
              <p><strong>Categories:</strong> {externalBookDetails.categories.join(', ')}</p>
              {externalBookDetails.thumbnail && (
                <img src={externalBookDetails.thumbnail} alt="Book Cover" />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBooks;