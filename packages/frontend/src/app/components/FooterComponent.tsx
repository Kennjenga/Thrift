"use client";

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

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


const Footer = styled.footer`
  width: 100%;
  background: %{colors.matte};
  padding: 1rem 0;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 0 ;
`;

const FooterSection = styled.div`
  color: ${colors.text};
`;

const FooterTitle = styled.h4`
  font-family: 'Cormorant Garamond', serif;
  color: ${colors.gold};
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const FooterText = styled.p`
  color: ${colors.textLight};
  font-size: 0.9rem;
  line-height: 1.6;
`;

const FooterLink = styled.a`
  color: ${colors.textLight};
  text-decoration: none;
  display: block;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${colors.gold};
  }
`;


const FooterComponent: React.FC = () => {

  return (
    <>
      <Footer>
        <FooterContent>
          <FooterSection>
            <FooterTitle>About Us</FooterTitle>
            <FooterText>
              Dedicated to bringing elegance and sophistication to your lifestyle through carefully curated collections.
            </FooterText>
          </FooterSection>
          
          <FooterSection>
            <FooterTitle>Quick Links</FooterTitle>
            <FooterLink href="/collections">Collections</FooterLink>
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
          </FooterSection>
          
          <FooterSection>
            <FooterTitle>Contact</FooterTitle>
            <FooterText>
              Email: ace@token.com<br />
              Phone: (123) 456-7890<br />
              Address: 123 Elegant Avenue, Nairobi
            </FooterText>
          </FooterSection>
        </FooterContent>
      </Footer>
    </>
  );
};

export default FooterComponent;