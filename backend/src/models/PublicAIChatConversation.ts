import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  direction: { type: String, enum: ['user', 'bot'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  page: { type: String }, // Optional: page where the message was sent
});

const PublicAIChatConversationSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true, unique: true },
  messages: [MessageSchema],
});

export default mongoose.model('PublicAIChatConversation', PublicAIChatConversationSchema); 