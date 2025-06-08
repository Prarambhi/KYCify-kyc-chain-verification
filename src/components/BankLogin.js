import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import { ethers } from 'ethers';
import KYCContractABI from '../contracts/KYCContract.json';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const contractAddress = "SMART_CONTRACT_ADDRESS";

const darkBlueTheme = {
  primary: '#0a192f',
  secondary: '#172a45',
  accent: '#64ffda',
  textPrimary: '#e6f1ff',
  textSecondary: '#8892b0',
  paperBackground: '#112240'
};

function BankLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { account, connectWallet } = useWallet();

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    try {
      let currentAccount = account;
      if (!currentAccount) {
        currentAccount = await connectWallet();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        KYCContractABI.abi,
        signer
      );

      const passwordHash = ethers.keccak256(ethers.toUtf8Bytes(password));

      const isRegistered = await contract.checkBankRegistration(currentAccount);
      if (!isRegistered) {
        throw new Error('Bank not registered. Please register first.');
      }

      const isApproved = await contract.isBankApproved(currentAccount);
      if (!isApproved) {
        throw new Error('Bank registration pending admin approval.');
      }

      const loginSuccessful = await contract.bankLogin(username, passwordHash);
      
      if (!loginSuccessful) {
        throw new Error('Invalid username or password');
      }

      navigate('/bank/dashboard');

    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = error.reason || 
                        error.data?.message || 
                        error.message || 
                        "Login failed. Please try again.";
      errorMessage = errorMessage.replace("execution reverted: ", "");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: `linear-gradient(135deg, ${darkBlueTheme.primary} 0%, ${darkBlueTheme.secondary} 100%)`,
        margin: 0,
        display:'flex',
        padding: 0,
        overflowY: 'hidden',
        overflowX: 'hidden', // Prevent vertical scroll
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 450,
          p: 4,
          borderRadius: 2,
          backgroundColor: darkBlueTheme.paperBackground,
          border: `1px solid ${darkBlueTheme.secondary}`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
          margin: 2 // Add some margin on small screens
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AccountBalanceIcon 
            sx={{ 
              fontSize: 50, 
              color: darkBlueTheme.accent,
              mb: 1
            }} 
          />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              color: darkBlueTheme.textPrimary,
              letterSpacing: 1
            }}
          >
            Bank Portal
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: darkBlueTheme.textSecondary,
              mt: 1
            }}
          >
            Secure Login for Financial Institutions
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              color: '#ff6e6e',
              border: '1px solid rgba(255, 0, 0, 0.2)'
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            label="Bank Name"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
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
            }}
            InputProps={{
              style: {
                color: darkBlueTheme.textPrimary,
              }
            }}
            required
            margin="normal"
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
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
            }}
            InputProps={{
              style: {
                color: darkBlueTheme.textPrimary,
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    sx={{ color: darkBlueTheme.textSecondary }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            required
            margin="normal"
          />
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            disabled={loading}
            sx={{ 
              mt: 3, 
              py: 1.5,
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
              boxShadow: 'none'
            }}
          >
            {loading ? (
              <CircularProgress 
                size={24} 
                sx={{ color: darkBlueTheme.primary }} 
              />
            ) : 'Login'}
          </Button>
        </form>

        {account && (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 3, 
              color: darkBlueTheme.textSecondary,
              textAlign: 'center',
              fontFamily: 'monospace',
              backgroundColor: 'rgba(100, 255, 218, 0.1)',
              p: 1,
              borderRadius: 1,
              border: `1px solid ${darkBlueTheme.secondary}`
            }}
          >
            Connected: {account.substring(0, 6)}...{account.substring(38)}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default BankLogin;
