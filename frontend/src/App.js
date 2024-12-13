import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AddBook from './components/AddBook';
import SearchBooks from './components/SearchBooks';
import Navbar from './components/Navbar';
import Inbox from './components/Inbox';
import Account from './components/Account';
import Bargain from './components/bargain';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('authToken'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/add-book" element={isAuthenticated ? <AddBook /> : <Navigate to="/login" />} />
        <Route path="/search" element={<SearchBooks />} />
        <Route path="/inbox" element={isAuthenticated ? <Inbox /> : <Navigate to="/login" />} />
        <Route path="/account" element={isAuthenticated ? <Account /> : <Navigate to="/login" />} />
        <Route path="/bargain" element={isAuthenticated ? <Bargain /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;