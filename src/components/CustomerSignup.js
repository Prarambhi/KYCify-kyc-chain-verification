import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Fade
} from '@mui/material';
import KYCContractABI from '../contracts/KYCContract.json';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
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

const CustomerSignup = () => {
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    documentName: '',
    password: '',
    confirmPassword: ''
  });

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask!");
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setAccount(accounts[0]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!account) throw new Error("Please connect your wallet first");
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords don't match");
      }
      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        KYCContractABI.abi,
        signer
      );

      const passwordHash = ethers.keccak256(ethers.toUtf8Bytes(formData.password));

      const tx = await contract.registerCustomer(
        formData.username,
        formData.documentName,
        passwordHash
      );

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setSuccess(true);
        navigate('/customer/dashboard', {
          state: {
            username: formData.username,
            walletAddress: account,
            documentName: formData.documentName
          }
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      let errorMsg = err.reason || err.message;
      errorMsg = errorMsg.replace("execution reverted: ", "");
      setError(errorMsg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${darkBlueTheme.primary} 0%, ${darkBlueTheme.secondary} 100%)`,
        p: 2
      }}>
        <Paper elevation={6} sx={{
          maxWidth: 600,
          width: '100%',
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          backgroundColor: darkBlueTheme.paperBackground,
          border: `1px solid ${darkBlueTheme.secondary}`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5)`
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{
              bgcolor: darkBlueTheme.accent,
              width: 60,
              height: 60,
              mx: 'auto',
              mb: 2
            }}>
              <PersonIcon fontSize="large" sx={{ color: darkBlueTheme.primary }} />
            </Avatar>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: darkBlueTheme.accent,
              mb: 1,
              letterSpacing: 1
            }}>
              Customer Registration
            </Typography>
            <Typography variant="body1" sx={{ color: darkBlueTheme.textSecondary }}>
              Complete your KYC verification
            </Typography>
          </Box>

          {!account ? (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Button 
                variant="contained" 
                onClick={connectWallet}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: 3,
                  fontSize: '1rem',
                  fontWeight: 600,
                  backgroundColor: darkBlueTheme.accent,
                  color: darkBlueTheme.primary,
                  '&:hover': {
                    backgroundColor: '#52d9c1',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 15px ${darkBlueTheme.accent}40`
                  },
                  transition: 'all 0.3s ease',
                }}
                startIcon={<Avatar src="/metamask-icon.png" sx={{ width: 24, height: 24 }} />}
              >
                Connect MetaMask
              </Button>
              {error && (
                <Alert severity="error" sx={{ 
                  mt: 3,
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  color: '#ff6e6e',
                  border: '1px solid rgba(255, 0, 0, 0.2)'
                }}>
                  {error}
                </Alert>
              )}
            </Box>
          ) : (
            <>
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
              {success && (
                <Alert severity="success" sx={{ 
                  mb: 3,
                  backgroundColor: 'rgba(100, 255, 218, 0.2)',
                  color: darkBlueTheme.accent,
                  border: `1px solid ${darkBlueTheme.accent}`
                }}>
                  Registration successful!
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: darkBlueTheme.textSecondary }} />
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
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Name on Document"
                      name="documentName"
                      value={formData.documentName}
                      onChange={(e) => setFormData({...formData, documentName: e.target.value})}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon sx={{ color: darkBlueTheme.textSecondary }} />
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
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                      required
                      fullWidth
                      label="Confirm Password"
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: darkBlueTheme.textSecondary }} />
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
                    <CircularProgress 
                      size={24} 
                      sx={{ color: darkBlueTheme.primary }} 
                    />
                  ) : 'Register'}
                </Button>
              </form>

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
                  Connected wallet: <strong>{account.substring(0, 6)}...{account.substring(38)}</strong>
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Fade>
  );
};

export default CustomerSignup;
