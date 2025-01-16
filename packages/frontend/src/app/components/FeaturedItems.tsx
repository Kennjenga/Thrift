// components/FeaturedItems.tsx
"use client";

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ItemDetailsModal from './ItemDetailsModal';

// Matching color palette
const colors = {
  pastelBlue: '#B8C7DB',
  pastelPink: '#E8D3D1',
  pastelMint: '#C2D4C5',
  pastelSand: '#E5DCD3',
  gold: '#C6A97C',
  goldLight: '#D4BC94',
  matte: '#F4F1EC',
  text: '#4A4544',
  textLight: '#7A7574',
};

const FeaturedContainer = styled.div`
  padding: rem 0;
  background: ${colors.matte};
`;

const Title = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  color: ${colors.text};
  margin-bottom: 3rem;
  text-align: center;
  font-size: 2.5rem;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 2px;
    background: linear-gradient(to right, ${colors.gold}, ${colors.goldLight});
  }

  span {
    color: ${colors.gold};
    font-style: italic;
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;
  padding: 1rem;
`;

const ItemCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(198, 169, 124, 0.1);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    box-shadow: 0 8px 30px rgba(198, 169, 124, 0.2);
  }
`;

const ItemImage = styled.div`
  width: 100%;
  height: 300px;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  ${ItemCard}:hover & img {
    transform: scale(1.05);
  }
`;

const ItemInfo = styled.div`
  padding: 1.5rem;
  background: white;
`;

const ItemTitle = styled.h3`
  font-family: 'Quicksand', sans-serif;
  color: ${colors.text};
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const ItemPrice = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const TokenPrice = styled.p`
  color: ${colors.gold};
  font-weight: 600;
  font-family: 'Quicksand', sans-serif;
  font-size: 1.1rem;
`;

const TokenIcon = styled.span`
  color: ${colors.goldLight};
  margin-right: 0.5rem;
`;

const ViewButton = styled(motion.button)`
  background: transparent;
  border: 1px solid ${colors.gold};
  color: ${colors.gold};
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, ${colors.gold}, ${colors.goldLight});
    color: white;
  }
`;


const FeaturedItems: React.FC = () => {
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Update your items array to include all the necessary details
  const items = [
    {
      id: 1,
      title: 'Vintage Denim Jacket',
      price: '50',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRenaDifw6xPZpdOxkAp6EC25XLXVPS7Ap1iw&s',
      condition: 'Excellent',
      brand: 'Levi\'s',
      type: 'Jacket',
      aesthetic: 'Vintage',
      quality: 'Excellent',
      gender: 'Unisex',
    },
    {
      id: 2,
      title: 'Bohemian Maxi Dress',
      price: '45',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRenaDifw6xPZpdOxkAp6EC25XLXVPS7Ap1iw&s',
      condition: 'Like New',
      brand: 'Free People',
      type: 'Dress',
      aesthetic: 'Bohemian',
      quality: 'Excellent',
      gender: 'Female',
    },
    {
      id: 3,
      title: 'Streetwear Cargo Pants',
      price: '35',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRenaDifw6xPZpdOxkAp6EC25XLXVPS7Ap1iw&s',
      condition: 'Good',
      brand: 'Urban Outfitters',
      type: 'Pants',
      aesthetic: 'Streetwear',
      quality: 'Good',
      gender: 'Unisex',
    },
    {
      id: 4,
      title: 'Minimalist Silk Blouse',
      price: '40',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRenaDifw6xPZpdOxkAp6EC25XLXVPS7Ap1iw&s',
      condition: 'Excellent',
      brand: 'Everlane',
      type: 'Top',
      aesthetic: 'Minimalist',
      quality: 'Excellent',
      gender: 'Female',
    },
    {
      id: 5,
      title: 'Retro High-Waisted Jeans',
      price: '55',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRenaDifw6xPZpdOxkAp6EC25XLXVPS7Ap1iw&s',
      condition: 'Very Good',
      brand: 'Wrangler',
      type: 'Jeans',
      aesthetic: 'Vintage',
      quality: 'Very Good',
      gender: 'Female',
    },
    {
      id: 6,
      title: 'Casual Oversized Sweater',
      price: '30',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRenaDifw6xPZpdOxkAp6EC25XLXVPS7Ap1iw&s',
      condition: 'Good',
      brand: 'H&M',
      type: 'Sweater',
      aesthetic: 'Casual',
      quality: 'Good',
      gender: 'Unisex',
    },
    {
      id: 7,
      title: 'Athletic Performance Leggings',
      price: '25',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRenaDifw6xPZpdOxkAp6EC25XLXVPS7Ap1iw&s',
      condition: 'Like New',
      brand: 'Nike',
      type: 'Activewear',
      aesthetic: 'Athletic',
      quality: 'Excellent',
      gender: 'Female',
    },
    {
      id: 8,
      title: 'Classic Trench Coat',
      price: '65',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRenaDifw6xPZpdOxkAp6EC25XLXVPS7Ap1iw&s',
      condition: 'Excellent',
      brand: 'Burberry',
      type: 'Coat',
      aesthetic: 'Classic',
      quality: 'Excellent',
      gender: 'Unisex',
    }
    // ... other items
  ];

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
<FeaturedContainer>
      <Title>
        <span>Collections</span>
      </Title>
      <ItemsGrid>
        {items.map((item) => (
          <ItemCard
            key={item.id}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <ItemImage>
              <img src={item.image} alt={item.title} />
            </ItemImage>
            <ItemInfo>
              <ItemTitle>{item.title}</ItemTitle>
              <small style={{ color: colors.textLight }}>{item.condition}</small>
              <ItemPrice>
                <TokenPrice>
                  <TokenIcon>♦</TokenIcon>
                  {item.price} Tokens
                </TokenPrice>
                <ViewButton
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleViewDetails(item)} as="button"
                >
                  View Details
                </ViewButton>
              </ItemPrice>
            </ItemInfo>
          </ItemCard>
        ))}
      </ItemsGrid>
      {selectedItem && (
        <ItemDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={selectedItem}
        />
      )}
    </FeaturedContainer>
  );
};

export default FeaturedItems;