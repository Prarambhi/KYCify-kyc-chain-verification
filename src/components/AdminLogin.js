import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Avatar,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  AccountCircle,
  VerifiedUser
} from '@mui/icons-material';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { connectWallet, isConnected } = useWallet();

  const colors = {
    primary: '#0a192f',
    secondary: '#172a45',
    accent: '#64ffda',
    textPrimary: '#e6f1ff',
    textSecondary: '#8892b0',
    error: '#ff5252'
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (username !== 'ADMIN_NAME' || password !== 'ADMIN_PASSWORD') {
      setError('Invalid credentials');
      setIsLoading(false);
      return;
    }

    try {
      await connectWallet();
      navigate('/admin/dashboard');
    } catch (error) {
      setError('Wallet connection failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        overflow: 'hidden',
        m: 0,
        p: 0
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 450,
          px: 4,
          py: 6,
          borderRadius: 2,
          backgroundColor: colors.secondary,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${colors.accent}20`,
          mx: 2
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Avatar
            sx={{
              bgcolor: `${colors.accent}20`,
              color: colors.accent,
              width: 60,
              height: 60,
              mb: 2
            }}
          >
            <VerifiedUser fontSize="large" />
          </Avatar>
          <Typography variant="h4" sx={{ color: colors.textPrimary, fontWeight: 'bold' }}>
            Admin Portal
          </Typography>
          <Typography variant="body1" sx={{ color: colors.textSecondary, mt: 1 }}>
            Secure access to the verification dashboard
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              backgroundColor: `${colors.error}20`,
              color: colors.textPrimary,
              border: `1px solid ${colors.error}`
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 3 }}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle sx={{ color: colors.textSecondary }} />
                </InputAdornment>
              ),
              style: {
                color: colors.textPrimary
              }
            }}
            InputLabelProps={{
              style: { color: colors.textSecondary }
            }}
            variant="outlined"
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: colors.textSecondary }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: colors.textSecondary }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              style: {
                color: colors.textPrimary
              }
            }}
            InputLabelProps={{
              style: { color: colors.textSecondary }
            }}
            variant="outlined"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{
              py: 1.5,
              backgroundColor: colors.accent,
              color: colors.primary,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: `${colors.accent}cc`
              },
              '&:disabled': {
                backgroundColor: `${colors.accent}70`
              }
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: colors.primary }} />
            ) : (
              'Login'
            )}
          </Button>
        </form>

        {isConnected && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 1,
              backgroundColor: `${colors.accent}20`,
              border: `1px solid ${colors.accent}`
            }}
          >
            <Typography sx={{ color: colors.accent, textAlign: 'center' }}>
              Wallet connected successfully!
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default AdminLogin;
