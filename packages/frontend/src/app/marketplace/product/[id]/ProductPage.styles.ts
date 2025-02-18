// ProductPage.styles.ts
import styled from 'styled-components';

export const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #FEFCF6 0%, #F4EFE6 100%);
`;

export const NavigationBar = styled.nav`
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(94, 108, 88, 0.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

export const LogoText = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #162A2C;
  background: linear-gradient(to right, #C0B283, #DCD0C0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const NavLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #162A2C;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -2px;
    left: 0;
    background: #C0B283;
    transition: width 0.3s ease;
  }
  
  &:hover:after {
    width: 100%;
  }
  
  &:hover svg {
    color: #C0B283;
  }
`;

export const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  padding: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

export const ProductImage = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 1rem;
  overflow: hidden;
  
  img {
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

export const ProductTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  color: #162A2C;
  margin-bottom: 0.5rem;
`;

export const ProductBrand = styled.p`
  font-size: 1.125rem;
  color: #686867;
`;

export const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
`;

export const SpecItem = styled.div`
  display: flex;
  align-items: start;
  gap: 0.75rem;
  
  svg {
    color: #5E6C58;
  }
`;

export const PriceContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

export const PriceBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'glass' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #CB2140;
          color: white;
          &:hover:not(:disabled) {
            background: #d62747;
          }
        `;
      case 'secondary':
        return `
          background: transparent;
          border: 1px solid #CB2140;
          color: #CB2140;
          &:hover:not(:disabled) {
            background: rgba(203, 33, 64, 0.1);
          }
        `;
      case 'glass':
      default:
        return `
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #162A2C;
          &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.2);
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: 1px solid #DBE0E2;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #5E6C58;
    box-shadow: 0 0 0 2px rgba(94, 108, 88, 0.1);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: 1px solid #DBE0E2;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #5E6C58;
    box-shadow: 0 0 0 2px rgba(94, 108, 88, 0.1);
  }
`;

export const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
`;

export const ModalContent = styled(GlassCard)`
  max-width: 28rem;
  width: 100%;
`;

export const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-left: 4px solid #ef4444;
  color: #162A2C;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #FEFCF6 0%, #F4EFE6 100%);
`;

export const SpinnerWrapper = styled(GlassCard)`
  padding: 2rem;
  border-radius: 9999px;
  
  .spinner {
    width: 4rem;
    height: 4rem;
    border: 4px solid #5E6C58;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;