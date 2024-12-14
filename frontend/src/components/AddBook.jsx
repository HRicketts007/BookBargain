import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddBook.css';

const AddBook = () => {
  const [IBSN, setIBSN] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/add_book', {
        IBSN,
        title,
        author,
        genre,
        condition,
        description,
      });

      alert('Book added successfully!');
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error.response ? error.response.data : 'Failed to add book');
    }
  };

  return (
    <div className="addbook-container">
      <div className="addbook-header">
        <h1>Add a Book</h1>
      </div>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div className="addbook-section">
          <label className="form-label">IBSN</label>
          <input
            type="text"
            className="form-control"
            value={IBSN}
            onChange={(e) => setIBSN(e.target.value)}
            required
          />
        </div>

        <div className="addbook-section">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="addbook-section">
          <label className="form-label">Author</label>
          <input
            type="text"
            className="form-control"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </div>

        <div className="addbook-section">
          <label className="form-label">Genre</label>
          <input
            type="text"
            className="form-control"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
          />
        </div>

        <div className="addbook-section">
          <label className="form-label">Condition</label>
          <input
            type="text"
            className="form-control"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
          />
        </div>

        <div className="addbook-section">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
          ></textarea>
        </div>

        <div className="addbook-section">
          <button type="submit" className="btn btn-primary">
            Add Book
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBook;