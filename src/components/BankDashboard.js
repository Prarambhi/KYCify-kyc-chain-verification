import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { 
  Box, Typography, Card, CardContent, Button,
  CircularProgress, List, ListItem, ListItemText, ListItemAvatar,
  Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, Tabs, Tab,
  Chip, Avatar, TextField, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, IconButton, Snackbar, Fade
} from '@mui/material';
import { ethers } from 'ethers';
import KYCContractABI from '../contracts/KYCContract.json';
import {
  Business as BusinessIcon,
  Description as DescriptionIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ContentCopy as ContentCopyIcon,
  Verified as VerifiedIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { debounce } from 'lodash';

const theme = createTheme({
  palette: {
    primary: { main: '#0a192f' },
    secondary: { main: '#172a45' },
    accent: { main: '#64ffda' },
    textPrimary: { main: '#ffffff' },
    textSecondary: { main: '#cccccc' },
    background: { 
      default: '#0a192f',
      paper: '#112240'
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#112240',
          border: '1px solid #172a45',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          textPrimary: { main: '#ffffff' },
          textSecondary: { main: '#cccccc' }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(100, 255, 218, 0.1)'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: '#ffffff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': {
            backgroundColor: 'rgba(100, 255, 218, 0.05)',
            textPrimary: { main: '#ffffff' },
             textSecondary: { main: '#cccccc' }
          }
        }
      }
    }
  }
});

const CONTRACT_ADDRESS = "SMART_CONTRACT_ADDRESS";

