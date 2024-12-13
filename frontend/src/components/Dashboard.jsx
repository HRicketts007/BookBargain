import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axios.get('/list_books')
      .then(response => setBooks(response.data.books))
      .catch(error => console.error('Error fetching books:', error));
  }, []);

  return (
    <div className="container mt-5">
      <h1>Book Bargain</h1>
      <h2>My Dashboard</h2>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/add-book">Add Book</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search">Search Books</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/account">View Account</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/inbox">Inbox</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/bargain">Bargain</Link>
            </li>
          </ul>
        </div>
      </nav>
      {/* Add any other dashboard-specific content here */}
    </div>
  );
};

export default Dashboard;