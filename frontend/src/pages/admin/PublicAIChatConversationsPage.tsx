import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicAIChatConversations, fetchPublicAIChatConversation, PublicAIChatConversation } from '../../services/aiChatService';
import { MainLayout } from '../../components/layout/MainLayout';

const PublicAIChatConversationsPage: React.FC = () => {
  const [selectedIP, setSelectedIP] = useState<string | null>(null);
  const { data: ips = [], isLoading: loadingIPs } = useQuery<string[]>({
    queryKey: ['public-ai-chat-ips'],
    queryFn: fetchPublicAIChatConversations,
  });
  const {
    data: conversation,
    isLoading: loadingConversation,
  } = useQuery<PublicAIChatConversation | undefined>({
    queryKey: ['public-ai-chat-conversation', selectedIP],
    queryFn: () => selectedIP ? fetchPublicAIChatConversation(selectedIP) : Promise.resolve(undefined),
    enabled: !!selectedIP,
  });

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Public AI Chat Conversations</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* IP List */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-2">IP Addresses</h2>
            {loadingIPs ? (
              <p>Loading...</p>
            ) : ips && ips.length > 0 ? (
              <ul>
                {ips.map((ip: string) => (
                  <li key={ip}>
                    <button
                      className={`w-full text-left px-2 py-1 rounded hover:bg-blue-100 ${selectedIP === ip ? 'bg-blue-200' : ''}`}
                      onClick={() => setSelectedIP(ip)}
                    >
                      {ip}
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
                  <div key={idx} className={`flex ${msg.direction === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-3 py-2 rounded-lg ${msg.direction === 'user' ? 'bg-blue-200' : 'bg-gray-200'} max-w-xs`}>
                      <div className="text-sm">{msg.message}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleString()}</div>
                      {msg.page && <div className="text-xs text-gray-400">Page: {msg.page}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedIP ? (
              <p>No messages for this IP address.</p>
            ) : (
              <p>Select an IP address to view conversation.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PublicAIChatConversationsPage; 