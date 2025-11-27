import axios from 'axios';
import { WhatsappMessage } from '../models/WhatsappConversation';

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are a support agent for MedHome, a medical education platform. Your goal is to understand the user's problem, collect their name and email, and then inform them that support will contact them within 48 hours. Be polite, curt, and straightforward.

Conversation flow:
1. If the user describes a problem, acknowledge it and ask for their name.
2. If the user provides their name, thank them and ask for their email address.
3. If the user provides their email address, thank them and reply with: 'Thank you. A MedHome support staff member will look into your issue and get back to you within 48 hours.' and END THE CONVERSATION.
4. If the user asks a question you cannot answer or that is outside this scope, ask them to state their problem clearly or ask for their name and email to create a support ticket.
5. Keep your responses short and to the point.`;

function formatConversationHistory(history: WhatsappMessage[], newMessage: string): any[] {
  const contents = [
    {
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT }]
    },
    {
      role: 'model',
      parts: [{ text: "Okay, I understand. I'm ready to assist the next user." }]
    }
  ];

  history.forEach(msg => {
    contents.push({
      role: msg.direction === 'inbound' ? 'user' : 'model',
      parts: [{ text: msg.message }]
    });
  });

  contents.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  return contents;
}

export async function generateSupportResponse(conversationHistory: WhatsappMessage[], newMessage: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set.');
    return 'Our AI service is currently unavailable. A support agent will get back to you shortly.';
  }

  const contents = formatConversationHistory(conversationHistory, newMessage);

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      { contents },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000 // 20 seconds timeout
      }
    );

    if (response.data.candidates && response.data.candidates[0]) {
      const aiReply = response.data.candidates[0].content.parts[0].text;
      return aiReply.trim();
    } else {
      console.warn('Gemini response did not contain candidates:', response.data);
      return 'I am having trouble understanding. Could you please rephrase?';
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Gemini API error response:', error.response.data);
    }
    return 'I am currently unable to connect to the support service. Please try again in a few moments.';
  }
} 