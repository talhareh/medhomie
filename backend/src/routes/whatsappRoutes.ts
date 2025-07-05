import express from 'express';
import { verifyWebhook, handleWebhook, getWhatsappConversations, getWhatsappConversation } from '../controllers/whatsappController';

const router = express.Router();

// GET for webhook verification
router.get('/webhook', verifyWebhook);

// POST for receiving messages
router.post('/webhook', handleWebhook);

// Admin API: List all WhatsApp conversations (phone numbers)
router.get('/admin/whatsapp/conversations', getWhatsappConversations);

// Admin API: Get conversation for a specific phone number
router.get('/admin/whatsapp/conversations/:phoneNumber', getWhatsappConversation);

export default router; 