import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper,
  Grid,
  Divider,
  Avatar,
  CssBaseline
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';

function HomePage() {
  const navigate = useNavigate();

  const darkBlueTheme = {
    primary: '#0a192f',
    secondary: '#172a45',
    accent: '#64ffda',
    textPrimary: '#e6f1ff',
    textSecondary: '#8892b0',
    paperBackground: '#112240'
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${darkBlueTheme.primary} 0%, ${darkBlueTheme.secondary} 100%)`,
          py: 8,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={6}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              backgroundColor: darkBlueTheme.paperBackground,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(100, 255, 218, 0.1)'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4,
                textAlign: 'center'
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'transparent',
                  mb: 2,
                  width: 72,
                  height: 72,
                  border: `2px solid ${darkBlueTheme.accent}`
                }}
              >
                <VerifiedUserIcon
                  sx={{
                    fontSize: 40,
                    color: darkBlueTheme.accent
                  }}
                />
              </Avatar>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  color: darkBlueTheme.textPrimary,
                  letterSpacing: 1,
                  fontSize: { xs: '1.75rem', md: '2.125rem' }
                }}
              >
                KYC Verification Portal
              </Typography>

              <Typography
                variant="subtitle1"
                sx={{
                  mt: 2,
                  color: darkBlueTheme.textSecondary,
                  width: { xs: '100%', md: '80%' },
                  lineHeight: 1.6,
                  fontSize: { xs: '0.875rem', md: '1rem' }
                }}
              >
                Secure Identity Verification on the Blockchain
              </Typography>
            </Box>

            <Divider
              sx={{
                my: 4,
                backgroundColor: 'rgba(100, 255, 218, 0.2)'
              }}
            />

            <Grid container spacing={3} justifyContent="center">
              {/* Bank Portal */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 2,
                    backgroundColor: darkBlueTheme.secondary,
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      mb: 2
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: darkBlueTheme.accent,
                        mb: 2,
                        width: 56,
                        height: 56
                      }}
                    >
                      <AccountBalanceIcon
                        sx={{
                          color: darkBlueTheme.primary,
                          fontSize: 28
                        }}
                      />
                    </Avatar>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 'medium',
                        color: darkBlueTheme.textPrimary,
                        fontSize: '1.1rem'
                      }}
                    >
                      Bank Portal
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      mt: 2
                    }}
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      size="medium"
                      onClick={() => navigate('/bank/signup')}
                      sx={{
                        py: 1.25,
                        backgroundColor: darkBlueTheme.accent,
                        color: darkBlueTheme.primary,
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        '&:hover': {
                          backgroundColor: `rgba(100, 255, 218, 0.8)`
                        }
                      }}
                    >
                      Bank Registration
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="medium"
                      onClick={() => navigate('/bank/login')}
                      sx={{
                        py: 1.25,
                        borderColor: darkBlueTheme.accent,
                        color: darkBlueTheme.accent,
                        fontSize: '0.875rem',
                        '&:hover': {
                          borderColor: darkBlueTheme.accent,
                          backgroundColor: `rgba(100, 255, 218, 0.1)`
                        }
                      }}
                    >
                      Bank Login
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Customer Portal */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 2,
                    backgroundColor: darkBlueTheme.secondary,
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      mb: 2
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: darkBlueTheme.accent,
                        mb: 2,
                        width: 56,
                        height: 56
                      }}
                    >
                      <PersonIcon
                        sx={{
                          color: darkBlueTheme.primary,
                          fontSize: 28
                        }}
                      />
                    </Avatar>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 'medium',
                        color: darkBlueTheme.textPrimary,
                        fontSize: '1.1rem'
                      }}
                    >
                      Customer Portal
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      mt: 2
                    }}
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      size="medium"
                      onClick={() => navigate('/customer/signup')}
                      sx={{
                        py: 1.25,
                        backgroundColor: darkBlueTheme.accent,
                        color: darkBlueTheme.primary,
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        '&:hover': {
                          backgroundColor: `rgba(100, 255, 218, 0.8)`
                        }
                      }}
                    >
                      Customer Registration
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="medium"
                      onClick={() => navigate('/customer/login')}
                      sx={{
                        py: 1.25,
                        borderColor: darkBlueTheme.accent,
                        color: darkBlueTheme.accent,
                        fontSize: '0.875rem',
                        '&:hover': {
                          borderColor: darkBlueTheme.accent,
                          backgroundColor: `rgba(100, 255, 218, 0.1)`
                        }
                      }}
                    >
                      Customer Login
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </>
  );
}

export default HomePage;