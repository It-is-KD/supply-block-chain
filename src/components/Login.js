import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import { useWeb3 } from '../context/Web3Context';

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { connectWallet, contract } = useWeb3();

  const roles = [
    { value: 'Farmer', label: 'Tea Farmer / Grower' },
    { value: 'Processor', label: 'Processor / Factory' },
    { value: 'Warehouse', label: 'Warehouse' },
    { value: 'Distributor', label: 'Distributor' },
    { value: 'Retailer', label: 'Retailer / Exporter' },
    { value: 'Authority', label: 'Tea Board Authority' }
  ];

  const handleLogin = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const walletResult = await connectWallet();
      if (!walletResult.success) {
        throw new Error(walletResult.error);
      }
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', selectedRole);
      setIsAuthenticated(true);
      setUserRole(selectedRole);
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Tea Supply Chain
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Blockchain-Based Traceability System
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Your Role</InputLabel>
          <Select
            value={selectedRole}
            label="Select Your Role"
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {roles.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleLogin}
          disabled={loading || !selectedRole}
          startIcon={loading ? <CircularProgress size={20} /> : <AccountBalanceWallet />}
          sx={{ py: 1.5 }}
        >
          {loading ? 'Connecting...' : 'Connect Wallet & Login'}
        </Button>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            <strong>Note:</strong> Make sure you have MetaMask installed and connected to the correct network.
            This demo allows role selection for testing purposes.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;