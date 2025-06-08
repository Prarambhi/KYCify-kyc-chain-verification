import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Link,
  TextField,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import VerifiedIcon from '@mui/icons-material/Verified';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import KYCContractABI from '../contracts/KYCContract.json';
import RefreshIcon from '@mui/icons-material/Refresh';

const darkBlueTheme = {
  primary: '#0a192f',
  secondary: '#172a45',
  accent: '#64ffda',
  textPrimary: '#e6f1ff',
  textSecondary: '#8892b8',
  paperBackground: '#112240'
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: darkBlueTheme.accent,
    },
    secondary: {
      main: darkBlueTheme.textSecondary,
    },
    background: {
      default: darkBlueTheme.primary,
      paper: darkBlueTheme.paperBackground,
    },
    text: {
      primary: darkBlueTheme.textPrimary,
      secondary: darkBlueTheme.textSecondary,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 'bold',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'rgba(100, 255, 218, 0.1)',
          },
        },
        contained: {
          backgroundColor: darkBlueTheme.accent,
          color: darkBlueTheme.primary,
          '&:hover': {
            backgroundColor: '#52d1b9',
          },
        },
        outlined: {
          borderColor: darkBlueTheme.accent,
          color: darkBlueTheme.accent,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: darkBlueTheme.paperBackground,
          border: `1px solid ${darkBlueTheme.secondary}`,
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          color: darkBlueTheme.textPrimary,
          '&.Mui-active': {
            color: darkBlueTheme.accent,
          },
          '&.Mui-completed': {
            color: darkBlueTheme.textSecondary,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
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
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          '&:focus': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: darkBlueTheme.secondary,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 'bold',
        },
      },
    },
  },
});

const CONTRACT_ADDRESS = "0x902D8529aF70C4578e50146298f5B51D93a91388";

const convertBigInt = (value) => {
  if (typeof value === 'bigint') {
    return Number(value.toString());
  }
  return value;
};

