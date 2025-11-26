// ============================================
// Component: Stage Display
// Shows current stage information (id and name)
// Uses Context API only
// ============================================

import React from 'react';
import { useStage } from '../context/StageContext';

const StageDisplay = () => {
  // Context API hook
  let contextStage;
  try {
    contextStage = useStage();
  } catch (e) {
    contextStage = null;
  }

  if (!contextStage) {
    return null;
  }

  const currentStage = contextStage.currentStage || { id: 0, name: 'Unknown' };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-600 font-semibold mb-1">
            Current Stage (Context API):
          </p>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-gray-600">ID:</span>
              <span className="ml-2 text-lg font-bold text-blue-800">
                {currentStage.id}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-600">Name:</span>
              <span className="ml-2 text-lg font-bold text-blue-800">
                {currentStage.name}
              </span>
            </div>
          </div>
        </div>
        <div className="text-blue-600 text-2xl">
          📍
        </div>
      </div>
    </div>
  );
};

export default StageDisplay;
