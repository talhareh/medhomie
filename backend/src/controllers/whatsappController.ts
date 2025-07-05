import { Request, Response } from 'express';
import axios from 'axios';
import WhatsappConversation from '../models/WhatsappConversation';

// GET /webhook - Verification
export const verifyWebhook = (req: Request, res: Response) => {
  const VERIFY_TOKEN = process.env.MYTOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};

const WHATSAPP_TOKEN = process.env.TOKEN; // Use TOKEN from .env
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID; // Use WHATSAPP_PHONE_NUMBER_ID from .env

export async function sendWhatsAppMessage(to: string, message: string) {
  console.log('Environment variables check:');
  console.log('TOKEN:', WHATSAPP_TOKEN ? 'Set' : 'NOT SET');
  console.log('WHATSAPP_PHONE_NUMBER_ID:', PHONE_NUMBER_ID ? 'Set' : 'NOT SET');
  
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    throw new Error('WhatsApp credentials not configured. Please check TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables.');
  }

  const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  const data = {
    messaging_product: "whatsapp",
    to,
    text: { body: message },
  };

  console.log('Sending WhatsApp message to:', url);
  console.log('Message data:', JSON.stringify(data, null, 2));

  await axios.post(url, data, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
}

// POST /webhook - Receive messages
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    console.log('Received WhatsApp webhook:', JSON.stringify(req.body, null, 2));
    
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages.length > 0) {
      const message = messages[0];
      const from = message.from;
      const text = message.text?.body?.trim();
      const messageId = message.id;

      console.log(`Incoming message from ${from}: "${text}" (ID: ${messageId})`);

      // Save inbound message
      await WhatsappConversation.findOneAndUpdate(
        { phoneNumber: from },
        {
          $push: {
            messages: {
              direction: 'inbound',
              message: text,
              timestamp: new Date(),
              messageId,
              raw: message,
            },
          },
        },
        { upsert: true, new: true }
      );

      // Always reply with the same message
      const reply = "Hello, How can I help you?";
      console.log(`Sending reply to ${from}: "${reply}"`);
      await sendWhatsAppMessage(from, reply);

      // Save outbound message
      await WhatsappConversation.findOneAndUpdate(
        { phoneNumber: from },
        {
          $push: {
            messages: {
              direction: 'outbound',
              message: reply,
              timestamp: new Date(),
              // Optionally, add a messageId if you get it from WhatsApp API response
            },
          },
        }
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error handling WhatsApp webhook:", error);
    res.sendStatus(500);
  }
};

// Admin: Get list of phone numbers with conversations
export const getWhatsappConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await WhatsappConversation.find({}, 'phoneNumber').lean();
    const numbers = conversations.map((conv: any) => conv.phoneNumber);
    res.json(numbers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversations' });
    return;
  }
};

// Admin: Get conversation for a specific phone number
export const getWhatsappConversation = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.params;
    const conversation = await WhatsappConversation.findOne({ phoneNumber }).lean();
    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversation' });
    return;
  }
}; 