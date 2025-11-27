import mongoose, { Document } from 'mongoose';

export interface WhatsappMessage {
  direction: 'inbound' | 'outbound';
  message: string;
  timestamp: Date;
  messageId?: string;
  raw?: object;
}

const MessageSchema = new mongoose.Schema({
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  messageId: String,
  raw: Object,
});

export interface IWhatsappConversation extends Document {
  phoneNumber: string;
  messages: WhatsappMessage[];
}

const WhatsappConversationSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  messages: [MessageSchema],
});

export default mongoose.model<IWhatsappConversation>('WhatsappConversation', WhatsappConversationSchema); 