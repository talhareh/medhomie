// ============================================
// CONTEXT API: Stage Management
// Manages current page/stage with id and name
// ============================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const StageContext = createContext();

// Stage definitions
export const STAGES = {
  LOGIN: { id: 1, name: 'Login Page' },
  REGISTER: { id: 2, name: 'Registration Page' },
  HOME: { id: 3, name: 'Home Page' }
};

export const StageProvider = ({ children }) => {
  // Initialize stage from localStorage or default to LOGIN
  const getInitialStage = () => {
    const savedStage = localStorage.getItem('currentStage');
    if (savedStage) {
      try {
        return JSON.parse(savedStage);
      } catch (e) {
        return STAGES.LOGIN;
      }
    }
    return STAGES.LOGIN;
  };

  const [currentStage, setCurrentStage] = useState(getInitialStage);

  // Save stage to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentStage', JSON.stringify(currentStage));
  }, [currentStage]);

  // Function to update stage
  const updateStage = (stage) => {
    setCurrentStage(stage);
  };

  // Function to get stage by id
  const getStageById = (id) => {
    return Object.values(STAGES).find(stage => stage.id === id) || STAGES.LOGIN;
  };

  // Function to get stage by name
  const getStageByName = (name) => {
    return Object.values(STAGES).find(stage => stage.name === name) || STAGES.LOGIN;
  };

  const value = {
    currentStage,
    updateStage,
    getStageById,
    getStageByName,
    STAGES
  };

  return (
    <StageContext.Provider value={value}>
      {children}
    </StageContext.Provider>
  );
};

// Custom hook to use stage context
export const useStage = () => {
  const context = useContext(StageContext);
  if (!context) {
    throw new Error('useStage must be used within a StageProvider');
  }
  return context;
};

export default StageContext;

