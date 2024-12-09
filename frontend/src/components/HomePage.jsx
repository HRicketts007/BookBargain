import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('authToken');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="container text-center mt-5">
      <h1>Welcome to Book-Bargain</h1>
      <p>Your community for exchanging books effortlessly!</p>
      <div className="row mt-4">
        <div className="col-md-6">
          <h3>Login</h3>
          <p>Already have an account? Click below to login.</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
        <div className="col-md-6">
          <h3>Register</h3>
          <p>New to Book-Bargain? Click below to register.</p>
          <Link to="/register" className="btn btn-secondary">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;