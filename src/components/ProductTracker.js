import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip
} from '@mui/material';
import { Search, QrCodeScanner } from '@mui/icons-material';
import { useWeb3 } from '../context/Web3Context';
import QRCode from 'qrcode.react';

const ProductTracker = () => {
  const { contract } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);
  const [productHistory, setProductHistory] = useState([]);
  const [batchId, setBatchId] = useState('');

  const stages = ['Cultivation', 'Processing', 'Warehousing', 'Distribution', 'Retail', 'Sold'];

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

  const trackProduct = async () => {
    if (!batchId.trim()) {
      setError('Please enter a batch ID');
      return;
    }

    setLoading(true);
    setError('');
    setProduct(null);
    setProductHistory([]);

    try {

      const productData = await contract.getProductByBatch(batchId);
      
      const productInfo = {
        id: productData.productId.toString(),
        batchId: productData.batchId,
        productName: productData.productName,
        origin: productData.origin,
        grade: productData.grade,
        quantity: productData.quantity.toString(),
        currentStage: Number(productData.currentStage),
        currentOwner: productData.currentOwner,
        timestamp: new Date(Number(productData.timestamp) * 1000)
      };

      // Get product history
      const history = await contract.getProductHistory(productData.productId);
      
      const historyData = history.map((stage, index) => ({
        stage: Number(stage.stage),
        stageName: stages[Number(stage.stage)],
        handler: stage.handler,
        location: stage.location,
        timestamp: new Date(Number(stage.timestamp) * 1000),
        notes: stage.notes
      }));

      setProduct(productInfo);
      setProductHistory(historyData);

    } catch (err) {
      console.error('Error tracking product:', err);
      setError('Product not found or error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Product Traceability
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          Track the complete journey of tea products through the supply chain
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Batch ID"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="Enter batch ID to track product"
            />
            <Button
              variant="contained"
              onClick={trackProduct}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Search />}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Tracking...' : 'Track'}
            </Button>
          </Box>
        </Box>

        {product && (
          <Grid container spacing={4}>

            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Product Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Batch ID
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
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
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Current Stage
                      </Typography>
                      <Chip
                        label={stages[product.currentStage]}
                        color={getStageColor(stages[product.currentStage])}
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Created Date
                      </Typography>
                      <Typography variant="body1">
                        {product.timestamp.toLocaleDateString()} {product.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* QR Code */}
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Product QR Code
                  </Typography>
                  <Box sx={{ display: 'inline-block', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <QRCode
                      value={JSON.stringify({
                        batchId: product.batchId,
                        productName: product.productName,
                        type: 'tea-supply-chain'
                      })}
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Scan to verify authenticity
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Supply Chain Journey
                  </Typography>
                  <Stepper orientation="vertical" activeStep={product.currentStage + 1}>
                    {productHistory.map((step, index) => (
                      <Step key={index} completed={true}>
                        <StepLabel>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight="bold">
                              {step.stageName}
                            </Typography>
                            <Chip
                              label="Completed"
                              color={getStageColor(step.stageName)}
                              size="small"
                            />
                          </Box>
                        </StepLabel>
                        <StepContent>
                          <Box sx={{ pb: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                              <strong>Location:</strong> {step.location}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              <strong>Handler:</strong> {step.handler.slice(0, 6)}...{step.handler.slice(-4)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              <strong>Date:</strong> {step.timestamp.toLocaleDateString()} {step.timestamp.toLocaleTimeString()}
                            </Typography>
                            {step.notes && (
                              <Typography variant="body2" color="textSecondary">
                                <strong>Notes:</strong> {step.notes}
                              </Typography>
                            )}
                          </Box>
                        </StepContent>
                      </Step>
                    ))}
                    
                    {stages.slice(product.currentStage + 1).map((stage, index) => (
                      <Step key={`future-${index}`} completed={false}>
                        <StepLabel>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" color="textSecondary">
                              {stage}
                            </Typography>
                            <Chip
                              label="Pending"
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default ProductTracker;