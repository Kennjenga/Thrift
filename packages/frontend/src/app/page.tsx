// HomePage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import FeaturedItems from './components/FeaturedItems';
import FooterComponent from './components/FooterComponent';

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

const PageContainer = styled.div`
  background: ${colors.matte};
  min-height: 100vh;
  color: ${colors.text};
  font-family: 'Quicksand', sans-serif;
`;

const MainContent = styled.main`
  max-width: 1440px;
  margin: 0 auto;
  padding: 80px 2rem 2rem;
`;

const ElegantSection = styled(motion.section)`
  background: ${colors.matte};
  border-radius: 30px;
  padding: 2.5rem;
  margin: 2rem 0;

  h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.5rem;
    color: ${colors.text};
    margin-bottom: 1.5rem;

    span {
      color: ${colors.gold};
      font-style: italic;
    }
  }
`;

const SectionDivider = styled.div`
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    ${colors.goldLight},
    transparent
  );
  margin: 3rem 0;
`;


const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <HeroCarousel />
              <SectionDivider />
              <ElegantSection
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <FeaturedItems />
              </ElegantSection>
              <SectionDivider />
              <ElegantSection
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <FooterComponent />
              </ElegantSection>
            </>
          )}
        </AnimatePresence>
      </MainContent>
    </PageContainer>
  );
};

// Loading Spinner Component
const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 2rem;
  background: ${colors.matte};
`;

const SpinnerWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const OuterSpinner = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid ${colors.gold};
  border-right: 3px solid ${colors.gold};
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(198, 169, 124, 0.2);
`;

const InnerSpinner = styled(motion.div)`
  position: absolute;
  width: 60%;
  height: 60%;
  border: 3px solid transparent;
  border-top: 3px solid ${colors.goldLight};
  border-left: 3px solid ${colors.goldLight};
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(198, 169, 124, 0.15);
`;

const SpinnerDot = styled(motion.div)`
  width: 8px;
  height: 8px;
  background: ${colors.gold};
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(198, 169, 124, 0.3);
`;

const LoadingText = styled(motion.div)`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  color: ${colors.gold};
  letter-spacing: 0.3em;
  text-transform: uppercase;
  display: flex;
  gap: 0.5rem;
`;

const Dot = styled(motion.span)`
  opacity: 0;
`;

const LoadingSpinner: React.FC = () => (
  <SpinnerContainer>
    <SpinnerWrapper>
      <OuterSpinner
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <InnerSpinner
        animate={{ rotate: -360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <SpinnerDot
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </SpinnerWrapper>
    
    <LoadingText>
      Loading
      {[...Array(3)].map((_, i) => (
        <Dot
          key={i}
          animate={{
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        >
          .
        </Dot>
      ))}
    </LoadingText>
  </SpinnerContainer>
);

export default Home;