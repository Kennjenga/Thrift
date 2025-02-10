// components/ItemDetailsModal.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShoppingCart, 
  FaRegGem,
  FaTshirt,
  FaPalette,
  FaStar,
  FaVenusMars,
  FaTag,
  FaCoins 
} from 'react-icons/fa';

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
  primary: '#1A1A1A',
  secondary: '#DCC5A1',
  cream: '#F9F6F0',
  accent: '#D4AF37',
};

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  width: 90%;
  max-width: 1000px;
  height: 85vh; // Fixed height
  position: relative;
  display: flex;
  gap: 2rem;
  overflow: hidden; // Hide overflow
`;

const CloseButton = styled.button`
  position: fixed; // Changed to fixed
  top: 2rem;
  right: 2rem;
  background: ${colors.matte};
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: ${colors.gold};
  z-index: 1000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    transform: rotate(90deg);
    background: ${colors.gold};
    color: white;
  }
`;

const ImageSection = styled.div`
  position: relative;
  flex: 0.8;
  max-width: 45%;
  background: white;
  height: 100%; // Fill height
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 90%;
  object-fit: contain;
  border-radius: 15px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const DetailsSection = styled.div`
  flex: 1.2;
  padding: 1rem;
  max-width: 55%;
  overflow-y: auto;
  scroll-behavior: smooth;
  
  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${colors.cream};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.gold};
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${colors.goldLight};
  }

  /* Smooth Scroll Animation */
  scroll-behavior: smooth;
  overflow-y: overlay;
  
  /* Hide scrollbar by default */
  &::-webkit-scrollbar {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  /* Show scrollbar on hover */
  &:hover::-webkit-scrollbar {
    opacity: 1;
  }
`;

const ItemHeader = styled.div`
  margin-bottom: 2rem;
`;

const BrandName = styled.h4`
  color: ${colors.gold};
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const ItemTitle = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.5rem;
  color: ${colors.primary};
  margin-bottom: 1rem;
`;

const PriceTag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  color: ${colors.accent};
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
`;

const IconButton = styled.button`
  background: transparent;
  border: 1px solid ${colors.gold};
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.gold};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.gold};
    color: white;
  }
`;

const ItemDetailSection = styled.div`
  margin-bottom: 2rem;
  background: ${colors.cream};
  padding: 2rem;
  border-radius: 15px;
  max-width: 800px;
  margin: 0 auto;
`;

const DetailTitle = styled.h3`
  font-family: 'Cormorant Garamond', serif;
  color: ${colors.text};
  margin-bottom: 1rem;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
`;

const DetailItem = styled.div`
  background: ${colors.matte};
  padding: 1.2rem;
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.3s ease;

  svg {
    color: ${colors.gold};
    font-size: 1.2rem;
    margin-top: 2px;
    transition: all 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);

    svg {
      transform: scale(1.1);
    }
  }
`;

const DetailContent = styled.div`
  flex: 1;
`;

const DetailLabel = styled.p`
  color: ${colors.textLight};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const DetailValue = styled.p`
  color: ${colors.text};
  font-weight: 600;
`;

const SwapSection = styled.div`
  border-top: 1px solid ${colors.pastelSand};
  padding-top: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
`;

const SwapOption = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const AddToCartButton = styled(motion.button)`
  background: ${colors.gold};
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  max-width: 800px;
  margin: 2rem auto 0;
`;

const ScrollContainer = styled(motion.div)`
  height: 100%;
  padding-right: 1rem;
`;

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: number;
    title: string;
    price: string;
    image: string;
    condition: string;
    brand: string;
    type: string;
    aesthetic: string;
    quality: string;
    gender: string;
  };
}


const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ isOpen, onClose, item }) => {
  const [swapPreference, setSwapPreference] = useState<string>('tokens');
  const [desiredAesthetic, setDesiredAesthetic] = useState<string>('');

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContent
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <CloseButton onClick={onClose}>&times;</CloseButton>

            <ImageSection>
              <MainImage src={item.image} alt={item.title} />
            </ImageSection>

            <DetailsSection>
              <ScrollContainer
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
              <ItemHeader>
                <BrandName>{item.brand}</BrandName>
                <ItemTitle>{item.title}</ItemTitle>
                <PriceTag>
                  <FaRegGem />
                  {item.price} Tokens
                </PriceTag>
              </ItemHeader>

              <ItemDetailSection>
                <DetailTitle>Product Details</DetailTitle>
                <DetailGrid>
                  <DetailItem>
                    <FaTag />
                    <DetailContent>
                      <DetailLabel>Brand</DetailLabel>
                      <DetailValue>{item.brand}</DetailValue>
                    </DetailContent>
                  </DetailItem>
                  <DetailItem>
                    <FaTshirt />
                    <DetailContent>
                      <DetailLabel>Type</DetailLabel>
                      <DetailValue>{item.type}</DetailValue>
                    </DetailContent>
                  </DetailItem>
                  <DetailItem>
                    <FaPalette />
                    <DetailContent>
                      <DetailLabel>Aesthetic</DetailLabel>
                      <DetailValue>{item.aesthetic}</DetailValue>
                    </DetailContent>
                  </DetailItem>
                  <DetailItem>
                    <FaStar />
                    <DetailContent>
                      <DetailLabel>Quality</DetailLabel>
                      <DetailValue>{item.quality}</DetailValue>
                    </DetailContent>
                  </DetailItem>
                  <DetailItem>
                    <FaVenusMars />
                    <DetailContent>
                      <DetailLabel>Gender</DetailLabel>
                      <DetailValue>{item.gender}</DetailValue>
                    </DetailContent>
                  </DetailItem>
                  <DetailItem>
                    <FaCoins />
                    <DetailContent>
                      <DetailLabel>Token Value</DetailLabel>
                      <DetailValue>♦ {item.price} Tokens</DetailValue>
                    </DetailContent>
                  </DetailItem>
                </DetailGrid>
              </ItemDetailSection>

              <SwapSection>
                <DetailTitle>Swap Preferences</DetailTitle>
                <SwapOption>
                  <input
                    type="radio"
                    id="swapClothes"
                    name="swapPreference"
                    checked={swapPreference === 'clothes'}
                    onChange={() => setSwapPreference('clothes')}
                  />
                  <label htmlFor="swapClothes">Swap for Other Clothes</label>
                </SwapOption>
                <SwapOption>
                  <input
                    type="radio"
                    id="swapTokens"
                    name="swapPreference"
                    checked={swapPreference === 'tokens'}
                    onChange={() => setSwapPreference('tokens')}
                  />
                  <label htmlFor="swapTokens">Swap for Tokens</label>
                </SwapOption>

                {swapPreference === 'clothes' && (
                  <div>
                    <DetailLabel>Desired Aesthetic Style</DetailLabel>
                    <select
                      value={desiredAesthetic}
                      onChange={(e) => setDesiredAesthetic(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        borderRadius: '10px',
                        border: `1px solid ${colors.pastelSand}`,
                        marginTop: '0.5rem'
                      }}
                    >
                      <option value="">Select Style</option>
                      <option value="vintage">Vintage</option>
                      <option value="streetwear">Streetwear</option>
                      <option value="bohemian">Bohemian</option>
                      <option value="minimalist">Minimalist</option>
                      <option value="casual">Casual</option>
                    </select>
                  </div>
                )}

                <AddToCartButton
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Request Swap
                </AddToCartButton>
              </SwapSection>

              <AddToCartButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaShoppingCart /> Add to Cart
              </AddToCartButton>
              </ScrollContainer>
            </DetailsSection>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default ItemDetailsModal;