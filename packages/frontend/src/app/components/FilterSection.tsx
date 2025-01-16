// components/FilterSection.tsx
"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FilterContainer = styled.div`
  padding: 1rem;
  background: rgba(30, 30, 30, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const FilterGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FilterTitle = styled.h3`
  font-family: 'Poppins', sans-serif;
  color: white;
  margin-bottom: 1rem;
`;

const FilterOption = styled(motion.button).attrs<{ isSelected: boolean }>({})<{ isSelected: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>>`
  padding: 0.5rem 1rem;
  margin: 0.25rem;
  border-radius: 20px;
  border: 1px solid ${props => props.isSelected ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)'};
  background: ${props => props.isSelected ? 'rgba(76, 175, 80, 0.2)' : 'transparent'};
  color: white;
  cursor: pointer;
  
  &:hover {
    border-color: #4CAF50;
  }
`;

const FilterSection: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const categories = ['Tops', 'Bottoms', 'Dresses', 'Accessories'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  return (
    <FilterContainer>
      <FilterGroup>
        <FilterTitle>Categories</FilterTitle>
        {categories.map(category => (
          <FilterOption
            key={category}
            isSelected={selectedCategories.includes(category)}
            onClick={() => toggleCategory(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </FilterOption>
        ))}
      </FilterGroup>
      
      <FilterGroup>
        <FilterTitle>Sizes</FilterTitle>
        {sizes.map(size => (
          <FilterOption
            key={size}
            isSelected={selectedSizes.includes(size)}
            onClick={() => toggleSize(size)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {size}
          </FilterOption>
        ))}
      </FilterGroup>
    </FilterContainer>
  );
};

export default FilterSection;