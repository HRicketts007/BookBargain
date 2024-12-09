import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('authToken'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('authToken'));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigate('/homepage'); // Redirect to homepage after logout
  };

  if (!isAuthenticated || location.pathname === '/dashboard') {
    return null; // Do not render the Navbar if not authenticated or on the dashboard page
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        {isAuthenticated ? (
          <span className="navbar-brand">Book-Bargain</span>
        ) : (
          <Link className="navbar-brand" to="/">Book-Bargain</Link>
        )}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </li>
            <li className={`nav-item ${location.pathname === '/search' ? 'active' : ''}`}>
              <Link className="nav-link" to="/search">Search Books</Link>
            </li>
            <li className={`nav-item ${location.pathname === '/add-book' ? 'active' : ''}`}>
              <Link className="nav-link" to="/add-book">Add Book</Link>
            </li>
            <li className={`nav-item ${location.pathname === '/inbox' ? 'active' : ''}`}>
              <Link className="nav-link" to="/inbox">Inbox</Link>
            </li>
            <li className={`nav-item ${location.pathname === '/account' ? 'active' : ''}`}>
              <Link className="nav-link" to="/account">Account</Link>
            </li>
            <li className="nav-item">
              <button className="nav-link" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;