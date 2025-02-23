"use client";

import React from 'react';
import Image from 'next/image';
import { formatEther } from 'viem';
import { motion } from 'framer-motion';
import { 
  Clock, 
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Coins
} from 'lucide-react';
import { EscrowCardProps } from '@/types/escrow';

export const EscrowCard: React.FC<EscrowCardProps> = ({
  escrow,
  status,
  role,
  canConfirm,
  canRefund,
  isLoading,
  onConfirm,
  onRefund,
}) => {
  const deadline = new Date(Number(escrow.deadline) * 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[rgba(123,66,255,0.1)] rounded-xl p-6 border border-[rgba(123,66,255,0.25)]"
    >
      <div className="flex items-start gap-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <Image
            src={escrow.product.image}
            alt={escrow.product.name}
            fill
            className="rounded-lg object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{escrow.product.name}</h3>
          <p className="text-white/60 text-sm">{escrow.product.brand}</p>
          
          <div className="mt-2 flex items-center gap-2">
            <div className="text-sm px-3 py-1 rounded-full bg-[rgba(123,66,255,0.2)]">
              {role === 'buyer' ? 'Buying' : 'Selling'}
            </div>
            <div 
              className={`text-sm px-3 py-1 rounded-full ${
                status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                status === 'Refunded' ? 'bg-red-500/20 text-red-300' :
                'bg-yellow-500/20 text-yellow-300'
              }`}
            >
              {status}
            </div>
          </div>
        </div>
      </div>

      {escrow.isExchange && escrow.exchangeProduct && (
        <div className="mt-4 p-4 bg-[rgba(123,66,255,0.15)] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Exchange Details</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16">
              <Image
                src={escrow.exchangeProduct.image}
                alt={escrow.exchangeProduct.name}
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <div>
              <p className="font-medium">{escrow.exchangeProduct.name}</p>
              <p className="text-sm text-white/60">{escrow.exchangeProduct.brand}</p>
            </div>
          </div>
          {escrow.tokenTopUp > BigInt(0) && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              <Coins className="w-4 h-4" />
              <span>Top-up: {formatEther(escrow.tokenTopUp)} Tokens</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Deadline:</span>
          </div>
          <span>{deadline.toLocaleDateString()}</span>
        </div>

        <div className="space-y-2">
          {!escrow.isToken && (
            <div className="flex items-center justify-between text-sm">
              <span>Amount:</span>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4" />
                <span>{formatEther(escrow.amount)} ETH</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span>Quantity:</span>
            <span>{escrow.quantity.toString()} items</span>
          </div>
        </div>

        <div className="flex gap-3">
          {canConfirm && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onConfirm(escrow.escrowId)}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4
                bg-green-500 hover:bg-green-600 text-white rounded-lg
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              Confirm
            </motion.button>
          )}

          {canRefund && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRefund(escrow.escrowId)}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4
                bg-red-500 hover:bg-red-600 text-white rounded-lg
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              Refund
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};