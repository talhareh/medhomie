import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  messageId: String,
  raw: Object,
});

const WhatsappConversationSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  messages: [MessageSchema],
});

export default mongoose.model('WhatsappConversation', WhatsappConversationSchema); 