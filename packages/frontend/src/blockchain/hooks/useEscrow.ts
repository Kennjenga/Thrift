"use client";

import { useState, useEffect } from 'react';
import { useMarketplace } from '@/blockchain/hooks/useMarketplace';
import { useAccount } from 'wagmi';
import { type Address } from 'viem';
import { Escrow, Product, EscrowStatus, UserRole, EscrowWithProduct } from '@/types/escrow';

export const useEscrow = () => {
  const { address } = useAccount();
  const { 
    useGetUserEscrows, 
    useGetEscrowsBatch,
    useGetProductsBatch,
    confirmEscrow,
    refundEscrow 
  } = useMarketplace();

  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [escrows, setEscrows] = useState<EscrowWithProduct[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Get user's escrows
  const { data: escrowIds = [], isLoading: isLoadingEscrowIds } = useGetUserEscrows(address as Address) as { 
    data: bigint[],
    isLoading: boolean 
  };
  
  // Get escrow details
  const { data: rawEscrows = [], isLoading: isLoadingEscrows } = useGetEscrowsBatch(escrowIds) as { 
    data: Escrow[],
    isLoading: boolean 
  };

  // Get all product IDs from escrows
  const productIds = rawEscrows.reduce<bigint[]>((acc, escrow) => {
    acc.push(escrow.productId);
    if (escrow.isExchange) {
      acc.push(escrow.exchangeProductId);
    }
    return acc;
  }, []);

  // Get products
  const { data: products = [], isLoading: isLoadingProducts } = useGetProductsBatch(productIds) as { 
    data: Product[],
    isLoading: boolean 
  };

  useEffect(() => {
    // Only process if we have all the data and we're not in a loading state
    if (!isLoadingEscrowIds && !isLoadingEscrows && !isLoadingProducts && rawEscrows.length > 0) {
      const enrichedEscrows = rawEscrows.reduce<EscrowWithProduct[]>((acc, escrow) => {
        const product = products.find(p => p.id === escrow.productId);
        const exchangeProduct = escrow.isExchange 
          ? products.find(p => p.id === escrow.exchangeProductId)
          : undefined;

        // Skip escrows with missing products instead of throwing
        if (!product) {
          console.warn(`Product not found for escrow ${escrow.escrowId}`);
          return acc;
        }

        acc.push({
          ...escrow,
          product,
          exchangeProduct
        });

        return acc;
      }, []);

      setEscrows(enrichedEscrows);
      setIsInitializing(false);
    } else if (!isLoadingEscrowIds && !isLoadingEscrows && rawEscrows.length === 0) {
      // If we're done loading but have no escrows, update the state accordingly
      setEscrows([]);
      setIsInitializing(false);
    }
  }, [rawEscrows, products, isLoadingEscrowIds, isLoadingEscrows, isLoadingProducts]);

  const handleConfirm = async (escrowId: bigint) => {
    if (!address) return;
    try {
      setLoading(prev => ({ ...prev, [escrowId.toString()]: true }));
      await confirmEscrow(escrowId);
      
      setEscrows(prev => 
        prev.map(escrow => 
          escrow.escrowId === escrowId
            ? {
                ...escrow,
                buyerConfirmed: address === escrow.buyer ? true : escrow.buyerConfirmed,
                sellerConfirmed: address === escrow.seller ? true : escrow.sellerConfirmed,
              }
            : escrow
        )
      );
    } catch (error) {
      console.error('Error confirming escrow:', error);
    } finally {
      setLoading(prev => ({ ...prev, [escrowId.toString()]: false }));
    }
  };

  const handleRefund = async (escrowId: bigint) => {
    try {
      setLoading(prev => ({ ...prev, [escrowId.toString()]: true }));
      await refundEscrow(escrowId);
      
      setEscrows(prev => 
        prev.map(escrow => 
          escrow.escrowId === escrowId
            ? { ...escrow, refunded: true }
            : escrow
        )
      );
    } catch (error) {
      console.error('Error refunding escrow:', error);
    } finally {
      setLoading(prev => ({ ...prev, [escrowId.toString()]: false }));
    }
  };

  const getEscrowStatus = (escrow: Escrow): EscrowStatus => {
    if (escrow.completed) return 'Completed';
    if (escrow.refunded) return 'Refunded';
    if (escrow.buyerConfirmed && escrow.sellerConfirmed) return 'Both Confirmed';
    if (escrow.buyerConfirmed) return 'Buyer Confirmed';
    if (escrow.sellerConfirmed) return 'Seller Confirmed';
    return 'Pending';
  };

  const getUserRole = (escrow: Escrow): UserRole => {
    if (!address) return null;
    if (address === escrow.buyer) return 'buyer';
    if (address === escrow.seller) return 'seller';
    return null;
  };

  const canConfirm = (escrow: Escrow): boolean => {
    const role = getUserRole(escrow);
    if (!role) return false;
    if (escrow.completed || escrow.refunded) return false;
    if (role === 'buyer' && !escrow.buyerConfirmed) return true;
    if (role === 'seller' && !escrow.sellerConfirmed) return true;
    return false;
  };

  const canRefund = (escrow: Escrow): boolean => {
    if (escrow.completed || escrow.refunded) return false;
    const deadline = new Date(Number(escrow.deadline) * 1000);
    return Date.now() > deadline.getTime();
  };

  return {
    escrows,
    loading,
    isInitializing,
    handleConfirm,
    handleRefund,
    getEscrowStatus,
    getUserRole,
    canConfirm,
    canRefund
  };
};