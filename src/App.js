import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import BankSignup from './components/BankSignup';
import BankLogin from './components/BankLogin';
import BankDashboard from './components/BankDashboard';
import HomePage from './components/HomePage'; 
import CustomerSignup from './components/CustomerSignup';
import CustomerLogin from './components/CustomerLogin';
import CustomerDashboard from './components/CustomerDashboard'; 
import LandingPage from './components/LandingPage'; 
import { WalletProvider } from './contexts/WalletContext';

function App() {
  return (
    <div className="App">
      <WalletProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} /> 
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/bank/signup" element={<BankSignup />} />
          <Route path="/bank/login" element={<BankLogin />} />
          <Route path="/bank/dashboard" element={<BankDashboard />} />
          <Route path="/customer/signup" element={<CustomerSignup />} />
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          
        </Routes>
      </WalletProvider>
    </div>
  );
}

export default App;