const CustomerDashboard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedBank, setSelectedBank] = useState('');
  const [documents, setDocuments] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(0);
  const [verificationHash, setVerificationHash] = useState('');
  const [bankRequests, setBankRequests] = useState([]);
  const [availableBanks, setAvailableBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);
  const [ipfsHashes, setIpfsHashes] = useState({});
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerDocuments, setCustomerDocuments] = useState([]);

  const steps = ['Upload Documents', 'Select Bank', 'Verification'];

  const requiredDocuments = [
    { name: "Government-issued ID", types: ["Passport", "Driver's License", "National ID"] },
    { name: "Proof of Address", types: ["Utility Bill", "Bank Statement", "Lease Agreement"] },
    { name: "Tax Identification Number", types: ["TIN Certificate", "Tax Return"] }
  ];

  const statusMap = {
    0: 'Pending',
    1: 'Approved',
    2: 'Rejected',
    3: 'Verified'
  };

  const getStatusChip = (status) => {
    const statusText = statusMap[status] || 'Unknown';
    let color = 'default';
    
    switch (status) {
      case 0: color = 'warning'; break;
      case 1: color = 'success'; break;
      case 2: color = 'error'; break;
      case 3: color = 'info'; break;
      default: color = 'default';
    }
    
    return <Chip label={statusText} color={color} />;
  };

  const getCustomerId = async (contract, address) => {
    try {
      if (contract.getCustomerIdByAddress) {
        const id = await contract.getCustomerIdByAddress(address);
        return convertBigInt(id);
      }
      return 0;
    } catch (err) {
      console.error("Error getting customer ID:", err);
      return 0;
    }
  };

  const fetchCustomerData = async (contract, customerId) => {
    try {
      const [customer, docs] = await Promise.all([
        contract.customers(customerId),
        contract.getCustomerDocuments(customerId)
      ]);
  
      const customerData = {
        id: convertBigInt(customerId),
        username: customer.username,
        status: convertBigInt(customer.status),
        bankId: convertBigInt(customer.bankId),
        approvalDate: convertBigInt(customer.approvalDate),
        remarks: customer.remarks,
        verificationHash: customer.verificationHash
      };
  
      setCustomerDetails(customerData);
      setCustomerDocuments(docs);
      setVerificationStatus(customerData.status);
      
      // Update current step based on status
      if (customerData.status === 1 || customerData.status === 3) {
        setCurrentStep(2); // Approved or Verified
      } else if (customerData.status === 2) {
        setCurrentStep(2); // Rejected
      } else if (docs.length > 0) {
        setCurrentStep(1); // Documents uploaded but pending
      }
  
      return customerData;
    } catch (err) {
      console.error("Error fetching customer data:", err);
      throw err;
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        KYCContractABI.abi,
        signer
      );
  
      // Get customer ID and data
      const customerAddress = await signer.getAddress();
      const customerId = await getCustomerId(contract, customerAddress);
      
      if (customerId > 0) {
        const customerData = await fetchCustomerData(contract, customerId);
        
        // Only fetch banks if needed
        if (customerData.status === 0 || customerData.bankId === 0) {
          const approvedCount = await contract.approvedBankCount();
          if (approvedCount > 0) {
            const banks = await contract.getApprovedBanks();
            setAvailableBanks(banks.map(bank => ({
              id: convertBigInt(bank.id),
              name: bank.name,
              country: bank.country,
              state: bank.state,
              pincode: bank.pincode,
              address: bank.walletAddress,
              isApproved: bank.isApproved
            })));
          }
        }
  
        // Get bank requests
        const requests = await contract.getCustomerBankRequests(customerId);
        setBankRequests(requests.map(req => ({
          bankId: convertBigInt(req.bankId),
          requestDate: convertBigInt(req.requestDate) * 1000, // Convert to ms
          responded: req.responded,
          accessGranted: req.accessGranted
        })));
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError(`Failed to refresh data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  refreshData();

  const setupListeners = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        KYCContractABI.abi,
        signer
      );

      // Add this new event listener for access requests
      contract.on("BankRequestedAccess", (customerId, bankId, bankName) => {
        console.log(`Bank ${bankId} (${bankName}) requested access for customer ${customerId}`);
        refreshData();
      });
        // Listen for all status change events
        contract.on("CustomerApproved", (customerId, bankId) => {
          console.log(`Customer ${customerId} approved by bank ${bankId}`);
          refreshData();
        });
        
        contract.on("CustomerRejected", (customerId, bankId) => {
          console.log(`Customer ${customerId} rejected by bank ${bankId}`);
          refreshData();
        });
        
        contract.on("CustomerVerified", (customerId, verificationHash) => {
          console.log(`Customer ${customerId} verified with hash ${verificationHash}`);
          refreshData();
        });
        
        contract.on("StatusChanged", (customerId, newStatus) => {
          console.log(`Customer ${customerId} status changed to ${newStatus}`);
          refreshData();
        });
      }
    };
  
    setupListeners();
  
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError(`Invalid file type(s). Only PDF, JPG, and PNG are allowed.`);
      return;
    }
    
    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError(`File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')} (max 10MB each)`);
      return;
    }
    
    setDocuments(files);
    setCurrentStep(1);
  };

  const uploadToIPFS = async () => {
    setUploading(true);
    setError('');
    
    try {
      const hashes = {};
      const pinataResponses = [];
      
      if (!process.env.REACT_APP_PINATA_API_KEY || !process.env.REACT_APP_PINATA_SECRET) {
        throw new Error('Pinata API credentials are missing');
      }
  
      for (const file of documents) {
        const formData = new FormData();
        formData.append('file', file);
        
        formData.append('pinataMetadata', JSON.stringify({
          name: file.name,
          keyvalues: {
            timestamp: Date.now(),
            documentType: file.name.split('.').pop().toUpperCase()
          }
        }));
  
        const response = await axios.post(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
              'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET,
            },
            maxBodyLength: Infinity
          }
        );
  
        hashes[file.name] = response.data.IpfsHash;
        pinataResponses.push({
          name: file.name,
          hash: response.data.IpfsHash,
          size: file.size,
          type: file.type
        });
      }
      
      setIpfsHashes(hashes);
      return pinataResponses;
    } catch (err) {
      console.error('IPFS upload error:', err);
      setError(`Failed to upload documents to IPFS: ${err.message}`);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSendForVerification = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Validate basic requirements
      if (!selectedBank) {
        throw new Error('Please select a bank');
      }
      if (documents.length === 0) {
        throw new Error('Please upload documents');
      }
  
      // 2. Upload documents to IPFS
      const pinataResponses = await uploadToIPFS();
  
      // 3. Setup provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        KYCContractABI.abi,
        signer
      );
      const customerAddress = await signer.getAddress();
  
      // 4. Verify customer exists
      const customerId = await contract.getCustomerIdByAddress(customerAddress);
      if (customerId === 0) {
        throw new Error('No customer profile found. Please register first.');
      }
  
      // 5. Verify bank status
      const bankId = Number(selectedBank);
      const bankInfo = await contract.banks(bankId);
      if (!bankInfo.isApproved) {
        throw new Error('Selected bank is not approved for KYC processing');
      }
  
      // 6. Prepare documents in the exact format expected by the contract
      const documentData = pinataResponses.map(doc => ({
        docType: doc.name.split('.').pop().toUpperCase(),
        docHash: doc.hash
      }));
  
      // 7. First simulate the call
      try {
        await contract.submitKYCRequest.staticCall(bankId, documentData);
      } catch (simulationError) {
        console.error("Transaction simulation failed:", simulationError);
        throw new Error(`Transaction will fail: ${simulationError.reason || simulationError.message}`);
      }
  
      // 8. Send the actual transaction
      const tx = await contract.submitKYCRequest(
        bankId,
        documentData,
        { gasLimit: 500000 }
      );
  
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setSuccess('Documents submitted for verification!');
        setVerificationStatus(0);
        setCurrentStep(2);
        setVerificationHash(receipt.transactionHash);
        await refreshData();
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(`Transaction failed: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      // Fallback for older browsers
      if (!navigator.clipboard) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } else {
        await navigator.clipboard.writeText(text);
      }
      
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard');
      return false;
    }
  };

  const handleRequestResponse = async (bankId, grantAccess) => {
    try {
      setLoading(true);
      setError('');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        KYCContractABI.abi,
        signer
      );
      
      const customerAddress = await signer.getAddress();
      const customerId = await contract.getCustomerIdByAddress(customerAddress);
      
      // First simulate the call
      try {
        await contract.respondToBankRequest.staticCall(
          customerId,
          bankId,
          grantAccess
        );
      } catch (simulationError) {
        console.error("Transaction simulation failed:", simulationError);
        throw new Error(`Transaction will fail: ${simulationError.reason || simulationError.message}`);
      }
      
      // Send the actual transaction
      const tx = await contract.respondToBankRequest(
        customerId,
        bankId,
        grantAccess,
        { gasLimit: 300000 }
      );
      
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setSuccess(`Request ${grantAccess ? 'approved' : 'rejected'} successfully!`);
        await refreshData();
      }
    } catch (err) {
      console.error("Request response error:", err);
      setError(err.reason || err.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        p: 4,
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${darkBlueTheme.primary} 0%, ${darkBlueTheme.secondary} 100%)`,
      }}>
        <Typography variant="h4" gutterBottom sx={{ 
          color: darkBlueTheme.accent,
          fontWeight: 'bold',
          mb: 4,
          textShadow: '0 0 10px rgba(100, 255, 218, 0.3)'
        }}>
          KYC Verification Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ 
            mb: 3,
            backgroundColor: 'rgba(211, 47, 47, 0.2)',
            borderLeft: `4px solid #d32f2f`
          }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ 
            mb: 3,
            backgroundColor: 'rgba(46, 125, 50, 0.2)',
            borderLeft: `4px solid #2e7d32`
          }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Customer Status Overview Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h5" sx={{ color: darkBlueTheme.accent }}>
                Your KYC Status
              </Typography>
              <Button 
                variant="outlined" 
                onClick={refreshData}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{
                  borderColor: darkBlueTheme.accent,
                  color: darkBlueTheme.accent
                }}
              >
                Refresh
              </Button>
            </Box>
            
            {customerDetails ? (
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 2,
                  p: 2,
                  backgroundColor: 'rgba(23, 42, 69, 0.5)',
                  borderRadius: '4px'
                }}>
                  {getStatusChip(customerDetails.status)}
                  <Typography variant="body1">
                    <strong>Username:</strong> {customerDetails.username}
                  </Typography>
                </Box>
                
                {customerDetails.bankId > 0 && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong style={{ color: darkBlueTheme.accent }}>Bank:</strong> {
                      availableBanks.find(b => b.id === customerDetails.bankId)?.name || 
                      `Bank ID: ${customerDetails.bankId}`
                    }
                  </Typography>
                )}
                
                {customerDetails.approvalDate > 0 && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong style={{ color: darkBlueTheme.accent }}>Last Update:</strong> {new Date(customerDetails.approvalDate * 1000).toLocaleString()}
                  </Typography>
                )}
                
                {customerDetails.remarks && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong style={{ color: darkBlueTheme.accent }}>Remarks:</strong> {customerDetails.remarks}
                  </Typography>
                )}
                
                {customerDetails.verificationHash && (
                  <Typography variant="body1">
                    <strong style={{ color: darkBlueTheme.accent }}>Verification Hash:</strong> {customerDetails.verificationHash}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography>No KYC profile found. Please register first.</Typography>
            )}
          </CardContent>
        </Card>

        {/* KYC Process Stepper */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stepper activeStep={currentStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {currentStep === 0 && (
              <Box sx={{ 
                mt: 4, 
                textAlign: 'center',
                p: 3,
                border: `1px dashed ${darkBlueTheme.secondary}`,
                borderRadius: '8px'
              }}>
                <Button 
                  variant="outlined" 
                  startIcon={<InfoIcon />} 
                  onClick={() => setInfoOpen(true)}
                  sx={{ 
                    mb: 2,
                    borderColor: darkBlueTheme.accent,
                    color: darkBlueTheme.accent
                  }}
                >
                  View Required Documents
                </Button>
                
                <input 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  style={{ display: 'none' }} 
                  id="document-upload" 
                  type="file" 
                  multiple 
                  onChange={handleDocumentUpload} 
                />
                <label htmlFor="document-upload">
                  <Button 
                    variant="contained" 
                    component="span" 
                    startIcon={<CloudUploadIcon />} 
                    size="large" 
                    sx={{ 
                      mb: 2,
                      backgroundColor: darkBlueTheme.accent,
                      color: darkBlueTheme.primary,
                      '&:hover': {
                        backgroundColor: '#52d1b9'
                      }
                    }}
                  >
                    Upload KYC Documents
                  </Button>
                </label>
                
                {documents.length > 0 && (
                  <Box sx={{ 
                    mt: 2,
                    p: 2,
                    backgroundColor: 'rgba(23, 42, 69, 0.5)',
                    borderRadius: '8px'
                  }}>
                    <Typography variant="subtitle1" sx={{ color: darkBlueTheme.accent }}>
                      Selected Documents:
                    </Typography>
                    <List dense>
                      {documents.map((doc, index) => (
                        <ListItem key={index}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: darkBlueTheme.secondary }}>
                              <DescriptionIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={doc.name} 
                            secondary={`${(doc.size / 1024).toFixed(2)} KB - ${doc.type}`} 
                            primaryTypographyProps={{ color: darkBlueTheme.textPrimary }}
                            secondaryTypographyProps={{ color: darkBlueTheme.textSecondary }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}

            {currentStep === 1 && (
              <Box sx={{ mt: 4 }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: darkBlueTheme.textSecondary }}>
                    Select Bank for Verification
                  </InputLabel>
                  <Select
                    value={selectedBank}
                    label="Select Bank for Verification"
                    onChange={(e) => setSelectedBank(e.target.value)}
                    disabled={availableBanks.length === 0}
                    sx={{
                      color: darkBlueTheme.textPrimary,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: darkBlueTheme.secondary,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: darkBlueTheme.accent,
                      },
                    }}
                  >
                    {availableBanks.length > 0 ? (
                      availableBanks.map((bank) => (
                        <MenuItem key={bank.id} value={bank.id}>
                          {bank.name} - {bank.country}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No banks available</MenuItem>
                    )}
                  </Select>
                </FormControl>

                {Object.keys(ipfsHashes).length > 0 && (
                  <Box sx={{ 
                    mb: 3, 
                    p: 2, 
                    border: `1px solid ${darkBlueTheme.secondary}`, 
                    borderRadius: '8px',
                    backgroundColor: 'rgba(23, 42, 69, 0.5)'
                  }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: darkBlueTheme.accent }}>
                      Document IPFS Hashes:
                    </Typography>
                    {Object.entries(ipfsHashes).map(([filename, hash]) => (
                      <Box key={filename} sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold',
                          color: darkBlueTheme.textPrimary
                        }}>
                          {filename}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <TextField
                            value={hash}
                            size="small"
                            fullWidth
                            InputProps={{ 
                              readOnly: true,
                              sx: {
                                color: darkBlueTheme.textPrimary,
                                backgroundColor: 'rgba(10, 25, 47, 0.5)',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem'
                              }
                            }}
                            sx={{ mr: 1 }}
                          />
                          <Button 
                            size="small" 
                            onClick={() => copyToClipboard(hash)}
                            startIcon={<ContentCopyIcon />}
                            sx={{
                              color: darkBlueTheme.accent,
                              borderColor: darkBlueTheme.accent
                            }}
                            variant="outlined"
                          >
                            Copy
                          </Button>
                        </Box>
                        <Link 
                          href={`https://gateway.pinata.cloud/ipfs/${hash}`} 
                          target="_blank" 
                          rel="noopener"
                          sx={{ 
                            fontSize: '0.8rem',
                            color: darkBlueTheme.accent,
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          View on IPFS
                        </Link>
                      </Box>
                    ))}
                  </Box>
                )}

                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleSendForVerification}
                  disabled={!selectedBank || loading || uploading}
                  fullWidth
                  size="large"
                  sx={{
                    backgroundColor: darkBlueTheme.accent,
                    color: darkBlueTheme.primary,
                    '&:hover': {
                      backgroundColor: '#52d1b9'
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(100, 255, 218, 0.3)'
                    }
                  }}
                >
                  {uploading ? 'Uploading to IPFS...' : loading ? <CircularProgress size={24} /> : 'Send for Verification'}
                </Button>
              </Box>
            )}

            {currentStep === 2 && (
              <Box sx={{ 
                mt: 4, 
                textAlign: 'center',
                p: 3,
                border: `1px solid ${darkBlueTheme.secondary}`,
                borderRadius: '8px'
              }}>
                {verificationStatus === 1 ? (
                  <>
                    <VerifiedIcon sx={{ 
                      fontSize: 60, 
                      mb: 2,
                      color: darkBlueTheme.accent
                    }} />
                    <Typography variant="h5" gutterBottom sx={{ color: darkBlueTheme.accent }}>
                      Your KYC Documents Are Verified!
                    </Typography>
                    {verificationHash && (
                      <Typography variant="body1" sx={{ 
                        mb: 2,
                        color: darkBlueTheme.textPrimary
                      }}>
                        Transaction Hash: {verificationHash}
                      </Typography>
                    )}
                    
                    <Box sx={{ mt: 3, textAlign: 'left' }}>
                      <Typography variant="h6" gutterBottom sx={{ color: darkBlueTheme.accent }}>
                        Your Documents:
                      </Typography>
                      {customerDocuments.map((doc, index) => (
                        <Card key={index} sx={{ 
                          mb: 2, 
                          p: 2,
                          backgroundColor: 'rgba(23, 42, 69, 0.5)'
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                          }}>
                            <Typography variant="body1" sx={{ color: darkBlueTheme.textPrimary }}>
                              Document {index + 1}
                            </Typography>
                            <Box>
                              <Button 
                                size="small" 
                                onClick={() => copyToClipboard(doc.docHash)}
                                startIcon={<ContentCopyIcon />}
                                sx={{ 
                                  mr: 1,
                                  color: darkBlueTheme.accent,
                                  borderColor: darkBlueTheme.accent
                                }}
                                variant="outlined"
                              >
                                Copy Hash
                              </Button>
                              <Button 
                                variant="outlined" 
                                size="small"
                                href={`https://gateway.pinata.cloud/ipfs/${doc.docHash}`}
                                target="_blank"
                                sx={{
                                  color: darkBlueTheme.accent,
                                  borderColor: darkBlueTheme.accent
                                }}
                              >
                                View Document
                              </Button>
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ 
                            mt: 1,
                            color: darkBlueTheme.textSecondary
                          }}>
                            Type: {doc.docType}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            fontFamily: 'monospace', 
                            wordBreak: 'break-all',
                            color: darkBlueTheme.textPrimary
                          }}>
                            IPFS Hash: {doc.docHash}
                          </Typography>
                        </Card>
                      ))}
                    </Box>
                  </>
                ) : verificationStatus === 2 ? (
                  <>
                    <VerifiedIcon sx={{ 
                      fontSize: 60, 
                      mb: 2,
                      color: '#f44336'
                    }} />
                    <Typography variant="h5" gutterBottom sx={{ color: '#f44336' }}>
                      Your KYC Was Rejected
                    </Typography>
                    {customerDetails?.remarks && (
                      <Typography variant="body1" sx={{ 
                        mb: 2,
                        color: darkBlueTheme.textPrimary
                      }}>
                        Reason: {customerDetails.remarks}
                      </Typography>
                    )}
                    <Button 
                      variant="contained" 
                      onClick={() => setCurrentStep(0)}
                      sx={{ 
                        mt: 2,
                        backgroundColor: darkBlueTheme.accent,
                        color: darkBlueTheme.primary
                      }}
                    >
                      Resubmit Documents
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography variant="h5" gutterBottom sx={{ color: darkBlueTheme.accent }}>
                      Verification In Progress
                    </Typography>
                    <Typography variant="body1" sx={{ color: darkBlueTheme.textPrimary }}>
                      Your documents are being reviewed by {availableBanks.find(b => b.id === selectedBank)?.name || 'the bank'}
                    </Typography>
                    
                    {Object.keys(ipfsHashes).length > 0 && (
                      <Box sx={{ 
                        mt: 3, 
                        textAlign: 'left',
                        p: 2,
                        backgroundColor: 'rgba(23, 42, 69, 0.5)',
                        borderRadius: '8px'
                      }}>
                        <Typography variant="subtitle1" sx={{ color: darkBlueTheme.accent }}>
                          Uploaded Documents:
                        </Typography>
                        {Object.entries(ipfsHashes).map(([filename, hash]) => (
                          <Box key={filename} sx={{ 
                            mb: 1, 
                            p: 1, 
                            borderBottom: `1px solid ${darkBlueTheme.secondary}`
                          }}>
                            <Typography variant="body2" sx={{ color: darkBlueTheme.textPrimary }}>
                              {filename}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              fontFamily: 'monospace', 
                              wordBreak: 'break-all',
                              color: darkBlueTheme.textSecondary
                            }}>
                              {hash}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Bank Requests Section */}
<Box sx={{ mb: 4 }}>
  <Typography variant="h5" gutterBottom sx={{ 
    color: darkBlueTheme.accent,
    display: 'flex',
    alignItems: 'center',
    gap: 2
  }}>
    Bank Access Requests
    <Button 
      variant="outlined" 
      onClick={refreshData}
      disabled={loading}
      startIcon={<RefreshIcon />}
      size="small"
      sx={{
        borderColor: darkBlueTheme.accent,
        color: darkBlueTheme.accent
      }}
    >
      Refresh
    </Button>
  </Typography>

  {loading ? (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <CircularProgress sx={{ color: darkBlueTheme.accent }} />
    </Box>
  ) : bankRequests.length > 0 ? (
    <>
      {/* Pending Requests */}
      {bankRequests.filter(req => !req.responded).length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            color: darkBlueTheme.accent,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            Pending Approval
            <Chip 
              label={bankRequests.filter(req => !req.responded).length} 
              color="warning" 
              size="small"
            />
          </Typography>
          <Card>
            <List>
              {bankRequests
                .filter(req => !req.responded)
                .map((request, index) => (
                  <React.Fragment key={`pending-${index}`}>
                    <ListItem sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(23, 42, 69, 0.5)'
                      }
                    }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: darkBlueTheme.secondary }}>
                          {request.bankName?.charAt(0) || 'B'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={request.bankName || `Bank ID: ${request.bankId}`}
                        secondary={
                          <>
                            <span>Requested on {new Date(request.requestDate).toLocaleString()}</span>
                            {request.purpose && (
                              <><br /><span>Purpose: {request.purpose}</span></>
                            )}
                          </>
                        }
                        primaryTypographyProps={{ color: darkBlueTheme.textPrimary }}
                        secondaryTypographyProps={{ color: darkBlueTheme.textSecondary }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleRequestResponse(request.bankId, true)}
                          sx={{
                            backgroundColor: '#4caf50',
                            '&:hover': { backgroundColor: '#3d8b40' }
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleRequestResponse(request.bankId, false)}
                          sx={{
                            backgroundColor: '#f44336',
                            '&:hover': { backgroundColor: '#d32f2f' }
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </ListItem>
                    {index < bankRequests.filter(req => !req.responded).length - 1 && (
                      <Divider sx={{ borderColor: darkBlueTheme.secondary }} />
                    )}
                  </React.Fragment>
                ))}
            </List>
          </Card>
        </Box>
      )}

      {/* Request History */}
      {bankRequests.filter(req => req.responded).length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ 
            color: darkBlueTheme.accent,
            mb: 2
          }}>
            Request History
          </Typography>
          <Card>
          <TableContainer>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Bank</TableCell>
        <TableCell>Request Date</TableCell>
        <TableCell>Purpose</TableCell>
        <TableCell>Status</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {bankRequests
        .filter(request => request.responded)
        .map((request, index) => (
          <TableRow key={`history-${index}`}>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: request.accessGranted ? 'success.main' : 'error.main'
                }}>
                  {request.bankName?.charAt(0) || 'B'}
                </Avatar>
                {request.bankName || `Bank ID: ${request.bankId}`}
              </Box>
            </TableCell>
            <TableCell>
              {new Date(request.requestDate).toLocaleString()}
            </TableCell>
            <TableCell>
              {request.purpose || 'N/A'}
            </TableCell>
            <TableCell>
              <Chip 
                label={request.accessGranted ? 'Approved' : 'Rejected'} 
                color={request.accessGranted ? 'success' : 'error'}
                variant="outlined"
              />
            </TableCell>
          </TableRow>
        ))}
    </TableBody>
  </Table>
</TableContainer>
          </Card>
        </Box>
      )}
    </>
  ) : (
    <Card sx={{ p: 3 }}>
      <Typography sx={{ 
        color: darkBlueTheme.textSecondary,
        textAlign: 'center'
      }}>
        No bank access requests yet. Banks will appear here when they request access to your KYC documents.
      </Typography>
    </Card>
  )}
</Box>

        {/* Document Requirements Dialog */}
        <Dialog 
          open={infoOpen} 
          onClose={() => setInfoOpen(false)} 
          maxWidth="md"
          PaperProps={{
            sx: {
              backgroundColor: darkBlueTheme.paperBackground,
              border: `1px solid ${darkBlueTheme.secondary}`
            }
          }}
        >
          <DialogTitle sx={{ color: darkBlueTheme.accent }}>
            KYC Document Requirements
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: darkBlueTheme.textPrimary }}>
              Please upload clear copies of these documents:
            </DialogContentText>
            <List>
              {requiredDocuments.map((doc, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={`${index + 1}. ${doc.name}`} 
                    primaryTypographyProps={{ color: darkBlueTheme.textPrimary }}
                    secondary={`Accepted formats: ${doc.types.join(', ')}`} 
                    secondaryTypographyProps={{ color: darkBlueTheme.textSecondary }}
                    sx={{ py: 1 }} 
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ 
              backgroundColor: 'rgba(23, 42, 69, 0.5)',
              p: 2, 
              borderRadius: 1, 
              mt: 2 
            }}>
              <Typography variant="subtitle2" sx={{ color: darkBlueTheme.accent }}>
                <strong>Requirements:</strong>
              </Typography>
              <ul style={{ color: darkBlueTheme.textSecondary }}>
                <li><Typography variant="body2">Files must be under 10MB each</Typography></li>
                <li><Typography variant="body2">Accepted formats: PDF, JPG, PNG</Typography></li>
                <li><Typography variant="body2">Documents must be valid and not expired</Typography></li>
                <li><Typography variant="body2">All text must be clearly visible</Typography></li>
              </ul>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setInfoOpen(false)}
              sx={{ color: darkBlueTheme.accent }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default CustomerDashboard;