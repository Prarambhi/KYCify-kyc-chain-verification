import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  Avatar,
  Paper,
  ListItemText
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  AccountBalance as BankIcon,
  Person as CustomerIcon,
  Fingerprint as BiometricIcon,
  Link as BlockchainIcon,
  Shield as SecurityIcon,
  Lock as PrivacyIcon,
  Speed as SpeedIcon,
  Savings as CostIcon
} from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();

  const darkBlueTheme = {
    primary: '#0a192f',
    secondary: '#172a45',
    accent: '#64ffda',
    textPrimary: '#e6f1ff',
    textSecondary: '#8892b8',
    paperBackground: '#112240'
  };

  const benefits = [
    { icon: <SecurityIcon />, title: "Tamper-Proof Records", desc: "Immutable blockchain storage prevents data alteration" },
    { icon: <BlockchainIcon />, title: "Interoperability", desc: "Share verified KYC across multiple institutions" },
    { icon: <SpeedIcon />, title: "Faster Verification", desc: "Eliminate redundant KYC processes" },
    { icon: <PrivacyIcon />, title: "User-Controlled", desc: "Customers control document access" },
    { icon: <CostIcon />, title: "Cost Efficient", desc: "Reduce administrative overhead" }
  ];

  const workflow = [
    { step: 1, title: "Document Submission", desc: "Customers upload documents to IPFS", icon: <CustomerIcon /> },
    { step: 2, title: "Bank Verification", desc: "Banks review and validate documents", icon: <BankIcon /> },
    { step: 3, title: "Blockchain Record", desc: "Verified status stored on-chain", icon: <BlockchainIcon /> }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: darkBlueTheme.primary,
      color: darkBlueTheme.textPrimary,
      overflowX: 'hidden'
    }}>
      {/* Hero Section */}
      <Box sx={{
        background: `linear-gradient(135deg, ${darkBlueTheme.primary} 0%, ${darkBlueTheme.secondary} 100%)`,
        pt: { xs: 6, md: 10 },
        pb: { xs: 8, md: 12 }
      }}>
        <Container maxWidth="lg" disableGutters>
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            px: { xs: 2, sm: 3 }
          }}>
            <Avatar sx={{
              bgcolor: 'transparent',
              width: 100,
              height: 100,
              mb: 4,
              border: `2px solid ${darkBlueTheme.accent}`
            }}>
              <VerifiedIcon sx={{ 
                fontSize: 50, 
                color: darkBlueTheme.accent 
              }} />
            </Avatar>
            <Typography variant="h2" sx={{
              fontWeight: 'bold',
              mb: 3,
              background: `linear-gradient(90deg, ${darkBlueTheme.accent}, ${darkBlueTheme.textPrimary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
              fontSize: { xs: '2.2rem', md: '3rem' }
            }}>
              Secure. Transparent. Decentralized KYC Verification.
            </Typography>
            <Typography variant="h5" sx={{
              color: darkBlueTheme.textSecondary,
              maxWidth: '800px',
              mb: 5,
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}>
              Empowering banks and customers with a trustless identity verification system built on blockchain
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/home')}
              sx={{
                px: 5,
                py: 1.5,
                backgroundColor: darkBlueTheme.accent,
                color: darkBlueTheme.primary,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: `${darkBlueTheme.accent}dd`,
                  boxShadow: `0 0 15px ${darkBlueTheme.accent}80`
                }
              }}
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Why Blockchain Section */}
      <Box sx={{
        py: { xs: 6, md: 8 },
        background: darkBlueTheme.paperBackground
      }}>
        <Container maxWidth="lg" disableGutters>
          <Box sx={{ px: { xs: 2, sm: 3 } }}>
            <Typography variant="h3" sx={{ 
              mb: 6, 
              textAlign: 'center',
              fontWeight: 'bold',
              color: darkBlueTheme.textPrimary,
              fontSize: { xs: '1.8rem', md: '2.4rem' }
            }}>
              Why Use Blockchain for KYC?
            </Typography>
            <Grid container spacing={4}>
              {benefits.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper elevation={3} sx={{
                    height: '100%',
                    background: darkBlueTheme.secondary,
                    border: `1px solid ${darkBlueTheme.accent}20`,
                    borderRadius: '12px',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: `0 10px 20px ${darkBlueTheme.accent}10`,
                      border: `1px solid ${darkBlueTheme.accent}40`
                    }
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Avatar sx={{
                        bgcolor: `${darkBlueTheme.accent}20`,
                        color: darkBlueTheme.accent,
                        width: 60,
                        height: 60,
                        mb: 3
                      }}>
                        {item.icon}
                      </Avatar>
                      <Typography variant="h5" sx={{ 
                        mb: 2,
                        color: darkBlueTheme.textPrimary,
                        fontSize: '1.25rem'
                      }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ 
                        color: darkBlueTheme.textSecondary,
                        lineHeight: 1.6
                      }}>
                        {item.desc}
                      </Typography>
                    </CardContent>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg" disableGutters>
          <Box sx={{ px: { xs: 2, sm: 3 } }}>
            <Typography variant="h3" sx={{ 
              mb: 8, 
              textAlign: 'center',
              fontWeight: 'bold',
              color: darkBlueTheme.textPrimary,
              fontSize: { xs: '1.8rem', md: '2.4rem' }
            }}>
              How It Works
            </Typography>
            <Grid container spacing={4}>
              {workflow.map((step, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ 
                    textAlign: 'center',
                    position: 'relative'
                  }}>
                    <Avatar sx={{
                      bgcolor: `${darkBlueTheme.accent}20`,
                      color: darkBlueTheme.accent,
                      width: 80,
                      height: 80,
                      mb: 3,
                      mx: 'auto',
                      border: `1px solid ${darkBlueTheme.accent}`
                    }}>
                      {step.icon}
                    </Avatar>
                    <Typography variant="h5" sx={{ 
                      mb: 2,
                      color: darkBlueTheme.textPrimary,
                      fontSize: '1.25rem'
                    }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ 
                      color: darkBlueTheme.textSecondary,
                      lineHeight: 1.6
                    }}>
                      {step.desc}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Key Features Section */}
      <Box sx={{ 
        py: { xs: 6, md: 8 }, 
        background: darkBlueTheme.paperBackground,
        borderTop: `1px solid ${darkBlueTheme.accent}20`,
        borderBottom: `1px solid ${darkBlueTheme.accent}20`
      }}>
        <Container maxWidth="lg" disableGutters>
          <Box sx={{ px: { xs: 2, sm: 3 } }}>
            <Typography variant="h3" sx={{
              mb: 6,
              textAlign: 'center',
              fontWeight: 'bold',
              color: darkBlueTheme.textPrimary,
              fontSize: { xs: '1.8rem', md: '2.4rem' }
            }}>
              Key Features
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: darkBlueTheme.secondary,
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 3
                    }}>
                      <CustomerIcon sx={{ 
                        color: darkBlueTheme.accent, 
                        mr: 2,
                        fontSize: 32
                      }} />
                      <Typography variant="h5" sx={{ color: darkBlueTheme.textPrimary }}>
                        Customer
                      </Typography>
                    </Box>
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ color: darkBlueTheme.accent }}>
                          <VerifiedIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Register & upload KYC documents" 
                          primaryTypographyProps={{ color: darkBlueTheme.textSecondary }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ color: darkBlueTheme.accent }}>
                          <VerifiedIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Track approval status" 
                          primaryTypographyProps={{ color: darkBlueTheme.textSecondary }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ color: darkBlueTheme.accent }}>
                          <VerifiedIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Reuse verified KYC" 
                          primaryTypographyProps={{ color: darkBlueTheme.textSecondary }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: darkBlueTheme.secondary,
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 3
                    }}>
                      <BankIcon sx={{ 
                        color: darkBlueTheme.accent, 
                        mr: 2,
                        fontSize: 32
                      }} />
                      <Typography variant="h5" sx={{ color: darkBlueTheme.textPrimary }}>
                        Bank
                      </Typography>
                    </Box>
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ color: darkBlueTheme.accent }}>
                          <VerifiedIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Review pending requests" 
                          primaryTypographyProps={{ color: darkBlueTheme.textSecondary }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ color: darkBlueTheme.accent }}>
                          <VerifiedIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Approve/Reject with comments" 
                          primaryTypographyProps={{ color: darkBlueTheme.textSecondary }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ color: darkBlueTheme.accent }}>
                          <VerifiedIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Access verified KYC data" 
                          primaryTypographyProps={{ color: darkBlueTheme.textSecondary }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;