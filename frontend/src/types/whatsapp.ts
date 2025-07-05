export interface WhatsappMessage {
  direction: 'inbound' | 'outbound';
  message: string;
  timestamp: string;
  messageId?: string;
  raw?: any;
}

export interface WhatsappConversation {
  phoneNumber: string;
  messages: WhatsappMessage[];
} 