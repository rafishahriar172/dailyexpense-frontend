// src/app/confirm/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Container,
  Typography,
  CircularProgress,
  Button,
  Alert,
  AlertTitle,
  Box
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ConfirmEmail = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  useEffect(() => {
    document.title = "Confirm Email - Daily Expense";
    if (!token) {
      setStatus('error');
      setMessage('No confirmation token provided in the URL.');
      return;
    }

    const confirmEmail = async () => {
      try {
        const response = await axios.post(`/api/auth/confirm-email?token=${token}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          validateStatus: (status: number) => status < 500
        });

        if (response.status >= 200 && response.status < 300) {
          setStatus('success');
          setMessage(response.data?.message || 'Email successfully verified!');
          setTimeout(() => router.push('/auth/login'), 5000);
        } else {
          setStatus('error');
          setMessage(response.data?.message || 'Invalid or expired confirmation link.');
        }
      } catch (error) {
        setStatus('error');

        if (axios.isAxiosError(error)) {
          if (error.response) {
            setMessage(error.response.data?.message || 'Email verification failed.');
          } else if (error.request) {
            setMessage('Network error. Please check your connection and try again.');
          } else {
            setMessage('Error setting up email verification request.');
          }
        } else {
          setMessage('An unexpected error occurred. Please try again.');
        }

        console.error('Email confirmation error:', error);
      }
    };

    confirmEmail();
  }, [token, router]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              {message}
            </Typography>
          </Box>
        );
      case 'success':
        return (
          <Alert
            severity="success"
            icon={<CheckCircleOutlineIcon fontSize="large" />}
            sx={{ mb: 3, textAlign: 'left' }}
          >
            <AlertTitle>Email Verified Successfully!</AlertTitle>
            {message}
            <Typography variant="body2" sx={{ mt: 1 }}>
              You will be redirected to login in 5 seconds...
            </Typography>
          </Alert>
        );
      case 'error':
        return (
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon fontSize="large" />}
            sx={{ mb: 3, textAlign: 'left' }}
          >
            <AlertTitle>Email Verification Failed</AlertTitle>
            {message}
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => router.push('/login')}
              >
                Go to Login
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </Box>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Container maxWidth="sm" sx={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 8
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Email Confirmation
        </Typography>

        {renderContent()}
      </Container>
    </div>
  );
};

export default ConfirmEmail;