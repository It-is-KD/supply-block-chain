import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Add,
  QrCodeScanner,
  Inventory,
  TrendingUp,
  Update
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const Dashboard = ({ userRole }) => {
  const navigate = useNavigate();
  const { contract, account } = useWeb3();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    completedProducts: 0
  });

  useEffect(() => {
    if (contract && account) {
      loadDashboardData();
    }
  }, [contract, account]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const productIds = await contract.getAllProductsByOwner(account);
      const productDetails = [];

      for (let id of productIds) {
        if (id.toString() !== '0') {
          const product = await contract.products(id);
          productDetails.push({
            id: id.toString(),
            batchId: product.batchId,
            productName: product.productName,
            origin: product.origin,
            grade: product.grade,
            quantity: product.quantity.toString(),
            currentStage: getStageText(product.currentStage),
            timestamp: new Date(Number(product.timestamp) * 1000).toLocaleDateString()
          });
        }
      }

      setProducts(productDetails);
      setStats({
        totalProducts: productDetails.length,
        activeProducts: productDetails.filter(p => p.currentStage !== 'Sold').length,
        completedProducts: productDetails.filter(p => p.currentStage === 'Sold').length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  const getRoleActions = () => {
    switch (userRole) {
      case 'Farmer':
        return [
          { label: 'Create New Product', icon: <Add />, action: () => navigate('/create-product'), color: 'primary' },
          { label: 'Track Products', icon: <QrCodeScanner />, action: () => navigate('/track'), color: 'secondary' }
        ];
      case 'Processor':
      case 'Warehouse':
      case 'Distributor':
      case 'Retailer':
        return [
          { label: 'Update Product Stage', icon: <Update />, action: () => navigate('/update-product'), color: 'primary' },
          { label: 'Track Products', icon: <QrCodeScanner />, action: () => navigate('/track'), color: 'secondary' }
        ];
      case 'Authority':
        return [
          { label: 'Admin Panel', icon: <Inventory />, action: () => navigate('/admin'), color: 'primary' },
          { label: 'Track Products', icon: <QrCodeScanner />, action: () => navigate('/track'), color: 'secondary' }
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {userRole} Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Inventory sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {stats.totalProducts}
                  </Typography>
                  <Typography color="textSecondary">
                    Total Products
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {stats.activeProducts}
                  </Typography>
                  <Typography color="textSecondary">
                    Active Products
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <QrCodeScanner sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="secondary.main">
                    {stats.completedProducts}
                  </Typography>
                  <Typography color="textSecondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {getRoleActions().map((action, index) => (
            <Button
              key={index}
              variant="contained"
              color={action.color}
              startIcon={action.icon}
              onClick={action.action}
              size="large"
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Products
          </Typography>
          {products.length === 0 ? (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No products found. {userRole === 'Farmer' ? 'Create your first product!' : 'Products will appear here when assigned to you.'}
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Batch ID</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Origin</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Quantity (kg)</TableCell>
                    <TableCell>Current Stage</TableCell>
                    <TableCell>Created Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {product.batchId}
                        </Typography>
                      </TableCell>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell>{product.origin}</TableCell>
                      <TableCell>{product.grade}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.currentStage}
                          color={getStageColor(product.currentStage)}
                          size="small"
                        />
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
    </Container>
  );
};

export default Dashboard;