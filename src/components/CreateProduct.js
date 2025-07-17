import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useWeb3 } from '../context/Web3Context';
import QRCode from 'qrcode.react';

const CreateProduct = () => {
  const { contract } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [createdProduct, setCreatedProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    batchId: '',
    productName: '',
    origin: '',
    grade: '',
    quantity: '',
    notes: ''
  });

  const teaGrades = [
    'FTGFOP', 'TGFOP', 'GFOP', 'FOP', 'OP', 'PEKOE', 'BOP', 'BOPF', 'CTC', 'Dust'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateBatchId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const batchId = `TEA-${timestamp}-${random}`;
    setFormData(prev => ({
      ...prev,
      batchId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!contract) {
      setError('Contract not connected');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tx = await contract.createProduct(
        formData.batchId,
        formData.productName,
        formData.origin,
        formData.grade,
        formData.quantity,
        formData.notes
      );

      await tx.wait();

      setSuccess('Product created successfully!');
      setCreatedProduct({
        batchId: formData.batchId,
        productName: formData.productName
      });

      setFormData({
        batchId: '',
        productName: '',
        origin: '',
        grade: '',
        quantity: '',
        notes: ''
      });

    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.reason || err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Create New Tea Product
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          Register a new tea batch in the supply chain system
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

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Batch ID"
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., TEA-2024-001"
                />
                <Button
                  variant="outlined"
                  onClick={generateBatchId}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  Generate
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                required
                placeholder="e.g., Darjeeling Black Tea"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Origin"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                required
                placeholder="e.g., Darjeeling, West Bengal, India"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Tea Grade</InputLabel>
                <Select
                  name="grade"
                  value={formData.grade}
                  label="Tea Grade"
                  onChange={handleInputChange}
                >
                  {teaGrades.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity (kg)"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Additional information about the tea batch..."
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Add />}
                sx={{ mt: 2 }}
              >
                {loading ? 'Creating Product...' : 'Create Product'}
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* QR Code Display */}
        {createdProduct && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Product Created Successfully!
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              QR Code for Batch: {createdProduct.batchId}
            </Typography>
            <Box sx={{ display: 'inline-block', p: 2, bgcolor: 'white', borderRadius: 1 }}>
              <QRCode
                value={JSON.stringify({
                  batchId: createdProduct.batchId,
                  productName: createdProduct.productName,
                  type: 'tea-supply-chain'
                })}
                size={200}
                level="H"
                includeMargin={true}
              />
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Save this QR code for product tracking
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CreateProduct;