import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWhatsappConversations, fetchWhatsappConversation } from '../../services/whatsappService';
import { WhatsappConversation } from '../../types/whatsapp';
import { MainLayout } from '../../components/layout/MainLayout';

const WhatsappConversationsPage: React.FC = () => {
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const { data: numbers = [], isLoading: loadingNumbers } = useQuery<string[]>({
    queryKey: ['whatsapp-numbers'],
    queryFn: fetchWhatsappConversations,
  });
  const {
    data: conversation,
    isLoading: loadingConversation,
  } = useQuery<WhatsappConversation | undefined>({
    queryKey: ['whatsapp-conversation', selectedNumber],
    queryFn: () => selectedNumber ? fetchWhatsappConversation(selectedNumber) : Promise.resolve(undefined),
    enabled: !!selectedNumber,
  });

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">WhatsApp Conversations</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Numbers List */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-2">Phone Numbers</h2>
            {loadingNumbers ? (
              <p>Loading...</p>
            ) : numbers && numbers.length > 0 ? (
              <ul>
                {numbers.map((num: string) => (
                  <li key={num}>
                    <button
                      className={`w-full text-left px-2 py-1 rounded hover:bg-blue-100 ${selectedNumber === num ? 'bg-blue-200' : ''}`}
                      onClick={() => setSelectedNumber(num)}
                    >
                      {num}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No conversations yet.</p>
            )}
          </div>
          {/* Conversation View */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-2">Conversation</h2>
            {loadingConversation ? (
              <p>Loading conversation...</p>
            ) : conversation ? (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {conversation.messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.direction === 'inbound' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`px-3 py-2 rounded-lg ${msg.direction === 'inbound' ? 'bg-gray-200' : 'bg-blue-200'} max-w-xs`}> 
                      <div className="text-sm">{msg.message}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedNumber ? (
              <p>No messages for this number.</p>
            ) : (
              <p>Select a number to view conversation.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default WhatsappConversationsPage; 