function BankDashboard() {
  const { account } = useWallet();
  const [bankDetails, setBankDetails] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedCustomers, setApprovedCustomers] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);

  // Helper functions
  const convertBigInt = useCallback((value) => {
    return typeof value === 'bigint' ? Number(value.toString()) : value;
  }, []);

  const getInitial = useCallback((name) => {
    return name?.charAt(0)?.toUpperCase() || 'B';
  }, []);

  const formatWalletAddress = useCallback((address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  }, []);

  const formatDate = useCallback((timestamp) => {
    return timestamp ? new Date(convertBigInt(timestamp) * 1000).toLocaleString() : 'N/A';
  }, [convertBigInt]);

  // Status mapping with icons
  const statusConfig = {
    0: { label: 'Pending', color: 'warning', icon: <HourglassEmptyIcon /> },
    1: { label: 'Approved', color: 'success', icon: <CheckCircleIcon /> },
    2: { label: 'Rejected', color: 'error', icon: <CancelIcon /> },
    3: { label: 'Verified', color: 'info', icon: <VerifiedIcon /> }
  };

  // Initialize contract
  const initContract = useCallback(async () => {
    if (window.ethereum && account) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const kycContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          KYCContractABI.abi,
          signer
        );
        setContract(kycContract);
        return kycContract;
      } catch (error) {
        console.error("Error initializing contract:", error);
        setError("Failed to connect to contract: " + error.message);
        setLoading(false);
      }
    }
  }, [account]);

  // Debounced fetch function
  const debouncedFetchAllData = useCallback(debounce(async (contractInstance, accountId) => {
    if (!contractInstance) return;
    
    try {
      setIsRefreshing(true);
      setLoading(true);
      setError('');
      setLastRefreshTime(new Date());
      
      const bankId = await contractInstance.bankIds(accountId);
      if (convertBigInt(bankId) === 0) {
        throw new Error("Bank not registered");
      }
      
      // Fetch all data (bank details, pending requests, approved customers, access requests)
      const [details, pendingCustomerIds, approvedCustomerIds] = await Promise.all([
        contractInstance.banks(bankId),
        contractInstance.getBankPendingRequests(bankId),
        contractInstance.getBankApprovedCustomers(bankId)
      ]);

      setBankDetails({
        id: convertBigInt(bankId),
        name: details.name,
        bankNumber: details.bankNumber,
        country: details.country,
        state: details.state,
        pincode: details.pincode,
        adminName: details.adminName,
        walletAddress: details.walletAddress || accountId,
        isApproved: details.isApproved,
        passwordHash: details.passwordHash
      });

      // Process pending requests
      const requests = await Promise.all(
        pendingCustomerIds.map(async (customerId) => {
          const [customer, documents] = await Promise.all([
            contractInstance.customers(customerId),
            contractInstance.getCustomerDocuments(customerId)
          ]);
          return {
            customerId: convertBigInt(customerId),
            customerAddress: customer.walletAddress,
            username: customer.username,
            documentName: customer.documentName,
            documents: documents,
            requestDate: convertBigInt(customer.approvalDate) || 0,
            status: convertBigInt(customer.status),
            remarks: customer.remarks
          };
        })
      );
      setPendingRequests(requests);
      
      // Process approved customers
      const approved = await Promise.all(
        approvedCustomerIds.map(async (customerId) => {
          const [customer, documents] = await Promise.all([
            contractInstance.customers(customerId),
            contractInstance.getCustomerDocuments(customerId)
          ]);
          return {
            id: convertBigInt(customerId),
            username: customer.username,
            documentName: customer.documentName,
            walletAddress: customer.walletAddress,
            status: convertBigInt(customer.status),
            approvalDate: convertBigInt(customer.approvalDate),
            remarks: customer.remarks,
            documents: documents
          };
        })
      );
      setApprovedCustomers(approved);
      
      // Process access requests
      const accessRequestsData = await Promise.all(
        [...requests, ...approved].map(async (customer) => {
          try {
            const requests = await contractInstance.getCustomerBankRequests(customer.customerId || customer.id);
            const filteredRequests = await Promise.all(
              requests
                .filter(req => convertBigInt(req.bankId) === convertBigInt(bankId))
                .map(async req => {
                  const bank = await contractInstance.banks(req.bankId);
                  return {
                    customerId: customer.customerId || customer.id,
                    customerName: customer.username,
                    requestDate: convertBigInt(req.requestDate),
                    responded: req.responded,
                    accessGranted: req.accessGranted,
                    bankName: bank.name
                  };
                })
            );
            return filteredRequests;
          } catch (error) {
            console.error(`Error fetching requests for customer ${customer.customerId || customer.id}:`, error);
            return [];
          }
        })
      );
      setAccessRequests(accessRequestsData.flat());
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data: " + error.message);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, 1000), []);

  // Memoized fetch function
  const fetchAllData = useCallback(async () => {
    if (isRefreshing) return;
    await debouncedFetchAllData(contract, account);
  }, [contract, account, debouncedFetchAllData, isRefreshing]);

  const handleManualRefresh = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh setup
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && !isRefreshing && contract) {
        fetchAllData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [contract, isRefreshing, fetchAllData]);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      const contractInstance = await initContract();
      if (contractInstance) {
        await debouncedFetchAllData(contractInstance, account);
      }
    };
    initialize();
  }, [initContract, debouncedFetchAllData, account]);

  // Memoized table data
  const memoizedPendingRequests = useMemo(() => {
    return pendingRequests.map(request => ({
      ...request,
      formattedDate: formatDate(request.requestDate),
      formattedAddress: formatWalletAddress(request.customerAddress)
    }));
  }, [pendingRequests]);

  const memoizedApprovedCustomers = useMemo(() => {
    return approvedCustomers.map(customer => ({
      ...customer,
      formattedDate: formatDate(customer.approvalDate),
      formattedAddress: formatWalletAddress(customer.walletAddress)
    }));
  }, [approvedCustomers]);

  const memoizedAccessRequests = useMemo(() => {
    return accessRequests.map(request => ({
      ...request,
      formattedDate: formatDate(request.requestDate)
    }));
  }, [accessRequests]);

  // Handle approve/reject actions
  const handleRequestAction = useCallback(async (action, customerId) => {
    try {
      setLoading(true);
      setError('');
      
      if (!contract) throw new Error("Contract not initialized");
      
      const tx = action === 'approve' 
        ? await contract.approveCustomer(customerId, remarks || "Approved by bank")
        : await contract.rejectCustomer(customerId, remarks || "Rejected by bank");
      
      await tx.wait();
      setOpenDialog(false);
      setRemarks('');
      setSuccess(`Customer ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      await fetchAllData();
    } catch (error) {
      console.error(`${action} error:`, error);
      setError(error.message || `Failed to ${action} customer`);
    } finally {
      setLoading(false);
    }
  }, [contract, remarks, fetchAllData]);

  // Request access to customer documents
  const requestCustomerAccess = useCallback(async (customerId) => {
    try {
      setLoading(true);
      setError('');
      
      const bankId = await contract.bankIds(account);
      const tx = await contract.requestCustomerAccess(customerId);
      await tx.wait();
      
      setSuccess("Access request sent successfully!");
      await fetchAllData();
    } catch (error) {
      console.error("Access request error:", error);
      setError(error.message || "Failed to request access");
    } finally {
      setLoading(false);
    }
  }, [contract, account, fetchAllData]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        p: 3,
        minHeight: '100vh',
        backgroundColor: theme.palette.primary.main,
        color: 'white'
      }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ 
            bgcolor: theme.palette.accent.main,
            width: 56, 
            height: 56 
          }}>
            <BusinessIcon sx={{ color: theme.palette.primary.main }} />
          </Avatar>
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            letterSpacing: 1,
            color: 'white'
          }}>
            Bank KYC Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            {lastRefreshTime && (
              <Typography variant="caption" sx={{ mr: 2 }}>
                Last updated: {lastRefreshTime.toLocaleTimeString()}
              </Typography>
            )}
            <Button 
              variant="contained"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              startIcon={isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </Box>
        </Box>
        
        {/* Notifications */}
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Fade>
        )}
        {success && (
          <Snackbar
            open={!!success}
            autoHideDuration={6000}
            onClose={() => setSuccess('')}
            TransitionComponent={Fade}
          >
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Snackbar>
        )}

        {/* Bank Information Section */}
        <Fade in={!loading || !!bankDetails}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
              }}>
                <Typography variant="h5" sx={{ color: 'white' }}>
                  Bank Information
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  startIcon={isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                >
                  Refresh
                </Button>
              </Box>
              
              {loading && !bankDetails ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: theme.palette.accent.main }} />
                </Box>
              ) : bankDetails ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 ,color: 'white' }}>
                        Bank Details
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 ,color:"white"}}>
                        <Avatar sx={{ 
                          mr: 2, 
                          width: 56, 
                          height: 56, 
                          bgcolor: bankDetails.isApproved ? theme.palette.accent.main : 'warning.main',
                          color: bankDetails.isApproved ? theme.palette.primary.main : 'inherit'
                        }}>
                          {getInitial(bankDetails.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {bankDetails.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.textSecondary.main }}>
                            Bank ID: {bankDetails.id}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: theme.palette.textSecondary.main }}>
                            <strong>Bank Number:</strong>
                          </Typography>
                          <Typography sx={{color:"white"}}>{bankDetails.bankNumber}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: theme.palette.textSecondary.main }}>
                            <strong>Admin Name:</strong>
                          </Typography>
                          <Typography sx={{color:"white"}}>{bankDetails.adminName}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, color: 'white' }}>
                        Location & Status
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: theme.palette.textSecondary.main }}>
                            <strong>Country:</strong>
                          </Typography>
                          <Typography sx={{color:"white"}}>{bankDetails.country}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: theme.palette.textSecondary.main }}>
                            <strong>State:</strong>
                          </Typography>
                          <Typography sx={{color:"white"}}>{bankDetails.state}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: theme.palette.textSecondary.main }}>
                            <strong>Pincode:</strong>
                          </Typography>
                          <Typography sx={{color:"white"}}>{bankDetails.pincode}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: theme.palette.textSecondary.main }}>
                            <strong>Status:</strong>
                          </Typography>
                          <Chip 
                            label={bankDetails.isApproved ? 'Approved' : 'Pending Approval'} 
                            color={bankDetails.isApproved ? 'success' : 'warning'}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ color: theme.palette.textSecondary.main }}>
                          <strong>Wallet Address:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace',color:"white" }}>
                            {formatWalletAddress(bankDetails.walletAddress)}
                          </Typography>
                          <Tooltip title="Copy to clipboard">
                            <IconButton size="small" onClick={() => navigator.clipboard.writeText(bankDetails.walletAddress)}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                  No bank details found. Please complete your bank registration.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Fade>

        {/* Customer Management Section */}
        <Fade in={!loading}>
          <Card>
            <CardContent>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                variant="fullWidth"
              >
                <Tab label={`Pending Requests (${pendingRequests.length})`} 
                     sx={{ color: 'white' }}/>
                <Tab label={`Approved Customers (${approvedCustomers.length})`} 
                     sx={{ color: 'white' }}/>
                <Tab label={`Access Requests (${accessRequests.length})`}
                     sx={{ color: 'white' }} />
              </Tabs>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: theme.palette.accent.main }} />
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {tabValue === 0 && (
                    memoizedPendingRequests.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Customer</TableCell>
                              <TableCell>Document</TableCell>
                              <TableCell>Wallet</TableCell>
                              <TableCell>Request Date</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {memoizedPendingRequests.map((request) => (
                              <TableRow key={request.customerId} hover>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ width: 32, height: 32 }}>
                                      {getInitial(request.username)}
                                    </Avatar>
                                    {request.username}
                                  </Box>
                                </TableCell>
                                <TableCell>{request.documentName}</TableCell>
                                <TableCell>
                                  <Tooltip title={request.customerAddress}>
                                    <span>{request.formattedAddress}</span>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>{request.formattedDate}</TableCell>
                                <TableCell>
                                  <Button 
                                    size="small"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setOpenDialog(true);
                                    }}
                                  >
                                    Review
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                        No pending customer requests
                      </Typography>
                    )
                  )}
                  
                  {tabValue === 1 && (
                    memoizedApprovedCustomers.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Customer</TableCell>
                              <TableCell>Document</TableCell>
                              <TableCell>Wallet</TableCell>
                              <TableCell>Approval Date</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {memoizedApprovedCustomers.map((customer) => (
                              <TableRow key={customer.id} hover>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ width: 32, height: 32 }}>
                                      {getInitial(customer.username)}
                                    </Avatar>
                                    {customer.username}
                                  </Box>
                                </TableCell>
                                <TableCell>{customer.documentName}</TableCell>
                                <TableCell>
                                  <Tooltip title={customer.walletAddress}>
                                    <span>{customer.formattedAddress}</span>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>{customer.formattedDate}</TableCell>
                                <TableCell>
                                  <Chip 
                                    icon={statusConfig[customer.status]?.icon}
                                    label={statusConfig[customer.status]?.label}
                                    color={statusConfig[customer.status]?.color}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    size="small"
                                    onClick={() => requestCustomerAccess(customer.id)}
                                  >
                                    Request Documents
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                        No approved customers
                      </Typography>
                    )
                  )}
                  
                  {tabValue === 2 && (
                    memoizedAccessRequests.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Customer</TableCell>
                              <TableCell>Bank</TableCell>
                              <TableCell>Request Date</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {memoizedAccessRequests.map((request, index) => (
                              <TableRow key={index} hover>
                                <TableCell>{request.customerName}</TableCell>
                                <TableCell>{request.bankName}</TableCell>
                                <TableCell>{request.formattedDate}</TableCell>
                                <TableCell>
                                  {request.responded ? (
                                    <Chip 
                                      label={request.accessGranted ? 'Granted' : 'Denied'}
                                      color={request.accessGranted ? 'success' : 'error'}
                                      size="small"
                                    />
                                  ) : (
                                    <Chip 
                                      label="Pending"
                                      color="warning"
                                      size="small"
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                        No access requests
                      </Typography>
                    )
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>

        {/* Request Review Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => {
            setOpenDialog(false);
            setRemarks('');
            setError('');
          }}
          maxWidth="md"
          fullWidth
          TransitionComponent={Fade}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon />
              <Typography>Review KYC Request</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedRequest && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6">
                    {selectedRequest.username}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.textSecondary.main }}>
                    Customer ID: {selectedRequest.customerId} | Request Date: {formatDate(selectedRequest.requestDate)}
                  </Typography>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: theme.palette.textSecondary.main }}>
                      <strong>Document Name:</strong>
                    </Typography>
                    <Typography>{selectedRequest.documentName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: theme.palette.textSecondary.main }}>
                      <strong>Wallet Address:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {selectedRequest.customerAddress}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Submitted Documents:
                </Typography>
                <List dense>
                  {selectedRequest.documents.map((doc, index) => (
                    <ListItem key={index} sx={{ py: 1 }}>
                      <ListItemText
                        primary={`Document ${index + 1}`}
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                Type:
                              </Typography>
                              <Typography variant="body2">
                                {doc.docType}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                Hash:
                              </Typography>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                {doc.docHash}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  sx={{ mt: 2 }}
                  placeholder="Enter your approval/rejection remarks..."
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleRequestAction('reject', selectedRequest?.customerId)}
              variant="contained"
              startIcon={<CancelIcon />}
              color="error"
              disabled={loading}
            >
              Reject
            </Button>
            <Button 
              onClick={() => handleRequestAction('approve', selectedRequest?.customerId)}
              variant="contained"
              startIcon={<CheckCircleIcon />}
              color="success"
              disabled={loading}
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default BankDashboard;
