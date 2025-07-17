import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { PersonAdd, Visibility } from '@mui/icons-material';
import { useWeb3 } from '../context/Web3Context';

const AdminPanel = () => {
  const { contract, account } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    completedProducts: 0
  });

  const [newParticipant, setNewParticipant] = useState({
    address: '',
    role: '',
    name: '',
    location: ''
  });

  const roles = [
    { value: 1, label: 'Farmer' },
    { value: 2, label: 'Processor' },
    { value: 3, label: 'Warehouse' },
    { value: 4, label: 'Distributor' },
    { value: 5, label: 'Retailer' }
  ];

  const stages = ['Cultivation', 'Processing', 'Warehousing', 'Distribution', 'Retail', 'Sold'];

  useEffect(() => {
    if (contract && account) {
      loadAdminData();
    }
  }, [contract, account]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      const products = [];
      let productCounter = 0;
      
      try {
        productCounter = await contract.productCounter();
      } catch (err) {
        console.log('No products yet');
      }

      for (let i = 1; i <= productCounter; i++) {
        try {
          const product = await contract.products(i);
          if (product.exists) {
            products.push({
              id: i,
              batchId: product.batchId,
              productName: product.productName,
              origin: product.origin,
              currentStage: Number(product.currentStage),
              currentOwner: product.currentOwner,
              timestamp: new Date(Number(product.timestamp) * 1000).toLocaleDateString()
            });
          }
        } catch (err) {
          console.log(`Error loading product ${i}:`, err);
        }
      }

      setAllProducts(products);
      setStats({
        totalProducts: products.length,
        activeProducts: products.filter(p => p.currentStage < 5).length,
        completedProducts: products.filter(p => p.currentStage === 5).length
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterParticipant = async () => {
    if (!newParticipant.address || !newParticipant.role || !newParticipant.name || !newParticipant.location) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tx = await contract.registerParticipant(
        newParticipant.address,
        newParticipant.role,
        newParticipant.name,
        newParticipant.location
      );

      await tx.wait();

      setSuccess('Participant registered successfully!');
      setOpenDialog(false);
      setNewParticipant({ address: '', role: '', name: '', location: '' });

    } catch (err) {
      console.error('Error registering participant:', err);
      setError(err.reason || err.message || 'Failed to register participant');
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage) => {
    const colors = ['success', 'info', 'warning', 'secondary', 'primary', 'default'];
    return colors[stage] || 'default';
  };

  if (loading && allProducts.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Admin Panel...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tea Board Authority - Admin Panel
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">
                {stats.totalProducts}
              </Typography>
              <Typography color="textSecondary">
                Total Products
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {stats.activeProducts}
              </Typography>
              <Typography color="textSecondary">
                Active Products
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="secondary.main">
                {stats.completedProducts}
              </Typography>
              <Typography color="textSecondary">
                Completed Products
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setOpenDialog(true)}
          sx={{ mr: 2 }}
        >
          Register Participant
        </Button>
        <Button
          variant="outlined"
          startIcon={<Visibility />}
          onClick={loadAdminData}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Products Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Products in Supply Chain
          </Typography>
          {allProducts.length === 0 ? (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No products found in the system.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Batch ID</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Origin</TableCell>
                    <TableCell>Current Stage</TableCell>
                    <TableCell>Current Owner</TableCell>
                    <TableCell>Created Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {product.batchId}
                        </Typography>
                      </TableCell>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell>{product.origin}</TableCell>
                      <TableCell>
                        <Chip
                          label={stages[product.currentStage]}
                          color={getStageColor(product.currentStage)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {product.currentOwner.slice(0, 6)}...{product.currentOwner.slice(-4)}
                        </Typography>
                      </TableCell>
                      <TableCell>{product.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Register Participant Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Participant</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Wallet Address"
                value={newParticipant.address}
                onChange={(e) => setNewParticipant(prev => ({ ...prev, address: e.target.value }))}
                placeholder="0x..."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newParticipant.role}
                  label="Role"
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, role: e.target.value }))}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name/Company Name"
                value={newParticipant.name}
                onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter participant name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={newParticipant.location}
                onChange={(e) => setNewParticipant(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRegisterParticipant}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;