import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { 
  Box, Typography, Card, CardContent, Button,
  CircularProgress, List, ListItem, ListItemText,
  Divider, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Alert, Tabs, Tab,
  Avatar, Chip, InputAdornment, IconButton,
} from '@mui/material';
import { ethers } from 'ethers';
import KYCContractABI from '../contracts/KYCContract.json';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BadgeIcon from '@mui/icons-material/Badge';
import PinIcon from '@mui/icons-material/Pin';
import PersonIcon from '@mui/icons-material/Person';

const darkBlueTheme = {
  primary: '#0a192f',
  secondary: '#172a45',
  accent: '#64ffda',
  textPrimary: '#e6f1ff',
  textSecondary: '#8892b0',
  paperBackground: '#112240'
};

function AdminDashboard() {
  const { account } = useWallet();
  const [pendingBanks, setPendingBanks] = useState([]);
  const [approvedBanks, setApprovedBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum && account) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          const contractAddress = "0x902D8529aF70C4578e50146298f5B51D93a91388";
          const kycContract = new ethers.Contract(
            contractAddress,
            KYCContractABI.abi,
            signer
          );
          
          const adminStatus = await kycContract.isAdmin(account);
          setIsAdmin(adminStatus);
          
          if (!adminStatus) {
            setError("Connected wallet is not an admin. Please switch to an admin account.");
          }
          
          setContract(kycContract);
          await fetchData(kycContract);
        } catch (error) {
          console.error("Error initializing contract:", error);
          setError("Failed to connect to contract: " + error.message);
        }
      }
    };

    initContract();
  }, [account]);

  const fetchData = async (contract) => {
    try {
      setLoading(true);
      setError('');
      
      const pending = await contract.getPendingBanks();
      const approved = await contract.getApprovedBanks();
      
      setPendingBanks(pending);
      setApprovedBanks(approved);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load bank data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (bank) => {
    setSelectedBank(bank);
    setOpenDialog(true);
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!contract) throw new Error("Contract not initialized");
      if (!selectedBank) throw new Error("No bank selected");
      if (!account) throw new Error("Wallet not connected");

      const currentAdminStatus = await contract.isAdmin(account);
      if (!currentAdminStatus) {
        throw new Error(`Account ${account.slice(0, 6)}...${account.slice(-4)} is not an admin`);
      }

      const bankStatus = await contract.banks(selectedBank.id);
      if (bankStatus.isApproved) {
        throw new Error("This bank is already approved");
      }

      const gasEstimate = await contract.approveBank.estimateGas(selectedBank.id);
      const gasWithBuffer = gasEstimate * 120n / 100n;

      const tx = await contract.approveBank(selectedBank.id, { 
        gasLimit: gasWithBuffer 
      });
      
      const receipt = await tx.wait();
      if (receipt.status !== 1) {
        throw new Error("Transaction failed");
      }

      setOpenDialog(false);
      await fetchData(contract);
    } catch (error) {
      console.error("Full approval error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      p: 3,
      background: darkBlueTheme.primary,
      minHeight: '100vh',
      color: darkBlueTheme.textPrimary
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        gap: 2
      }}>
        <Avatar sx={{ 
          bgcolor: darkBlueTheme.accent,
          width: 56, 
          height: 56 
        }}>
          <AdminPanelSettingsIcon sx={{ color: darkBlueTheme.primary }} />
        </Avatar>
        <Typography variant="h4" sx={{ 
          fontWeight: 700,
          letterSpacing: 1
        }}>
          Admin Dashboard
        </Typography>
      </Box>
      
      {/* Connection status */}
      {account && (
        <Alert 
          severity={isAdmin ? "success" : "error"} 
          sx={{ 
            mb: 3,
            backgroundColor: isAdmin ? 'rgba(100, 255, 218, 0.2)' : 'rgba(255, 0, 0, 0.1)',
            color: isAdmin ? darkBlueTheme.accent : '#ff6e6e',
            border: `1px solid ${isAdmin ? darkBlueTheme.accent : 'rgba(255, 0, 0, 0.2)'}`
          }}
        >
          {account ? `Connected as: ${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}
          {isAdmin ? " (Admin privileges)" : " (No admin privileges)"}
        </Alert>
      )}
      
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
      
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        mb: 4,
        flexWrap: 'wrap'
      }}>
        <Card sx={{ 
          minWidth: 200,
          backgroundColor: darkBlueTheme.secondary,
          borderRadius: 3
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: darkBlueTheme.textSecondary }}>
              Pending Requests
            </Typography>
            <Typography variant="h3" sx={{ color: darkBlueTheme.accent }}>
              {loading ? <CircularProgress size={24} sx={{ color: darkBlueTheme.accent }} /> : pendingBanks.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ 
          minWidth: 200,
          backgroundColor: darkBlueTheme.secondary,
          borderRadius: 3
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: darkBlueTheme.textSecondary }}>
              Approved Banks
            </Typography>
            <Typography variant="h3" sx={{ color: darkBlueTheme.accent }}>
              {loading ? <CircularProgress size={24} sx={{ color: darkBlueTheme.accent }} /> : approvedBanks.length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 3,
          '& .MuiTabs-indicator': {
            backgroundColor: darkBlueTheme.accent
          }
        }}
      >
        <Tab 
          label="Pending Requests" 
          sx={{ color: darkBlueTheme.textSecondary }}
        />
        <Tab 
          label="Approved Banks" 
          sx={{ color: darkBlueTheme.textSecondary }}
        />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: darkBlueTheme.accent }} />
        </Box>
      ) : tabValue === 0 ? (
        pendingBanks.length > 0 ? (
          <Card sx={{ 
            backgroundColor: darkBlueTheme.paperBackground,
            border: `1px solid ${darkBlueTheme.secondary}`,
            borderRadius: 3
          }}>
            <List>
              {pendingBanks.map((bank) => (
                <React.Fragment key={bank.id.toString()}>
                  <ListItem sx={{ py: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: darkBlueTheme.secondary,
                      mr: 2
                    }}>
                      <BusinessIcon sx={{ color: darkBlueTheme.accent }} />
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: darkBlueTheme.textPrimary }}>
                          {bank.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <LocationOnIcon sx={{ 
                            fontSize: 16, 
                            color: darkBlueTheme.textSecondary,
                            mr: 0.5
                          }} />
                          <Typography variant="body2" sx={{ color: darkBlueTheme.textSecondary }}>
                            {`${bank.state}, ${bank.country}`}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button 
                      variant="outlined" 
                      onClick={() => handleViewDetails(bank)}
                      sx={{ 
                        mr: 2,
                        color: darkBlueTheme.accent,
                        borderColor: darkBlueTheme.accent,
                        '&:hover': {
                          backgroundColor: 'rgba(100, 255, 218, 0.1)',
                          borderColor: darkBlueTheme.accent
                        }
                      }}
                      disabled={loading || !isAdmin}
                    >
                      Details
                    </Button>
                  </ListItem>
                  <Divider sx={{ backgroundColor: darkBlueTheme.secondary }} />
                </React.Fragment>
              ))}
            </List>
          </Card>
        ) : (
          <Typography sx={{ color: darkBlueTheme.textSecondary }}>
            No pending requests
          </Typography>
        )
      ) : approvedBanks.length > 0 ? (
        <Card sx={{ 
          backgroundColor: darkBlueTheme.paperBackground,
          border: `1px solid ${darkBlueTheme.secondary}`,
          borderRadius: 3
        }}>
          <List>
            {approvedBanks.map((bank) => (
              <ListItem key={bank.id.toString()} sx={{ py: 2 }}>
                <Avatar sx={{ 
                  bgcolor: darkBlueTheme.secondary,
                  mr: 2
                }}>
                  <BusinessIcon sx={{ color: darkBlueTheme.accent }} />
                </Avatar>
                <ListItemText
                  primary={
                    <Typography sx={{ color: darkBlueTheme.textPrimary }}>
                      {bank.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalanceIcon sx={{ 
                          fontSize: 16, 
                          color: darkBlueTheme.textSecondary,
                          mr: 0.5
                        }} />
                        <Typography variant="body2" sx={{ color: darkBlueTheme.textSecondary }}>
                          {bank.walletAddress}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon sx={{ 
                          fontSize: 16, 
                          color: darkBlueTheme.textSecondary,
                          mr: 0.5
                        }} />
                        <Typography variant="body2" sx={{ color: darkBlueTheme.textSecondary }}>
                          {`${bank.state}, ${bank.country}`}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <Chip 
                  label="Approved" 
                  sx={{ 
                    backgroundColor: 'rgba(100, 255, 218, 0.2)',
                    color: darkBlueTheme.accent
                  }} 
                />
              </ListItem>
            ))}
          </List>
        </Card>
      ) : (
        <Typography sx={{ color: darkBlueTheme.textSecondary }}>
          No approved banks
        </Typography>
      )}

      {/* Bank Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: darkBlueTheme.paperBackground,
            color: darkBlueTheme.textPrimary,
            borderRadius: 3,
            border: `1px solid ${darkBlueTheme.secondary}`
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: darkBlueTheme.secondary,
          borderBottom: `1px solid ${darkBlueTheme.secondary}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BusinessIcon sx={{ color: darkBlueTheme.accent }} />
            <Typography>Bank Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedBank && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon sx={{ color: darkBlueTheme.textSecondary }} />
                <Typography sx={{ color: darkBlueTheme.textPrimary }}>
                  <strong>Name:</strong> {selectedBank.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BadgeIcon sx={{ color: darkBlueTheme.textSecondary }} />
                <Typography sx={{ color: darkBlueTheme.textPrimary }}>
                  <strong>Bank Number:</strong> {selectedBank.bankNumber}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ color: darkBlueTheme.textSecondary }} />
                <Typography sx={{ color: darkBlueTheme.textPrimary }}>
                  <strong>Location:</strong> {selectedBank.state}, {selectedBank.country}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PinIcon sx={{ color: darkBlueTheme.textSecondary }} />
                <Typography sx={{ color: darkBlueTheme.textPrimary }}>
                  <strong>Pincode:</strong> {selectedBank.pincode}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ color: darkBlueTheme.textSecondary }} />
                <Typography sx={{ color: darkBlueTheme.textPrimary }}>
                  <strong>Admin Name:</strong> {selectedBank.adminName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceIcon sx={{ color: darkBlueTheme.textSecondary }} />
                <Typography sx={{ color: darkBlueTheme.textPrimary }}>
                  <strong>Wallet Address:</strong> {selectedBank.walletAddress}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          borderTop: `1px solid ${darkBlueTheme.secondary}`
        }}>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              setError('');
            }}
            sx={{ 
              color: darkBlueTheme.textSecondary,
              '&:hover': {
                color: darkBlueTheme.accent
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApprove}
            variant="contained"
            sx={{
              backgroundColor: darkBlueTheme.accent,
              color: darkBlueTheme.primary,
              '&:hover': {
                backgroundColor: '#52d9c1',
                boxShadow: `0 0 10px ${darkBlueTheme.accent}`
              },
              px: 3,
              py: 1,
              borderRadius: 2
            }}
            disabled={loading || !isAdmin}
          >
            {loading ? <CircularProgress size={24} sx={{ color: darkBlueTheme.primary }} /> : 'Approve'}
          </Button>
        </DialogActions>
        {error && (
          <Alert severity="error" sx={{ 
            mx: 3, 
            mb: 2,
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            color: '#ff6e6e',
            border: '1px solid rgba(255, 0, 0, 0.2)'
          }}>
            {error}
          </Alert>
        )}
      </Dialog>
    </Box>
  );
}

export default AdminDashboard;