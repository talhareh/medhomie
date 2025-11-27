import { config } from 'dotenv';
config();
import mongoose from 'mongoose';
import { generateSupportResponse } from './services/aiService';
import { WhatsappMessage } from './models/WhatsappConversation';

async function testAiService() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not defined in the environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const conversationHistory: WhatsappMessage[] = [];
    const newMessage = "Hello i face error in login";

    console.log(`\n--- Testing AI Service ---`);
    console.log(`User message: "${newMessage}"`);

    const response = await generateSupportResponse(conversationHistory, newMessage);

    console.log(`\nAI Response:`);
    console.log(response);
    console.log(`\n--- Test Complete ---`);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

testAiService(); 