// components/LoadingIndicator.tsx
"use client";

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const LoadingHanger = styled(motion.div)`
  width: 40px;
  height: 40px;
  border: 3px solid #4CAF50;
  border-radius: 50%;
  border-top-color: transparent;
`;

const LoadingIndicator: React.FC = () => {
  return (
    <LoadingContainer>
      <LoadingHanger
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </LoadingContainer>
  );
};

export default LoadingIndicator;