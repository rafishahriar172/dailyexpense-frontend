// src/pages/ConfirmEmail.js
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ConfirmEmail = () => {
  const [message, setMessage] = useState('Verifying your email...');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    const confirmEmail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/auth/confirm-email?token=${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setMessage(data.message);
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setMessage('Invalid or expired confirmation link.');
        }
      } catch (error) {
        setMessage('Error confirming email. Please try again.');
      }
    };

    if (token) {
      confirmEmail();
    } else {
      setMessage('No confirmation token provided.');
    }
  }, [location, navigate]);

  return (
    <div>
      <h1>Email Confirmation</h1>
      <p>{message}</p>
    </div>
  );
};

export default ConfirmEmail;