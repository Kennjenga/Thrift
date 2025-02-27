// components/eco-assistant.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Softer eco-friendly color palette
const COLORS = {
  primary: {
    main: "#9370DB", // Soft purple
    light: "#A992E2", // Lighter purple
    dark: "#7851CD", // Darker purple
  },
  secondary: {
    main: "#88E2D3", // Soft teal
    light: "#A5EDE3", // Lighter teal
    dark: "#6BCFC0", // Darker teal
  },
  accent: {
    pink: "#F8BBD0", // Soft pink
    green: "#A5D6A7", // Soft green
  },
  background: {
    dark: "#2A1B54", // Maintained for contrast
    light: "#3A2B64", // Slightly lighter
  },
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.8)",
    muted: "rgba(255, 255, 255, 0.6)",
  },
};

const EcoAssistant: React.FC = () => {
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [blinking, setBlinking] = useState(false);
  const [messageTimer, setMessageTimer] = useState<NodeJS.Timeout | null>(null);
  const [isWinking, setIsWinking] = useState(false);
  const [isSmiling, setIsSmiling] = useState(true);
  const characterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cute, adorable eco-fashion messages
  const messages = [
    "Omg, that would look *so* cute on you! Let's add it to cart! 💖",
    "Sustainable fashion? More like sustainably fabulous! 💚✨",
    "Green is totally your color, bestie! Let's shop! 🌿👛",
    "Your shopping cart looks lonely... Let's find it some friends! 🛍️",
    "This eco-friendly outfit is giving main character energy! ✨👗",
    "Psst! These sustainable pieces are *chef's kiss* for your style! 💋",
    "Cute AND eco-friendly? That's what I call a perfect match! 💕",
    "OMG stop it! This would look adorbs on you! *wink* 👀",
    "Your wardrobe called. It wants more cuteness ASAP! 📱💖",
    "Let's save the planet, one super cute outfit at a time! 🌎✨"
  ];

  // Character styles with eco-friendly floating leaves
  const characterStyles = `
    .eco-assistant-container {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 160px;
      height: 180px;
      z-index: 1000;
      cursor: pointer;
      filter: drop-shadow(0 0 10px rgba(147, 112, 219, 0.3));
    }

    .eco-assistant {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .assistant-head {
      position: absolute;
      width: 85px;
      height: 85px;
      background: linear-gradient(135deg, ${COLORS.primary.light}, ${COLORS.primary.dark});
      border-radius: 50%;
      top: 45px;
      left: 38px;
      box-shadow: 
        inset -3px -3px 8px rgba(0,0,0,0.2),
        inset 3px 3px 8px rgba(255,255,255,0.15),
        0 0 15px ${COLORS.primary.main}40;
      overflow: hidden;
      z-index: 2;
    }

    .floating-leaf {
      position: absolute;
      background: ${COLORS.accent.green};
      border-radius: 50% 0 50% 0;
      transform: rotate(45deg);
      box-shadow: 0 0 8px ${COLORS.accent.green}40;
      z-index: 1;
    }

    .floating-leaf::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 1px;
      background: ${COLORS.secondary.dark}80;
      transform: rotate(45deg);
    }

    .floating-leaf.leaf1 {
      width: 30px;
      height: 30px;
      top: 20px;
      left: 25px;
      animation: float-leaf1 4s infinite ease-in-out;
    }

    .floating-leaf.leaf2 {
      width: 25px;
      height: 25px;
      top: 15px;
      right: 30px;
      animation: float-leaf2 4.5s infinite ease-in-out;
      background: ${COLORS.secondary.main};
    }

    .floating-leaf.leaf3 {
      width: 20px;
      height: 20px;
      top: 50px;
      left: 15px;
      animation: float-leaf3 3.5s infinite ease-in-out;
      background: ${COLORS.secondary.light};
    }

    .floating-leaf.leaf4 {
      width: 18px;
      height: 18px;
      bottom: 40px;
      right: 20px;
      animation: float-leaf4 5s infinite ease-in-out;
      background: ${COLORS.accent.green};
    }

    .leaf-shine {
      position: absolute;
      width: 40%;
      height: 40%;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      top: 20%;
      left: 20%;
    }

    @keyframes float-leaf1 {
      0%, 100% { transform: translate(0, 0) rotate(45deg); }
      50% { transform: translate(-5px, -8px) rotate(55deg); }
    }

    @keyframes float-leaf2 {
      0%, 100% { transform: translate(0, 0) rotate(45deg); }
      50% { transform: translate(5px, -6px) rotate(35deg); }
    }

    @keyframes float-leaf3 {
      0%, 100% { transform: translate(0, 0) rotate(45deg); }
      50% { transform: translate(-3px, 5px) rotate(55deg); }
    }

    @keyframes float-leaf4 {
      0%, 100% { transform: translate(0, 0) rotate(45deg); }
      50% { transform: translate(4px, -4px) rotate(35deg); }
    }

    .assistant-eye {
      position: absolute;
      width: 22px;
      height: 24px;
      background: white;
      border-radius: 50%;
      top: 30px;
      overflow: hidden;
      box-shadow: 0 0 5px rgba(0,0,0,0.2);
      z-index: 3;
    }

    .assistant-eye.left { 
      left: 18px;
      transform: rotate(-5deg);
    }
    
    .assistant-eye.right { 
      right: 18px;
      transform: rotate(5deg);
    }

    .eye-pupil {
      position: absolute;
      width: 12px;
      height: 12px;
      background: ${COLORS.primary.dark};
      border-radius: 50%;
      top: 6px;
      left: 5px;
      transition: all 0.1s ease;
    }

    .eye-highlight {
      position: absolute;
      width: 5px;
      height: 5px;
      background: white;
      border-radius: 50%;
      top: 2px;
      left: 2px;
    }

    .eye-highlight-small {
      position: absolute;
      width: 3px;
      height: 3px;
      background: white;
      border-radius: 50%;
      bottom: 1px;
      right: 1px;
    }

    .eye-lid {
      position: absolute;
      width: 100%;
      height: 100%;
      background: ${COLORS.primary.main};
      top: -100%;
      left: 0;
      border-radius: 50%;
      transition: all 0.15s ease;
    }

    .wink .eye-lid {
      top: 0;
    }

    .assistant-blush {
      position: absolute;
      width: 18px;
      height: 8px;
      background: ${COLORS.accent.pink}70;
      border-radius: 50%;
      opacity: 0.8;
      top: 45px;
      filter: blur(2px);
      z-index: 3;
    }

    .assistant-blush.left { left: 12px; }
    .assistant-blush.right { right: 12px; }

    .assistant-mouth {
      position: absolute;
      width: 20px;
      height: 10px;
      bottom: 22px;
      left: 33px;
      border: none;
      border-bottom: 2px solid ${COLORS.accent.pink};
      border-radius: 50%;
      z-index: 3;
    }

    .assistant-mouth.smile {
      height: 8px;
      width: 20px;
    }

    .assistant-mouth.surprised {
      height: 12px;
      width: 12px;
      border: 2px solid ${COLORS.accent.pink};
      border-radius: 50%;
      left: 37px;
    }

    .speech-bubble {
      position: absolute;
      top: -20px;
      right: 140px;
      background: ${COLORS.background.light}E6;
      padding: 18px;
      border-radius: 20px;
      box-shadow: 0 0 15px rgba(147, 112, 219, 0.25);
      width: 250px;
      min-height: 90px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 0.95rem;
      color: ${COLORS.text.primary};
      border: 2px solid ${COLORS.accent.green}60;
      backdrop-filter: blur(5px);
      overflow: hidden;
      z-index: 1001;
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
      border-left: 12px solid ${COLORS.background.light}E6;
      filter: drop-shadow(2px 0 2px rgba(0,0,0,0.1));
    }

    .blink {
      animation: blink-animation 0.2s ease;
    }

    @keyframes blink-animation {
      0% { top: -100%; }
      50% { top: 0; }
      100% { top: -100%; }
    }

    .heart {
      position: absolute;
      opacity: 0;
      font-size: 18px;
      pointer-events: none;
      animation: float-up 1.5s forwards;
    }

    .heart.heart-pink {
      color: ${COLORS.accent.pink};
    }

    .heart.heart-green {
      color: ${COLORS.accent.green};
    }

    @keyframes float-up {
      0% {
        opacity: 0;
        transform: translateY(0) scale(0.5);
      }
      20% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        transform: translateY(-80px) scale(1.2);
      }
    }

    .eco-sparkle {
      position: absolute;
      width: 5px;
      height: 5px;
      background: ${COLORS.secondary.light};
      border-radius: 50%;
      opacity: 0.8;
      animation: sparkle 2s infinite ease-in-out;
    }

    @keyframes sparkle {
      0%, 100% { opacity: 0.2; transform: scale(0.8); }
      50% { opacity: 0.8; transform: scale(1.2); }
    }

    .recycling-symbol {
      position: absolute;
      width: 15px;
      height: 15px;
      top: 10px;
      left: 35px;
      z-index: 3;
      opacity: 0.9;
    }

    .recycling-symbol::before,
    .recycling-symbol::after,
    .recycling-symbol span {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background: ${COLORS.secondary.main};
      clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
      animation: rotate-symbol 6s infinite linear;
    }

    .recycling-symbol::before {
      animation-delay: -2s;
    }

    .recycling-symbol::after {
      animation-delay: -4s;
    }

    @keyframes rotate-symbol {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  // Add random eco sparkles around the character
  useEffect(() => {
    if (!containerRef.current) return;
    
    const createSparkles = () => {
      // Remove existing sparkles
      const existingSparkles = containerRef.current?.querySelectorAll('.eco-sparkle');
      existingSparkles?.forEach(sparkle => sparkle.remove());
      
      // Create new sparkles
      const sparkleCount = 6;
      for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'eco-sparkle';
        
        // Random position around the character
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 40;
        const x = Math.cos(angle) * distance + 80;
        const y = Math.sin(angle) * distance + 90;
        
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        
        // Random animation delay
        sparkle.style.animationDelay = `${Math.random() * 2}s`;
        
        // Random color - either teal or green
        if (Math.random() > 0.5) {
          sparkle.style.background = COLORS.secondary.light;
        } else {
          sparkle.style.background = COLORS.accent.green;
        }
        
        containerRef.current?.appendChild(sparkle);
      }
    };
    
    createSparkles();
    const sparkleInterval = setInterval(createSparkles, 4000);
    
    return () => clearInterval(sparkleInterval);
  }, []);

  // Track mouse movement for eye tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (characterRef.current) {
        const rect = characterRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate direction from character to mouse
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        
        // Normalize and limit eye movement
        const maxMove = 4;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normalizedX = distance > 0 ? (deltaX / distance) * maxMove : 0;
        const normalizedY = distance > 0 ? (deltaY / distance) * maxMove : 0;
        
        setEyePosition({ 
          x: normalizedX, 
          y: normalizedY 
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Random blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, Math.random() * 3000 + 2000); // Random blink between 2-5 seconds
    
    return () => clearInterval(blinkInterval);
  }, []);

  // Random winking effect
  useEffect(() => {
    const winkInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance to wink
        setIsWinking(true);
        setTimeout(() => setIsWinking(false), 500);
      }
    }, 5000);
    
    return () => clearInterval(winkInterval);
  }, []);

  // Random mouth changes
  useEffect(() => {
    const mouthInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance to change mouth
        setIsSmiling(false);
        setTimeout(() => setIsSmiling(true), 1000);
      }
    }, 6000);
    
    return () => clearInterval(mouthInterval);
  }, []);

  // Random message appearance
  useEffect(() => {
    // Function to show a random message
    const showRandomMessage = () => {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setCurrentMessage(messages[randomIndex]);
      setShowMessage(true);
      
      // Auto-hide message after a random time between 5-10 seconds
      const hideTime = Math.floor(Math.random() * 5000) + 5000;
      const hideTimer = setTimeout(() => {
        setShowMessage(false);
      }, hideTime);
      
      setMessageTimer(hideTimer);
    };
    
    // Initial random delay before first message (5-15 seconds after component mounts)
    const initialDelay = setTimeout(() => {
      showRandomMessage();
    }, Math.floor(Math.random() * 10000) + 5000);
    
    // Set up interval for random message appearances
    const messageInterval = setInterval(() => {
      // Only show a new message if no message is currently showing
      // and there's a 30% chance to show a message
      if (!showMessage && Math.random() < 0.3) {
        showRandomMessage();
      }
    }, 8000); // Check every 8 seconds if we should show a message
    
    return () => {
      clearTimeout(initialDelay);
      clearInterval(messageInterval);
      if (messageTimer) clearTimeout(messageTimer);
    };
  }, [showMessage, messages]);

  // Create floating hearts/leaves on click
  const createHeart = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const heart = document.createElement('div');
    // Randomly choose between hearts, leaves, and recycling emojis
    const symbols = ['💖', '🌿', '♻️', '🌱', '💚'];
    heart.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
    heart.className = Math.random() > 0.5 ? 'heart heart-pink' : 'heart heart-green';
    heart.style.left = `${e.clientX - containerRef.current.getBoundingClientRect().left}px`;
    heart.style.top = `${e.clientY - containerRef.current.getBoundingClientRect().top}px`;
    
    containerRef.current.appendChild(heart);
    
    setTimeout(() => {
      if (containerRef.current && containerRef.current.contains(heart)) {
        containerRef.current.removeChild(heart);
      }
    }, 1500);
  };

  const handleCharacterClick = (e: React.MouseEvent) => {
    createHeart(e);
    
    if (messageTimer) clearTimeout(messageTimer);
    
    if (!showMessage) {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setCurrentMessage(messages[randomIndex]);
      setShowMessage(true);
      
      // Auto-hide message after a random time between 5-10 seconds
      const hideTime = Math.floor(Math.random() * 5000) + 5000;
      const hideTimer = setTimeout(() => {
        setShowMessage(false);
      }, hideTime);
      
      setMessageTimer(hideTimer);
    } else {
      // Show a different message when already showing one
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * messages.length);
      } while (messages[randomIndex] === currentMessage);
      
      setCurrentMessage(messages[randomIndex]);
      
      // Reset the auto-hide timer
      if (messageTimer) clearTimeout(messageTimer);
      const hideTime = Math.floor(Math.random() * 5000) + 5000;
      const hideTimer = setTimeout(() => {
        setShowMessage(false);
      }, hideTime);
      
      setMessageTimer(hideTimer);
    }
  };

  const handleCloseMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMessage(false);
    if (messageTimer) clearTimeout(messageTimer);
  };

  return (
    <div className="eco-assistant-container" ref={containerRef}>
      <style>{characterStyles}</style>
      
      <motion.div
        className="eco-assistant"
        ref={characterRef}
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          y: {
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          },
        }}
        onClick={handleCharacterClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="assistant-head">
          <div className="assistant-eye left">
            <div 
              className="eye-pupil" 
              style={{ 
                transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)` 
              }}
            >
              <div className="eye-highlight"></div>
              <div className="eye-highlight-small"></div>
            </div>
            <div className={`eye-lid ${blinking ? 'blink' : ''}`}></div>
          </div>
          
          <div className={`assistant-eye right ${isWinking ? 'wink' : ''}`}>
            <div 
              className="eye-pupil" 
              style={{ 
                transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)` 
              }}
            >
              <div className="eye-highlight"></div>
              <div className="eye-highlight-small"></div>
            </div>
            <div className={`eye-lid ${blinking ? 'blink' : ''}`}></div>
          </div>
          
          <div className="assistant-blush left"></div>
          <div className="assistant-blush right"></div>
          
          <div className={`assistant-mouth ${isSmiling ? 'smile' : 'surprised'}`}></div>
          
          <div className="recycling-symbol">
            <span></span>
          </div>
        </div>
        
        {/* Floating leaves */}
        <div className="floating-leaf leaf1">
          <div className="leaf-shine"></div>
        </div>
        <div className="floating-leaf leaf2">
          <div className="leaf-shine"></div>
        </div>
        <div className="floating-leaf leaf3">
          <div className="leaf-shine"></div>
        </div>
        <div className="floating-leaf leaf4">
          <div className="leaf-shine"></div>
        </div>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="speech-bubble"
          >
            {/* Glow effects */}
            <div 
              style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: `radial-gradient(circle at center, ${COLORS.primary.main}15, transparent 70%)`,
                opacity: 0.5,
                pointerEvents: 'none',
              }}
            />
            
            {/* Close button */}
            <motion.button
              onClick={handleCloseMessage}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: 'none',
                background: `${COLORS.accent.pink}40`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                color: COLORS.text.primary,
                fontSize: '12px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                zIndex: 2,
              }}
            >
              <svg
                width="10"
                height="10"
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
                padding: '8px',
                paddingTop: '16px',
                width: '100%',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <p 
                style={{ 
                  margin: 0,
                  textShadow: `0 0 8px ${COLORS.primary.main}30`,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  fontSize: '0.95rem',
                }}
              >
                {currentMessage}
              </p>
            </motion.div>
            
            {/* Animated border */}
            <div 
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: `linear-gradient(to right, ${COLORS.secondary.main}, ${COLORS.primary.main}, ${COLORS.accent.green}, ${COLORS.secondary.main})`,
                backgroundSize: '300% 100%',
                animation: 'moveGradient 4s linear infinite',
                opacity: 0.7,
              }}
            />
            <style jsx>{`
              @keyframes moveGradient {
                0% { background-position: 0% 0%; }
                100% { background-position: 300% 0%; }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EcoAssistant;