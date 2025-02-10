// components/InteractiveMap.tsx
"use client";

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const MapContainer = styled.div`
  height: 400px;
  position: relative;
`;

const MapTitle = styled.h2`
  font-family: 'Poppins', sans-serif;
  color: white;
  margin-bottom: 1rem;
  text-align: center;
`;

const MapFrame = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
`;

const MapPin = styled(motion.div)`
  position: absolute;
  width: 20px;
  height: 20px;
  background: #4CAF50;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
`;

const InteractiveMap: React.FC = () => {
  const locations = [
    { id: 1, lat: 40.7128, lng: -74.0060, title: 'NYC Donation Center' },
    // Add more locations...
  ];

  return (
    <MapContainer>
      <MapTitle>Donation Locations</MapTitle>
      <MapFrame>
        {/* Integrate with Google Maps or similar service */}
        {locations.map((location) => (
          <MapPin
            key={location.id}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            style={{
              left: `${location.lng}px`,
              top: `${location.lat}px`,
            }}
          />
        ))}
      </MapFrame>
    </MapContainer>
  );
};

export default InteractiveMap;