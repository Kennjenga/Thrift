// components/Header.tsx
"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Refined pastel & gold palette
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

const HeaderWrapper = styled.div`
  background: ${colors.matte};
  padding: 1rem 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
`;

const HeaderContainer = styled.header`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 2rem;
`;

const Logo = styled(motion.div)`
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.2rem;
  color: ${colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span.gold {
    color: ${colors.gold};
    font-style: italic;
  }

  .dot {
    width: 4px;
    height: 4px;
    background: ${colors.goldLight};
    border-radius: 50%;
    margin: 0 0.5rem;
  }
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
`;

const Nav = styled.nav`
  display: flex;
  gap: 3rem;
  align-items: center;
  background: rgba(244, 241, 236, 0.95);
  padding: 0.8rem 2rem;
  border-radius: 30px;
  box-shadow: 0 2px 20px rgba(198, 169, 124, 0.08);
`;

const NavLink = styled(motion.a).attrs<{ href: string }>((props) => ({
  href: props.href,
}))`
  color: ${colors.textLight};
  text-decoration: none;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${colors.pastelSand};
    border-radius: 20px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  &:hover {
    color: ${colors.gold};

    &::before {
      opacity: 1;
    }
  }
`;

const AuthSection = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const IconButton = styled(motion.button)`
  background: none;
  border: none;
  padding: 0.5rem;
  color: ${colors.textLight};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.9rem;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    color: ${colors.gold};
  }
`;

const StyledButton = styled(motion.button).attrs<{ className?: string }>((props) => ({
  className: props.className,
}))`
  padding: 0.8rem 2rem;
  border-radius: 25px;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  &.login {
    background: ${colors.pastelSand};
    color: ${colors.text};

    &:hover {
      background: ${colors.goldLight};
      color: white;
    }
  }

  &.wallet {
    background: linear-gradient(135deg, ${colors.gold}, ${colors.goldLight});
    color: white;
    box-shadow: 0 2px 15px rgba(198, 169, 124, 0.2);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(198, 169, 124, 0.3);
    }
  }
`;

const AccentLine = styled(motion.div)`
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    ${colors.goldLight},
    transparent
  );
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
`;

const Header: React.FC = () => {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <HeaderWrapper>
      <HeaderContainer>
        <Logo
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="gold">Ace</span>
        </Logo>

        <NavContainer>
          <Nav>
            {[
              { name: 'Collections', path: '/collections' },
              { name: 'Sustainable', path: '/sustainable' },
              { name: 'Consign', path: '/consign' },
              { name: 'Impact', path: '/impact' },
            ].map((item) => (
              <NavLink
                key={item.name}
                href={item.path}
                onHoverStart={() => setHoveredLink(item.name)}
                onHoverEnd={() => setHoveredLink(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.name}
                <AnimatePresence>
                  {hoveredLink === item.name && (
                    <AccentLine
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </NavLink>
            ))}
          </Nav>
        </NavContainer>

        <AuthSection>
          <StyledButton
            className="wallet"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Connect Wallet
          </StyledButton>
        </AuthSection>
      </HeaderContainer>
    </HeaderWrapper>
  );
};

const GlobalStyles = `
  :root {
    --pastel-blue: ${colors.pastelBlue};
    --pastel-pink: ${colors.pastelPink};
    --pastel-mint: ${colors.pastelMint};
    --pastel-sand: ${colors.pastelSand};
    --gold: ${colors.gold};
    --gold-light: ${colors.goldLight};
    --matte: ${colors.matte};
    --text: ${colors.text};
    --text-light: ${colors.textLight};
  }

  body {
    background: var(--matte);
    color: var(--text);
    font-family: 'Quicksand', sans-serif;
  }
`;

export default Header;