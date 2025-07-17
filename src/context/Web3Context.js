import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TeaSupplyChainABI from '../artifacts/contracts/TeaSupplyChain.sol/TeaSupplyChain.json';
import config from '../config.json';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {

        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (parseInt(chainId, 16) !== config.networkId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${config.networkId.toString(16)}` }],
            });
          } catch (switchError) {
            console.error('Failed to switch network:', switchError);
            return { success: false, error: 'Please switch to the correct network' };
          }
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const account = await signer.getAddress();
        
        const contract = new ethers.Contract(
          config.contractAddress,
          TeaSupplyChainABI.abi,
          signer
        );

        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        setAccount(account);
        setIsConnected(true);

        return { success: true, account };
      } else {
        throw new Error('MetaMask is not installed');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return { success: false, error: error.message };
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setIsConnected(false);
  };
  
  const registerParticipant = async (participantAddress, role, name, location) => {
    try {
      if (!contract || !account) {
        throw new Error('Wallet not connected');
      }

      const tx = await contract.registerParticipant(
        participantAddress,
        role, 
        name,
        location
      );

      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error registering participant:', error);
      return { success: false, error: error.message };
    }
  };

  const createProduct = async (batchId, productName, origin, grade, quantity, notes) => {
    try {
      if (!contract || !account) {
        throw new Error('Wallet not connected');
      }

      const tx = await contract.createProduct(
        batchId,
        productName,
        origin,
        grade,
        quantity,
        notes
      );

      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error creating product:', error);
      return { success: false, error: error.message };
    }
  };

  const getParticipant = async (address) => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const participant = await contract.getParticipant(address);
      return { success: true, participant };
    } catch (error) {
      console.error('Error getting participant:', error);
      return { success: false, error: error.message };
    }
  };

  const updateProductStage = async (productId, newStage, notes) => {
    try {
      if (!contract || !account) {
        throw new Error('Wallet not connected');
      }

      const tx = await contract.updateProductStage(productId, newStage, notes);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error updating product stage:', error);
      return { success: false, error: error.message };
    }
  };

  const getProductByBatch = async (batchId) => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const product = await contract.getProductByBatch(batchId);
      return { success: true, product };
    } catch (error) {
      console.error('Error getting product:', error);
      return { success: false, error: error.message };
    }
  };

  const getProductHistory = async (productId) => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const history = await contract.getProductHistory(productId);
      return { success: true, history };
    } catch (error) {
      console.error('Error getting product history:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const value = {
    provider,
    signer,
    contract,
    account,
    isConnected,
    connectWallet,
    disconnectWallet,
    registerParticipant,
    createProduct,
    getParticipant,
    updateProductStage,
    getProductByBatch,
    getProductHistory
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};