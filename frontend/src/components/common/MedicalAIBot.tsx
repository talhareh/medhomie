import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faComments, 
  faTimes, 
  faPaperPlane, 
  faRobot,
  faUser,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { sendMedicalQuestion } from '../../services/aiChatService';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

// Utility to generate a unique ID for each message
const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const MedicalAIBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateUniqueId(),
      sender: 'bot',
      text: 'Hello! I\'m your medical AI assistant. I can help you with medical questions, healthcare information, and medical knowledge. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Medical keywords to help filter queries
  const medicalKeywords = [
    'disease', 'treatment', 'symptom', 'diagnosis', 'medicine', 'doctor', 'surgery',
    'pharmacy', 'anatomy', 'physiology', 'pathology', 'pharmacology', 'patient',
    'medical', 'health', 'healthcare', 'clinic', 'hospital', 'nurse', 'therapist',
    'therapy', 'medication', 'prescription', 'vaccine', 'infection', 'virus',
    'bacteria', 'cancer', 'diabetes', 'heart', 'lung', 'brain', 'blood', 'pain',
    'fever', 'cough', 'headache', 'nausea', 'vomiting', 'diarrhea', 'constipation',
    'allergy', 'asthma', 'hypertension', 'arthritis', 'depression', 'anxiety',
    'obesity', 'malnutrition', 'vitamin', 'mineral', 'protein', 'carbohydrate',
    'fat', 'exercise', 'diet', 'nutrition', 'pregnancy', 'childbirth', 'pediatric',
    'geriatric', 'emergency', 'trauma', 'wound', 'fracture', 'sprain', 'strain'
  ];

  const isLikelyMedical = (question: string): boolean => {
    const lowerQuestion = question.toLowerCase();
    return medicalKeywords.some(keyword => lowerQuestion.includes(keyword)) ||
           lowerQuestion.includes('what is') ||
           lowerQuestion.includes('how to') ||
           lowerQuestion.includes('why') ||
           lowerQuestion.includes('when') ||
           lowerQuestion.includes('where');
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    // Remove frontend filtering: always send the message to the backend
    const userMessageObj: Message = {
      id: generateUniqueId(),
      sender: 'user',
      text: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessageObj]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMedicalQuestion(userMessage);
      
      const botMessage: Message = {
        id: generateUniqueId(),
        sender: 'bot',
        text: response.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: generateUniqueId(),
        sender: 'bot',
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 z-50"
          aria-label="Open medical AI chat"
        >
          <FontAwesomeIcon icon={faComments} className="text-xl" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
          {/* Chat Header */}
          <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faRobot} className="mr-2" />
              <h3 className="font-semibold">Medical AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close chat"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-start">
                    {message.sender === 'bot' && (
                      <FontAwesomeIcon icon={faRobot} className="text-primary mr-2 mt-1" />
                    )}
                    {message.sender === 'user' && (
                      <FontAwesomeIcon icon={faUser} className="text-white mr-2 mt-1" />
                    )}
                    <div>
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[80%]">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faRobot} className="text-primary mr-2" />
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-primary" />
                    <span className="ml-2 text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a medical question..."
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-primary text-white p-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              I can help with medical questions, healthcare information, and medical knowledge
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default MedicalAIBot; 