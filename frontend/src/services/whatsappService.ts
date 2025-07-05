import api from '../utils/axios';
import { WhatsappConversation } from '../types/whatsapp';

export const fetchWhatsappConversations = async (): Promise<string[]> => {
  const response = await api.get<string[]>('/admin/whatsapp/conversations');
  return response.data;
};

export const fetchWhatsappConversation = async (phoneNumber: string): Promise<WhatsappConversation> => {
  const response = await api.get<WhatsappConversation>(`/admin/whatsapp/conversations/${phoneNumber}`);
  return response.data;
}; 