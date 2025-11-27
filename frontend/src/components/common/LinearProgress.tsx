import React from 'react';
import { motion } from 'framer-motion';

interface LinearProgressProps {
  isVisible: boolean;
}

const LinearProgress: React.FC<LinearProgressProps> = ({ isVisible }) => {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary"
      initial={{ scaleX: 0 }}
      animate={{ 
        scaleX: isVisible ? 1 : 0,
        opacity: isVisible ? 1 : 0
      }}
      transition={{
        duration: isVisible ? 0.8 : 0.2,
        ease: [0.4, 0.0, 0.2, 1]
      }}
      style={{
        transformOrigin: 'left'
      }}
    />
  );
};

export default LinearProgress; 