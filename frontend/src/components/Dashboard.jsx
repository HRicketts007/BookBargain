import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axios.get('/list_books')
      .then(response => setBooks(response.data.books))
      .catch(error => console.error('Error fetching books:', error));
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Book Bargain</h1>
        <div className="user-info">
          <span>John Doe</span>
        </div>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <ul>
            <li><Link to="/add-book">Add Book</Link></li>
            <li><Link to="/search">Search Books</Link></li>
            <li><Link to="/account">View Account</Link></li>
            <li><Link to="/inbox">Inbox</Link></li>
            <li><Link to="/bargain">Bargain</Link></li>
          </ul>
        </div>
        <div className="dashboard-main">
          <h2>My Dashboard</h2>
          {/* Add any other dashboard-specific content here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;