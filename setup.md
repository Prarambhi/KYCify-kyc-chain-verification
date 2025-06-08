# KYC Blockchain Verification - Setup Guide

## Prerequisites

### System Requirements
- Node.js (v16.x or later)
- npm (v8.x or later) or yarn
- Git
- MetaMask browser extension
- IPFS CLI (optional for local IPFS node)

### Smart Contract Development
- Truffle
- Solidity compiler (^0.8.0)

## Installation Steps

### 1. Clone the Repository

git clone https://github.com/yourusername/KYCify-kyc-chain-verification.git
cd KYCify-kyc-chain-verification

### 2. Install dependencies

npm install
### 3. Environment Configuration
Create a .env file in the root directory with these variables:

```env

REACT_APP_INFURA_ID=your_infura_project_id
REACT_APP_CONTRACT_ADDRESS=0xYourContractAddress
REACT_APP_IPFS_API_KEY=your_ipfs_api_key
REACT_APP_IPFS_SECRET=your_ipfs_api_secret
REACT_APP_IPFS_GATEWAY=https://your.ipfs.gateway
```
### 4. Smart Contract Deployment
Using Truffle:
```env

truffle migrate --network <network_name>
```

### Running the Application
Development Mode
```env
npm start
```
Access the application at: http://localhost:3000

### Wallet Configuration
MetaMask Setup
Install the MetaMask extension

Connect to your preferred network 
Import test accounts or create new ones

### Wallet Integration
The application will automatically detect MetaMask and prompt for connection when needed.
IPFS Configuration
Using Pinata (Recommended)
Create an account at Pinata.cloud
Generate API keys in the dashboard
Add keys to your .env file

### Local IPFS Node (Optional)
```env

ipfs init
```
