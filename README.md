# KYCify-kyc-chain-verification
Decentralized KYC Verification System built with Solidity, React.js, IPFS, and MetaMask/Firebase. Enables secure, role-based interaction between Customers, Banks, and Admins, ensuring privacy, transparency, and immutable document verification on the blockchain.
# KYC Verification Using Blockchain - README

## Project Overview
This project implements a Know Your Customer (KYC) verification system using blockchain technology to create a secure, transparent, and decentralized identity verification platform for banks and their customers.

## Key Features
- Secure admin portal for bank approval and oversight
- Bank registration and customer verification system
- Blockchain-based document storage and verification
- Transparent audit trail for all KYC processes

## System Components

### 1. Admin Portal
![Admin Login](admin_login.png)
- Secure login for administrators
- Wallet connection for blockchain access
- Privileged access to approve/deny bank registrations

![Admin Dashboard](admin_dashboard.png)
- View pending bank approval requests
- Manage approved banks
- Monitor system activity

### 2. Bank Portal
![Bank Registration](bank_registration.png)
- New banks complete KYC verification
- Provide bank details, location, and admin information
- Registration submitted for admin approval

![Bank Login](bank_login.png)
- Secure login for approved banks
- Wallet connection for blockchain operations

![Bank Dashboard](bank_dashboard.png)
- View pending customer verification requests
- Manage approved customers
- Access bank details and agent information

### 3. Customer KYC Portal
![Customer Dashboard](customer_dashboard.png)
- Customers upload documents for verification
- Select bank for KYC submission
- View document status and IPFS storage details

## Workflow Process

### Step 1: Bank Registration
1. Bank completes registration form with all required details
2. System submits request to admin for approval
3. Admin reviews and approves/denies request (see admin_approve.png)

### Step 2: Customer KYC Submission
1. Customer logs in and uploads documents
2. Documents are stored on IPFS (InterPlanetary File System)
3. Customer selects bank for verification
4. Request is sent to the chosen bank

### Step 3: Bank Verification
1. Bank receives KYC request in dashboard
2. Bank reviews submitted documents
3. Bank approves or requests additional information
4. Status is updated on blockchain

### Step 4: Verification Completion
![Customer Approved KYC](customer_approved_kyc.png)
- Customer receives notification of approval
- All documents and verification status are recorded on blockchain
- Audit trail is permanently maintained

## Technical Implementation
- Blockchain wallet integration for all parties
- Smart contracts for managing approval workflows
- IPFS for decentralized document storage
- Cryptographic verification of all transactions

## Getting Started
1. Install MetaMask or compatible wallet
2. Connect wallet to the application
3. Register as appropriate (admin/bank/customer)
4. Follow the on-screen instructions for your role

## Security Features
- All sensitive operations require wallet signatures
- Documents are encrypted and stored on IPFS
- Immutable record of all verification activities
- Role-based access control

This system provides a secure, transparent alternative to traditional KYC processes by leveraging blockchain technology for identity verification.
