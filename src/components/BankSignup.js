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
  Snackbar,
  Grid,
  Paper,
  Avatar,
  InputAdornment,
  IconButton,
  Fade
} from '@mui/material';
import { ethers } from 'ethers';
import KYCContractABI from '../contracts/KYCContract.json';
import LockIcon from '@mui/icons-material/Lock';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NumbersIcon from '@mui/icons-material/Numbers';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const CONTRACT_ADDRESS = "SMART_CONTRACT_ADDRESS";

const darkBlueTheme = {
  primary: '#0a192f',
  secondary: '#172a45',
  accent: '#64ffda',
  textPrimary: '#e6f1ff',
  textSecondary: '#8892b0',
  paperBackground: '#112240'
};

function BankSignup() {
  const [formData, setFormData] = useState({
    bankNumber: '',
    name: '',
    country: '',
    state: '',
    pincode: '',
    adminName: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { account, connectWallet } = useWallet();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    const requiredFields = ['bankNumber', 'name', 'country', 'state', 'pincode', 'adminName', 'password'];
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        setLoading(false);
        return;
      }
    }

    try {
      let currentAccount = account;
      if (!currentAccount) {
        currentAccount = await connectWallet();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        KYCContractABI.abi,
        signer
      );

      const passwordHash = ethers.keccak256(ethers.toUtf8Bytes(formData.password));
      const params = [
        formData.bankNumber,
        formData.name,
        formData.country,
        formData.state,
        formData.pincode,
        formData.adminName,
        passwordHash
      ];

      const isRegistered = await contract.checkBankRegistration(currentAccount);
      if (isRegistered) throw new Error('This wallet is already registered as a bank');

      let gasEstimate;
      try {
        gasEstimate = await contract.registerBank.estimateGas(...params);
      } catch {
        gasEstimate = ethers.toBigInt(500000);
      }

      const tx = await contract.registerBank(...params, { 
        gasLimit: gasEstimate * 130n / 100n
      });
      
      await tx.wait();
      setSuccess(true);
      setTimeout(() => navigate('/bank/dashboard'), 3000);
    } catch (error) {
      setError(error.message.replace("execution reverted: ", "") || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${darkBlueTheme.primary} 0%, ${darkBlueTheme.secondary} 100%)`,
        p: 0,
        m: 0,
        padding:0,
        margin:0
      }}>
        <Paper elevation={6} sx={{
          maxWidth: 800,
          width: '100%',
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          backgroundColor: darkBlueTheme.paperBackground,
          border: `1px solid ${darkBlueTheme.secondary}`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5)`,
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{
              bgcolor: darkBlueTheme.accent,
              width: 60,
              height: 60,
              mx: 'auto',
              padding:0,
              margin:0,
              mb: 2
            }}>
              <AccountBalanceIcon fontSize="large" sx={{ color: darkBlueTheme.primary }} />
            </Avatar>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: darkBlueTheme.accent,
              mb: 1,
              letterSpacing: 1
            }}>
              Bank Registration
            </Typography>
            <Typography variant="body1" sx={{ color: darkBlueTheme.textSecondary }}>
              Complete your bank's KYC verification
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ 
              mb: 3,
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              color: '#ff6e6e',
              border: '1px solid rgba(255, 0, 0, 0.2)'
            }}>
              {error}
            </Alert>
          )}

          <Snackbar
            open={success}
            autoHideDuration={6000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />}
              sx={{
                backgroundColor: 'rgba(100, 255, 218, 0.2)',
                color: darkBlueTheme.accent,
                border: `1px solid ${darkBlueTheme.accent}`
              }}
            >
              Registration successful! Redirecting to dashboard...
            </Alert>
          </Snackbar>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Bank Number"
                  name="bankNumber"
                  fullWidth
                  value={formData.bankNumber}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NumbersIcon sx={{ color: darkBlueTheme.textSecondary }} />
                      </InputAdornment>
                    ),
                    style: { color: darkBlueTheme.textPrimary }
                  }}
                  variant="outlined"
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
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Bank Name"
                  name="name"
                  fullWidth
                  value={formData.name}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalanceIcon sx={{ color: darkBlueTheme.textSecondary }} />
                      </InputAdornment>
                    ),
                    style: { color: darkBlueTheme.textPrimary }
                  }}
                  variant="outlined"
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
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Country"
                  name="country"
                  fullWidth
                  value={formData.country}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: darkBlueTheme.textSecondary }} />
                      </InputAdornment>
                    ),
                    style: { color: darkBlueTheme.textPrimary }
                  }}
                  variant="outlined"
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
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="State/Province"
                  name="state"
                  fullWidth
                  value={formData.state}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: darkBlueTheme.textSecondary }} />
                      </InputAdornment>
                    ),
                    style: { color: darkBlueTheme.textPrimary }
                  }}
                  variant="outlined"
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
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Pincode"
                  name="pincode"
                  fullWidth
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NumbersIcon sx={{ color: darkBlueTheme.textSecondary }} />
                      </InputAdornment>
                    ),
                    style: { color: darkBlueTheme.textPrimary }
                  }}
                  variant="outlined"
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
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Admin Name"
                  name="adminName"
                  fullWidth
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: darkBlueTheme.textSecondary }} />
                      </InputAdornment>
                    ),
                    style: { color: darkBlueTheme.textPrimary }
                  }}
                  variant="outlined"
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
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={formData.password}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: darkBlueTheme.textSecondary }} />
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
                  variant="outlined"
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
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: darkBlueTheme.textSecondary }} />
                      </InputAdornment>
                    ),
                    style: { color: darkBlueTheme.textPrimary }
                  }}
                  variant="outlined"
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
                  }}
                />
              </Grid>
            </Grid>

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              disabled={loading}
              sx={{
                mt: 4,
                py: 2,
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
                boxShadow: 'none'
              }}
            >
              {loading ? (
                <CircularProgress 
                  size={24} 
                  sx={{ color: darkBlueTheme.primary }} 
                />
              ) : (
                'Register Bank'
              )}
            </Button>
          </form>

          {account && (
            <Box sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(100, 255, 218, 0.1)',
              border: `1px solid ${darkBlueTheme.secondary}`,
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ 
                color: darkBlueTheme.textSecondary,
                fontFamily: 'monospace'
              }}>
                Connected wallet: <strong>{`${account.substring(0, 6)}...${account.substring(38)}`}</strong>
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    
  );
}

export default BankSignup;
