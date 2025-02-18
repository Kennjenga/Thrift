// components/eco-character.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const theme = {
  colors: {
    primary: '#B5C7C4',    
    secondary: '#C7D4D2',  
    text: '#6B7F7C',       
    blush: '#D4DCDA',
    accent: '#8FA6A1',
    highlight: '#E8F0EE',
    glass: 'rgba(255, 255, 255, 0.15)',
    gold: '#E2D9C9',
    goldLight: '#F0EBE3',
    background: '#FBFBFB',
  }
};

const characterStyles = `
  .eco-character {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 140px;
    height: 140px;
    z-index: 1000;
    cursor: pointer;
  }

  .character-head {
    position: absolute;
    width: 90px;
    height: 80px;
    background: ${theme.colors.primary};
    border-radius: 50%;
    top: 30px;
    left: 25px;
    box-shadow: 
      inset -4px -4px 10px rgba(0,0,0,0.1),
      inset 4px 4px 10px rgba(255,255,255,0.8),
      0 4px 15px rgba(0,0,0,0.1);
  }

  .character-eye {
    position: absolute;
    width: 20px;
    height: 24px;
    background: white;
    border-radius: 50%;
    top: 22px;
    transition: all 0.3s ease;
  }

  .character-eye::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    background: ${theme.colors.text};
    border-radius: 50%;
    top: 6px;
    transition: all 0.3s ease;
  }

  .character-eye.left { 
    left: 18px;
    transform: rotate(-5deg);
  }
  .character-eye.right { 
    right: 18px;
    transform: rotate(5deg);
  }

  .character-blush {
    position: absolute;
    width: 18px;
    height: 10px;
    background: ${theme.colors.blush};
    border-radius: 50%;
    opacity: 0.7;
    top: 38px;
    filter: blur(2px);
  }

  .character-blush.left { left: 12px; }
  .character-blush.right { right: 12px; }

  .character-mouth {
    position: absolute;
    width: 28px;
    height: 16px;
    border: 2.5px solid ${theme.colors.text};
    border-radius: 50%;
    border-top: none;
    bottom: 18px;
    left: 31px;
    transition: all 0.3s ease;
  }

  .character-leaf {
    position: absolute;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.secondary});
    border-radius: 0 50% 50% 50%;
    transform: rotate(45deg);
    top: 8px;
    left: 35px;
    box-shadow: 
      inset -2px -2px 6px rgba(0,0,0,0.1),
      inset 2px 2px 6px rgba(255,255,255,0.8);
  }

  .eco-character:hover .character-eye::after {
    transform: scale(1.2);
  }

  .eco-character:hover .character-mouth {
    height: 20px;
    transform: translateY(-2px);
  }

  .speech-bubble::after {
    content: '';
    position: absolute;
    right: -10px;
    top: 40px;
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 12px solid white;
    filter: drop-shadow(2px 0 2px rgba(0,0,0,0.1));
  }
`;

const EcoCharacter: React.FC = () => {
    const [mood, setMood] = useState<'happy' | 'flirty' | 'curious'>('happy');
    const [messageIndex, setMessageIndex] = useState<number>(0);
    const [showMessage, setShowMessage] = useState(false);
    const [isWaving, setIsWaving] = useState(false);
    const characterRef = useRef<HTMLDivElement>(null);
  
    const messages = {
      happy: [
        "Shopping sustainably is so much fun! 🌱✨",
        "Let's save the planet together! 💚",
        "You're making the world better with every eco-choice! 🌍",
      ],
      flirty: [
        "That eco-friendly outfit would look amazing on you! 😉",
        "Green is definitely your color! ✨",
        "Sustainable fashion? You've got great taste! 💫",
      ],
      curious: [
        "Ooh, what eco-friendly treasures will we find today? 🤔",
        "Did you know this item saves 500L of water? 💧",
        "Want to learn more about sustainable materials? 📚",
      ],
    };
  
    useEffect(() => {
      const handleScroll = () => {
        const scrollPosition = window.scrollY;
        if (scrollPosition < 500) {
          setMood('happy');
        } else if (scrollPosition < 1000) {
          setMood('flirty');
        } else {
          setMood('curious');
        }
      };
  
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    const handleCharacterClick = () => {
      setIsWaving(true);
      if (!showMessage) {
        setShowMessage(true);
        setMessageIndex(0);
      } else {
        setMessageIndex((prev) => (prev + 1) % messages[mood].length);
      }
      setTimeout(() => setIsWaving(false), 1000);
    };
  
    const handleCloseMessage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowMessage(false);
      setMessageIndex(0);
    };
  
    return (
      <motion.div
        className="eco-character"
        ref={characterRef}
        animate={{
          y: [0, -10, 0],
          rotate: isWaving ? [0, -10, 10, -10, 0] : 0,
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          },
          rotate: {
            duration: 0.5,
          },
        }}
        onClick={handleCharacterClick}
        whileHover={{ scale: 1.05 }}
      >
        <style>{characterStyles}</style>
        <motion.div 
          className="character-leaf"
          animate={{
            rotate: isWaving ? [45, 60, 45] : 45,
          }}
          transition={{
            duration: 0.5,
          }}
        />
        <div className="character-head">
          <div className="character-eye left" />
          <div className="character-eye right" />
          <div className="character-blush left" />
          <div className="character-blush right" />
          <div className="character-mouth" />
        </div>
        
        <AnimatePresence mode="wait">
          {showMessage && (
            <motion.div
              key={messageIndex} // Add key to force re-render on message change
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="speech-bubble"
              style={{
                position: 'absolute',
                top: '-20px',
                right: '120%',
                background: 'white',
                padding: '15px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                width: '250px',
                minHeight: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontSize: '1rem',
                color: theme.colors.text,
                border: `2px solid ${theme.colors.highlight}`,
              }}
            >
              {/* Close button */}
              <motion.button
                className="close-button"
                onClick={handleCloseMessage}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: 'none',
                  background: theme.colors.highlight,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  color: theme.colors.text,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  zIndex: 2,
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L11 11M1 11L11 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.button>
  
              {/* Message content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{
                  padding: '10px',
                  paddingTop: '20px',
                  width: '100%',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <p style={{ margin: 0 }}>{messages[mood][messageIndex]}</p>
              </motion.div>
  
              {/* Message counter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                style={{
                  marginTop: '10px',
                  fontSize: '0.75rem',
                  color: theme.colors.text,
                }}
              >
                {messageIndex + 1}/{messages[mood].length}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };
  
export default EcoCharacter;