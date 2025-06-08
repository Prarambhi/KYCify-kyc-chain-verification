import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Fade
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import KYCContractABI from '../contracts/KYCContract.json';

const darkBlueTheme = {
  primary: '#0a192f',
  secondary: '#172a45',
  accent: '#64ffda',
  textPrimary: '#e6f1ff',
  textSecondary: '#8892b0',
  paperBackground: '#112240'
};

const contractAddress = "0x902D8529aF70C4578e50146298f5B51D93a91388";

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Temporary admin bypass
    if (email === "admin" && password === "admin123") {
      navigate('/customer/dashboard');
      return;
    }

    try {
      if (!window.ethereum) throw new Error('Please install MetaMask');
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const contract = new ethers.Contract(
        contractAddress,
        KYCContractABI.abi,
        signer
      );

      const isVerified = await contract.isCustomerVerified(walletAddress);
      if (!isVerified) throw new Error('Customer not registered');

      localStorage.setItem('customerWallet', walletAddress);
      localStorage.setItem('customerEmail', email);
      navigate('/dashboard');
      
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message.replace("execution reverted: ", "") || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
   
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${darkBlueTheme.primary} 0%, ${darkBlueTheme.secondary} 100%)`,
          p: 2,
          m: 0
        }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            width: '100%', 
            maxWidth: 450,
            borderRadius: 4,
            backgroundColor: darkBlueTheme.paperBackground,
            border: `1px solid ${darkBlueTheme.secondary}`,
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5)`
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ 
              m: 1, 
              bgcolor: darkBlueTheme.accent,
              width: 60,
              height: 60
            }}>
              <LockOutlinedIcon sx={{ color: darkBlueTheme.primary }} />
            </Avatar>
            <Typography 
              component="h1" 
              variant="h4"
              sx={{
                fontWeight: 700,
                color: darkBlueTheme.accent,
                letterSpacing: 1,
                mt: 1
              }}
            >
              Customer Login
            </Typography>
            <Typography variant="body1" sx={{ color: darkBlueTheme.textSecondary, mt: 1 }}>
              Access your KYC verified account
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2, 
                mb: 3,
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                color: '#ff6e6e',
                border: '1px solid rgba(255, 0, 0, 0.2)'
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: darkBlueTheme.textSecondary }} />
                  </InputAdornment>
                ),
                style: { color: darkBlueTheme.textPrimary }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '& fieldset': {
                    borderColor: darkBlueTheme.secondary,
                  },
                  '&:hover fieldset': {
                    borderColor: darkBlueTheme.accent,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: darkBlueTheme.accent,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: darkBlueTheme.textSecondary,
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: darkBlueTheme.accent,
                },
                mb: 2
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: darkBlueTheme.textSecondary }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      sx={{ color: darkBlueTheme.textSecondary }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                style: { color: darkBlueTheme.textPrimary }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '& fieldset': {
                    borderColor: darkBlueTheme.secondary,
                  },
                  '&:hover fieldset': {
                    borderColor: darkBlueTheme.accent,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: darkBlueTheme.accent,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: darkBlueTheme.textSecondary,
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: darkBlueTheme.accent,
                },
                mb: 2
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !email || !password}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 3,
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: 0.5,
                backgroundColor: darkBlueTheme.accent,
                color: darkBlueTheme.primary,
                '&:hover': {
                  backgroundColor: '#52d9c1',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 15px ${darkBlueTheme.accent}40`
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: darkBlueTheme.primary }} />
              ) : (
                'Login'
              )}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button 
                variant="text" 
                size="small"
                onClick={() => navigate('/customer/signup')}
                sx={{
                  color: darkBlueTheme.textSecondary,
                  '&:hover': {
                    color: darkBlueTheme.accent
                  }
                }}
              >
                Don't have an account? Register
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    
  );
};

export default CustomerLogin;