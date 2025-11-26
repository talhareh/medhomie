// ============================================
// State Test Page
// Displays current state from Context API
// Useful for validation and debugging
// ============================================

import React, { useEffect, useState } from 'react';
import { useStage, STAGES } from '../context/StageContext';

const StateTestPage = () => {
  const { currentStage, updateStage } = useStage();
  
  const [localStorageContext, setLocalStorageContext] = useState(null);

  // Update localStorage readings
  useEffect(() => {
    const updateLocalStorage = () => {
      try {
        const contextState = localStorage.getItem('currentStage');
        setLocalStorageContext(contextState ? JSON.parse(contextState) : null);
      } catch (e) {
        console.error('Error reading localStorage:', e);
      }
    };

    updateLocalStorage();
    const interval = setInterval(updateLocalStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSetStage = (stage) => {
    updateStage(stage);
  };

  return (
    <div className="bg-white min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          State Management Test Page (Context API)
        </h1>

        {/* Context API State */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">
            Context API State
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Current Stage (Live):</p>
              <div className="bg-white p-4 rounded border">
                <p><strong>ID:</strong> {currentStage?.id || 'N/A'}</p>
                <p><strong>Name:</strong> {currentStage?.name || 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">LocalStorage:</p>
              <div className="bg-white p-4 rounded border">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(localStorageContext, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Controls */}
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Test Stage Updates
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleSetStage(STAGES.LOGIN)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Set Login Stage
            </button>
            <button
              onClick={() => handleSetStage(STAGES.REGISTER)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Set Register Stage
            </button>
            <button
              onClick={() => handleSetStage(STAGES.HOME)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Set Home Stage
            </button>
          </div>
        </div>

        {/* Validation Status */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">
            Validation Status
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={localStorageContext ? 'text-green-600' : 'text-red-600'}>
                {localStorageContext ? '✅' : '❌'}
              </span>
              <span>Context API state persisted in localStorage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={currentStage?.id === localStorageContext?.id ? 'text-green-600' : 'text-red-600'}>
                {currentStage?.id === localStorageContext?.id ? '✅' : '❌'}
              </span>
              <span>
                Current Stage ID ({currentStage?.id}) matches localStorage ID ({localStorageContext?.id || 'N/A'})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={currentStage?.name === localStorageContext?.name ? 'text-green-600' : 'text-red-600'}>
                {currentStage?.name === localStorageContext?.name ? '✅' : '❌'}
              </span>
              <span>
                Current Stage Name ({currentStage?.name}) matches localStorage Name ({localStorageContext?.name || 'N/A'})
              </span>
            </div>
          </div>
        </div>

        {/* API Test Section */}
        <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">
            API Test (Postman)
          </h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Endpoint:</strong> <code className="bg-white px-2 py-1 rounded">GET http://localhost:8081/stages</code>
            </p>
            <p className="text-gray-700">
              <strong>Expected Response:</strong>
            </p>
            <pre className="bg-white p-4 rounded border text-xs overflow-auto">
{`{
  "message": "Stage definitions retrieved successfully",
  "stages": {
    "LOGIN": { "id": 1, "name": "Login Page" },
    "REGISTER": { "id": 2, "name": "Registration Page" },
    "HOME": { "id": 3, "name": "Home Page" }
  },
  "totalStages": 3
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateTestPage;
