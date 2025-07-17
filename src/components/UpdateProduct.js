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
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material';
import { Update, Search } from '@mui/icons-material';
import { useWeb3 } from '../context/Web3Context';

const UpdateProduct = ({ userRole }) => {
  const { contract } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);
  const [batchId, setBatchId] = useState('');
  const [notes, setNotes] = useState('');

  const stageMapping = {
    'Processor': { from: 0, to: 1, stageName: 'Processing' },
    'Warehouse': { from: 1, to: 2, stageName: 'Warehousing' },
    'Distributor': { from: 2, to: 3, stageName: 'Distribution' },
    'Retailer': { from: 3, to: 4, stageName: 'Retail' }
  };

  const getStageText = (stage) => {
    const stages = ['Cultivation', 'Processing', 'Warehousing', 'Distribution', 'Retail', 'Sold'];
    return stages[stage] || 'Unknown';
  };

  const getStageColor = (stage) => {
    const colors = {
      'Cultivation': 'success',
      'Processing': 'info',
      'Warehousing': 'warning',
      'Distribution': 'secondary',
      'Retail': 'primary',
      'Sold': 'default'
    };
    return colors[stage] || 'default';
  };

  const searchProduct = async () => {
    if (!batchId.trim()) {
      setError('Please enter a batch ID');
      return;
    }

    setSearchLoading(true);
    setError('');
    setProduct(null);

    try {
      const productData = await contract.getProductByBatch(batchId);
      
      setProduct({
        id: productData.productId.toString(),
        batchId: productData.batchId,
        productName: productData.productName,
        origin: productData.origin,
        grade: productData.grade,
        quantity: productData.quantity.toString(),
        currentStage: Number(productData.currentStage),
        currentOwner: productData.currentOwner,
        timestamp: new Date(Number(productData.timestamp) * 1000).toLocaleDateString()
      });

    } catch (err) {
      console.error('Error searching product:', err);
      setError('Product not found or error occurred');
    } finally {
      setSearchLoading(false);
    }
  };

  const canUpdateProduct = () => {
    if (!product || !stageMapping[userRole]) return false;
    
    const expectedStage = stageMapping[userRole].from;
    return product.currentStage === expectedStage;
  };

  const updateProductStage = async () => {
    if (!product || !canUpdateProduct()) {
      setError('Cannot update this product at current stage');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const newStage = stageMapping[userRole].to;
      
      const tx = await contract.updateProductStage(
        product.id,
        newStage,
        notes || `Updated to ${stageMapping[userRole].stageName} stage`
      );

      await tx.wait();

      setSuccess(`Product successfully updated to ${stageMapping[userRole].stageName} stage!`);
      
      await searchProduct();
      setNotes('');

    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.reason || err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Update Product Stage
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          Update product to the next stage in the supply chain as a {userRole}
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

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Search Product
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Batch ID"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="Enter batch ID to search"
            />
            <Button
              variant="contained"
              onClick={searchProduct}
              disabled={searchLoading}
              startIcon={searchLoading ? <CircularProgress size={20} /> : <Search />}
              sx={{ minWidth: 120 }}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </Button>
          </Box>
        </Box>

        {product && (
          <>
            <Divider sx={{ mb: 3 }} />
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Batch ID
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {product.batchId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Product Name
                    </Typography>
                    <Typography variant="body1">
                      {product.productName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Origin
                    </Typography>
                    <Typography variant="body1">
                      {product.origin}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Grade
                    </Typography>
                    <Typography variant="body1">
                      {product.grade}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Quantity
                    </Typography>
                    <Typography variant="body1">
                      {product.quantity} kg
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Current Stage
                    </Typography>
                    <Chip
                      label={getStageText(product.currentStage)}
                      color={getStageColor(getStageText(product.currentStage))}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {canUpdateProduct() ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Update to {stageMapping[userRole].stageName} Stage
                </Typography>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  multiline
                  rows={3}
                  placeholder={`Add notes about the ${stageMapping[userRole].stageName.toLowerCase()} process...`}
                  sx={{ mb: 3 }}
                />
                <Button
                  variant="contained"
                  size="large"
                  onClick={updateProductStage}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Update />}
                >
                  {loading ? 'Updating...' : `Update to ${stageMapping[userRole].stageName}`}
                </Button>
              </Box>
            ) : (
              <Alert severity="info">
                This product is not ready for {userRole} stage update. 
                Current stage: {getStageText(product.currentStage)}
                {stageMapping[userRole] && (
                  <> (Expected: {getStageText(stageMapping[userRole].from)})</>
                )}
              </Alert>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default UpdateProduct;