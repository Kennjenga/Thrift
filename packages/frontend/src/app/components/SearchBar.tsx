// components/SearchBar.tsx
"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const SearchContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 2rem auto;
`;

const SearchInput = styled(motion.input)`
  width: 100%;
  padding: 1rem 2rem;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(30, 30, 30, 0.7);
  backdrop-filter: blur(10px);
  color: white;
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
  }
`;

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Implement search logic here
  };

  return (
    <SearchContainer>
      <SearchInput
        as="input"
        type="text"
        placeholder="Search for clothes..."
        value={searchTerm}
        onChange={handleSearch}
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      />
    </SearchContainer>
  );
};

export default SearchBar;