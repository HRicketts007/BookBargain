import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const Messaging = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [inbox, setInbox] = useState([]);
  const [messageForm, setMessageForm] = useState({
    receiver_id: '',
    content: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch inbox messages on component mount
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get('/get_messages', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setInbox(response.data.messages || []);
      } catch (err) {
        console.error('Failed to fetch inbox:', err);
      }
    };

    fetchInbox();
  }, []);

  // Set recipient ID from location state if available
  useEffect(() => {
    if (location.state && location.state.receiverID) {
      setMessageForm((prev) => ({ ...prev, receiver_id: location.state.receiverID }));
    }
  }, [location.state]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMessageForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle message sending
  const handleSendMessage = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const authToken = localStorage.getItem('authToken');
      await axios.post('/send_message', { data: messageForm }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
      });
      setSuccess('Message sent successfully!');
      setMessageForm({ receiver_id: '', content: '' }); // Reset form
    } catch (err) {
      console.error('Failed to send message:', err);
      console.log('Request data:', messageForm);
      if (err.response) {
        console.log('Error response data:', err.response.data);
      }
      setError('Failed to send message. Please try again.');
    }
  };

  // Handle navigation to bargain page
  const handleNavigateToBargain = () => {
    navigate('/bargain');
  };

  return (
    <div className="container mt-4">
      <h1>Messaging</h1>

      {/* Inbox Section */}
      <section className="inbox">
        <h2>Inbox</h2>
        {inbox.length > 0 ? (
          <ul className="list-group">
            {inbox.map((message) => (
              <li key={message.messageid} className="list-group-item">
                <strong>From:</strong> {message.senderid} <br />
                <p>{message.contents}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No messages in your inbox.</p>
        )}
      </section>

      <hr />

      {/* Send Message Section */}
      <section className="send-message">
        <h2>Send a Message</h2>
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSendMessage}>
          <div className="mb-3">
            <label htmlFor="recipientId" className="form-label">
              Recipient ID
            </label>
            <input
              type="text"
              id="recipientId"
              name="receiver_id"
              className="form-control"
              value={messageForm.receiver_id}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="content" className="form-label">
              Message
            </label>
            <textarea
              id="content"
              name="content"
              className="form-control"
              rows="4"
              value={messageForm.content}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Send Message
          </button>
        </form>
      </section>

      <hr />

      {/* Bargain Button */}
      <section className="bargain-button">
        <button className="btn btn-secondary" onClick={handleNavigateToBargain}>
          Bargain
        </button>
      </section>
    </div>
  );
};

export default Messaging;