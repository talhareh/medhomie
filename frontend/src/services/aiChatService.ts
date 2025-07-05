import axios from 'axios';

export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  reply: string;
  success: boolean;
}

export const sendMedicalQuestion = async (message: string): Promise<ChatResponse> => {
  try {
    const response = await axios.post<ChatResponse>('/api/ai-chat', {
      message
    });
    return response.data;
  } catch (error) {
    console.error('Error sending medical question:', error);
    throw new Error('Failed to get response from AI assistant');
  }
};

export const validateMedicalQuery = (query: string): boolean => {
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

  const lowerQuery = query.toLowerCase();
  return medicalKeywords.some(keyword => lowerQuery.includes(keyword)) ||
         lowerQuery.includes('what is') ||
         lowerQuery.includes('how to') ||
         lowerQuery.includes('why') ||
         lowerQuery.includes('when') ||
         lowerQuery.includes('where');
};

export const fetchPublicAIChatConversations = async (): Promise<string[]> => {
  const response = await axios.get<string[]>('/api/admin/public-ai-chat/conversations');
  return response.data;
};

export interface PublicAIChatMessage {
  direction: 'user' | 'bot';
  message: string;
  timestamp: string;
  page?: string;
}

export interface PublicAIChatConversation {
  ipAddress: string;
  messages: PublicAIChatMessage[];
}

export const fetchPublicAIChatConversation = async (ipAddress: string): Promise<PublicAIChatConversation> => {
  const response = await axios.get<PublicAIChatConversation>(`/api/admin/public-ai-chat/conversations/${ipAddress}`);
  return response.data;
}; 