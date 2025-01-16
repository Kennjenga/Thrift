// components/HeroCarousel.tsx
"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

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

const CarouselWrapper = styled.div`
  background: ${colors.matte};
  padding: 2rem 0;
`;

const CarouselContainer = styled.div`
  position: relative;
  height: 50vh;
  overflow: hidden;
  border-radius: 30px;
  margin: auto;
  max-width: 1440px;
  padding: 0 rem;
`;

const Slide = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 30px;
  overflow: hidden;
  background: ${colors.matte};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 4rem;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 2rem;
  }
`;

const ContentSection = styled.div`
  flex: 1;
  z-index: 2;
  max-width: 600px;
`;

const ImageSection = styled.div`
  flex: 1;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    height: auto;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(198, 169, 124, 0.2);
  }
`;

const Tagline = styled.h1`
  font-family: 'Cormorant Garamond', serif;
  font-size: 3.5rem;
  color: ${colors.text};
  margin-bottom: 1.5rem;
  line-height: 1.2;

  span.highlight {
    color: ${colors.gold};
    font-style: italic;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SubTagline = styled.p`
  font-family: 'Quicksand', sans-serif;
  font-size: 1.1rem;
  color: ${colors.textLight};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const CTAButton = styled(motion.button)`
  padding: 1rem 2.5rem;
  border-radius: 25px;
  font-family: 'Quicksand', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: linear-gradient(135deg, ${colors.gold}, ${colors.goldLight});
  color: white;
  box-shadow: 0 2px 15px rgba(198, 169, 124, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(198, 169, 124, 0.4);
  }
`;

const slides = [
  {
    id: 1,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRenaDifw6xPZpdOxkAp6EC25XLXVPS7Ap1iw&s',
    title: 'Elevate Your Style',
    subtitle: 'Join our sustainable fashion movement and transform your wardrobe responsibly',
  },
  {
    id: 2,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRenaDifw6xPZpdOxkAp6EC25XLXVPS7Ap1iw&s',
    title: 'Make an Impact',
    subtitle: 'Every piece exchanged contributes to a more sustainable future',
  },
  {
    id: 3,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRenaDifw6xPZpdOxkAp6EC25XLXVPS7Ap1iw&s',
    title: 'Earn While You Share',
    subtitle: 'Transform your unused clothing into valuable tokens',
  },
];

const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <CarouselWrapper>
      <CarouselContainer>
        <AnimatePresence mode="wait">
          <Slide
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <ContentSection>
              <Tagline>
                <span className="highlight">{slides[currentSlide].title}</span>
              </Tagline>
              <SubTagline>{slides[currentSlide].subtitle}</SubTagline>
            </ContentSection>
            <ImageSection>
              <img src={slides[currentSlide].image} alt={slides[currentSlide].title} />
            </ImageSection>
          </Slide>
        </AnimatePresence>
      </CarouselContainer>
    </CarouselWrapper>
  );
};

export default HeroCarousel;