import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Web3Provider } from './context/Web3Context';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CreateProduct from './components/CreateProduct';
import UpdateProduct from './components/UpdateProduct';
import ProductTracker from './components/ProductTracker';
import AdminPanel from './components/AdminPanel';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green primary for tea theme, you can use any secondary color you like
    },
    secondary: {
      main: '#8bc34a', // Secondary Color
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const authStatus = localStorage.getItem('isAuthenticated');
    const savedRole = localStorage.getItem('userRole');
    
    if (authStatus === 'true' && savedRole) {
      setIsAuthenticated(true);
      setUserRole(savedRole);
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Loading...
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Web3Provider>
        <Router>
          <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {isAuthenticated && (
              <Navbar 
                userRole={userRole} 
                setIsAuthenticated={setIsAuthenticated}
              />
            )}
            
            <Routes>
              {!isAuthenticated ? (
                <>
                  <Route 
                    path="/login" 
                    element={
                      <Login 
                        setIsAuthenticated={setIsAuthenticated}
                        setUserRole={setUserRole}
                      />
                    } 
                  />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </>
              ) : (
                <>
                  <Route 
                    path="/dashboard" 
                    element={<Dashboard userRole={userRole} />} 
                  />
                  <Route 
                    path="/track" 
                    element={<ProductTracker />} 
                  />
                  
                  {/* Farmer-specific routes */}
                  {userRole === 'Farmer' && (
                    <Route 
                      path="/create-product" 
                      element={<CreateProduct />} 
                    />
                  )}
                  
                  {/* Routes for roles that can update products */}
                  {['Processor', 'Warehouse', 'Distributor', 'Retailer'].includes(userRole) && (
                    <Route 
                      path="/update-product" 
                      element={<UpdateProduct userRole={userRole} />} 
                    />
                  )}
                  
                  {/* Authority-specific routes */}
                  {userRole === 'Authority' && (
                    <Route 
                      path="/admin" 
                      element={<AdminPanel />} 
                    />
                  )}
                  
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </>
              )}
            </Routes>
          </Box>
        </Router>
      </Web3Provider>
    </ThemeProvider>
  );
}

export default App;
