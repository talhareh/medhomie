import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createPayPalOrder, capturePayPalPayment, getPayPalOrder, verifyPayPalWebhook } from '../services/paypalService';
import { PayPalOrder, PayPalOrderStatus } from '../models/PayPalOrder';
import { Course } from '../models/Course';
import { User } from '../models/User';
import { processCardPayment } from './enrollmentController';

/**
 * Create a PayPal order for course payment
 */
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Get user details
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if user already has a pending order for this course
    const existingOrder = await PayPalOrder.findOne({
      student: req.user._id,
      course: courseId,
      status: { $in: [PayPalOrderStatus.CREATED, PayPalOrderStatus.APPROVED] }
    });

    if (existingOrder) {
      res.status(400).json({ 
        message: 'Order already exists for this course',
        orderId: existingOrder.paypalOrderId,
        approvalUrl: existingOrder.approvalUrl
      });
      return;
    }

    // Create PayPal order data
    const orderData = {
      courseId: course._id.toString(),
      courseTitle: course.title,
      coursePrice: course.price,
      userId: user._id.toString(),
      userEmail: user.email,
      userName: user.fullName
    };

    // Create PayPal order
    const paypalOrder = await createPayPalOrder(orderData);

    // Save order to database
    const dbOrder = new PayPalOrder({
      paypalOrderId: paypalOrder.orderId,
      student: req.user._id,
      course: courseId,
      amount: course.price,
      currency: 'USD',
      status: PayPalOrderStatus.CREATED,
      approvalUrl: paypalOrder.approvalUrl,
      customId: courseId,
      invoiceId: `course-${courseId}-${Date.now()}`
    });

    await dbOrder.save();

    console.log('✅ PayPal order created and saved:', paypalOrder.orderId);

    res.status(201).json({
      success: true,
      orderId: paypalOrder.orderId,
      approvalUrl: paypalOrder.approvalUrl,
      status: paypalOrder.status
    });

  } catch (error) {
    console.error('❌ Error creating PayPal order:', error);
    res.status(500).json({ 
      message: 'Error creating PayPal order', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Verify and capture PayPal payment
 */
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, voucherCode } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!orderId) {
      res.status(400).json({ message: 'Order ID is required' });
      return;
    }

    // Find the order in database
    const dbOrder = await PayPalOrder.findOne({
      paypalOrderId: orderId,
      student: req.user._id
    }).populate('course');

    if (!dbOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (dbOrder.status === PayPalOrderStatus.COMPLETED) {
      res.status(400).json({ message: 'Payment already processed' });
      return;
    }

    // Capture payment with PayPal
    const paymentVerification = await capturePayPalPayment(orderId);

    // Update order status
    dbOrder.status = PayPalOrderStatus.COMPLETED;
    dbOrder.payerId = paymentVerification.payerId;
    dbOrder.paymentId = paymentVerification.paymentId;
    await dbOrder.save();

    console.log('✅ PayPal payment verified and captured:', orderId);

    // Process enrollment using existing logic
    // Create a mock request object for processCardPayment
    const mockReq = {
      ...req,
      params: { courseId: dbOrder.course._id.toString() },
      body: {
        paymentMethod: 'paypal',
        paymentDetails: {
          transactionId: paymentVerification.paymentId,
          payerId: paymentVerification.payerId,
          orderId: orderId
        },
        voucherCode: voucherCode || undefined
      }
    } as unknown as AuthRequest;

    // Call existing enrollment processing logic
    await processCardPayment(mockReq, res);

  } catch (error) {
    console.error('❌ Error verifying PayPal payment:', error);
    res.status(500).json({ 
      message: 'Error verifying PayPal payment', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Get PayPal order status
 */
export const getOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Find the order in database
    const dbOrder = await PayPalOrder.findOne({
      paypalOrderId: orderId,
      student: req.user._id
    }).populate('course');

    if (!dbOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Get latest status from PayPal
    try {
      const paypalOrder = await getPayPalOrder(orderId);
      // Map PayPal status to our enum
      const statusMap: { [key: string]: PayPalOrderStatus } = {
        'CREATED': PayPalOrderStatus.CREATED,
        'SAVED': PayPalOrderStatus.CREATED,
        'APPROVED': PayPalOrderStatus.APPROVED,
        'VOIDED': PayPalOrderStatus.CANCELLED,
        'COMPLETED': PayPalOrderStatus.COMPLETED,
        'PAYER_ACTION_REQUIRED': PayPalOrderStatus.APPROVED
      };
      const mappedStatus = statusMap[paypalOrder.status || ''] || PayPalOrderStatus.CREATED;
      dbOrder.status = mappedStatus;
      await dbOrder.save();
    } catch (paypalError) {
      console.log('Could not fetch PayPal order status, using cached status');
    }

    res.status(200).json({
      orderId: dbOrder.paypalOrderId,
      status: dbOrder.status,
      amount: dbOrder.amount,
      currency: dbOrder.currency,
      course: dbOrder.course,
      createdAt: dbOrder.createdAt,
      updatedAt: dbOrder.updatedAt
    });

  } catch (error) {
    console.error('❌ Error getting order status:', error);
    res.status(500).json({ 
      message: 'Error getting order status', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Handle PayPal webhooks
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    
    if (!webhookId || webhookId === 'your_webhook_id_here') {
      console.log('⚠️ PayPal webhook ID not configured');
      res.status(200).json({ message: 'Webhook ID not configured' });
      return;
    }

    // Verify webhook signature
    const isValid = await verifyPayPalWebhook(req.headers, JSON.stringify(req.body), webhookId);
    
    if (!isValid) {
      console.log('❌ Invalid PayPal webhook signature');
      res.status(400).json({ message: 'Invalid webhook signature' });
      return;
    }

    const event = req.body;
    console.log('📨 PayPal webhook received:', event.event_type);

    // Handle different webhook events
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(event);
        break;
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(event);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentDenied(event);
        break;
      default:
        console.log('📨 Unhandled PayPal webhook event:', event.event_type);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('❌ Error processing PayPal webhook:', error);
    res.status(500).json({ 
      message: 'Error processing webhook', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Handle order approved webhook
 */
const handleOrderApproved = async (event: any): Promise<void> => {
  try {
    const orderId = event.resource?.id;
    if (!orderId) return;

    const dbOrder = await PayPalOrder.findOne({ paypalOrderId: orderId });
    if (dbOrder && dbOrder.status === PayPalOrderStatus.CREATED) {
      dbOrder.status = PayPalOrderStatus.APPROVED;
      await dbOrder.save();
      console.log('✅ Order approved:', orderId);
    }
  } catch (error) {
    console.error('❌ Error handling order approved:', error);
  }
};

/**
 * Handle payment completed webhook
 */
const handlePaymentCompleted = async (event: any): Promise<void> => {
  try {
    const paymentId = event.resource?.id;
    const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
    
    if (!orderId) return;

    const dbOrder = await PayPalOrder.findOne({ paypalOrderId: orderId });
    if (dbOrder && dbOrder.status !== PayPalOrderStatus.COMPLETED) {
      dbOrder.status = PayPalOrderStatus.COMPLETED;
      dbOrder.paymentId = paymentId;
      await dbOrder.save();
      console.log('✅ Payment completed:', orderId);
    }
  } catch (error) {
    console.error('❌ Error handling payment completed:', error);
  }
};

/**
 * Handle payment denied webhook
 */
const handlePaymentDenied = async (event: any): Promise<void> => {
  try {
    const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
    
    if (!orderId) return;

    const dbOrder = await PayPalOrder.findOne({ paypalOrderId: orderId });
    if (dbOrder) {
      dbOrder.status = PayPalOrderStatus.FAILED;
      await dbOrder.save();
      console.log('❌ Payment denied:', orderId);
    }
  } catch (error) {
    console.error('❌ Error handling payment denied:', error);
  }
};
