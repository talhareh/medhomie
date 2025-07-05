import express, { RequestHandler } from 'express';
import axios from 'axios';
import PublicAIChatConversation from '../models/PublicAIChatConversation';

const router = express.Router();

const handleAIChat: RequestHandler = async (req, res) => {
  try {
    const { message, page } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    if (!message || typeof message !== 'string') {
      res.status(400).json({ 
        success: false, 
        reply: 'Please provide a valid message.' 
      });
      return;
    }

    // Store user message
    await PublicAIChatConversation.findOneAndUpdate(
      { ipAddress },
      {
        $push: {
          messages: {
            direction: 'user',
            message,
            timestamp: new Date(),
            page: page || undefined,
          },
        },
      },
      { upsert: true, new: true }
    );

    // Get bot reply
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: message
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    let aiReply = '';
    if (response.data.candidates && response.data.candidates[0]) {
      aiReply = response.data.candidates[0].content.parts[0].text;
    } else {
      aiReply = 'Sorry, I could not get a response from the AI service.';
    }

    // Store bot message
    await PublicAIChatConversation.findOneAndUpdate(
      { ipAddress },
      {
        $push: {
          messages: {
            direction: 'bot',
            message: aiReply,
            timestamp: new Date(),
            page: page || undefined,
          },
        },
      }
    );

    res.json({
      success: true,
      reply: aiReply
    });

  } catch (error) {
    console.error('Error in AI chat:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Gemini API error response:', error.response.data);
      }
      if (error.response?.status === 400) {
        res.status(400).json({
          success: false,
          reply: 'I\'m sorry, I couldn\'t process that question. Please try rephrasing it.'
        });
        return;
      }
      if (error.response?.status === 403) {
        res.status(500).json({
          success: false,
          reply: 'I\'m sorry, there\'s an issue with the AI service. Please try again later.'
        });
        return;
      }
      if (error.response?.status === 429) {
        res.status(429).json({
          success: false,
          reply: 'You have exceeded your quota or rate limit for the Gemini API. Please check your plan and billing details.'
        });
        return;
      }
    }
    res.status(500).json({
      success: false,
      reply: 'I\'m sorry, I\'m having trouble connecting right now. Please try again later.'
    });
  }
};

router.post('/ai-chat', handleAIChat);

// Admin API: List all Public AI Chat conversations (IP addresses)
router.get('/admin/public-ai-chat/conversations', async (req, res) => {
  try {
    const conversations = await PublicAIChatConversation.find({}, 'ipAddress').lean();
    const ips = conversations.map((conv: any) => conv.ipAddress);
    res.json(ips);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// Admin API: Get conversation for a specific IP address
router.get('/admin/public-ai-chat/conversations/:ipAddress', async (req, res) => {
  try {
    const { ipAddress } = req.params;
    const conversation = await PublicAIChatConversation.findOne({ ipAddress }).lean();
    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
});

export default router; 