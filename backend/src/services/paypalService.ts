import { ICourseDocument } from '../models/Course';
import { IUser } from '../models/User';

// PayPal API configuration
const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

export interface PayPalOrderData {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  userId: string;
  userEmail: string;
  userName: string;
}

export interface PayPalOrderResponse {
  orderId: string;
  approvalUrl: string;
  status: string;
}

export interface PayPalPaymentVerification {
  orderId: string;
  payerId: string;
  paymentId: string;
}

/**
 * Get PayPal access token
 */
const getPayPalAccessToken = async (): Promise<string> => {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
};

/**
 * Create a PayPal order for course payment
 */
export const createPayPalOrder = async (orderData: PayPalOrderData): Promise<PayPalOrderResponse> => {
  try {
    console.log('🔄 Creating PayPal order for course:', orderData.courseTitle);
    
    const accessToken = await getPayPalAccessToken();
    
    const orderRequest = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: orderData.coursePrice.toFixed(2)
          },
          description: `Course: ${orderData.courseTitle}`,
          custom_id: orderData.courseId,
          invoice_id: `course-${orderData.courseId}-${Date.now()}`
        }
      ],
      application_context: {
        brand_name: 'MedHome',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
      },
      payer: {
        email_address: orderData.userEmail,
        name: {
          given_name: orderData.userName.split(' ')[0] || orderData.userName,
          surname: orderData.userName.split(' ').slice(1).join(' ') || ''
        }
      }
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderRequest)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PayPal API error: ${JSON.stringify(errorData)}`);
    }

    const order = await response.json();
    console.log('✅ PayPal order created:', order.id);
    
    // Find approval URL
    const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;
    
    if (!approvalUrl) {
      throw new Error('No approval URL found in PayPal response');
    }
    
    return {
      orderId: order.id,
      approvalUrl,
      status: order.status || 'CREATED'
    };
    
  } catch (error) {
    console.error('❌ Error creating PayPal order:', error);
    throw new Error(`Failed to create PayPal order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Capture/Verify a PayPal payment
 */
export const capturePayPalPayment = async (orderId: string): Promise<PayPalPaymentVerification> => {
  try {
    console.log('🔄 Capturing PayPal payment for order:', orderId);
    
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PayPal capture error: ${JSON.stringify(errorData)}`);
    }

    const order = await response.json();
    console.log('✅ PayPal payment captured:', order.id);
    
    // Extract payment details
    const purchaseUnit = order.purchase_units?.[0];
    const payment = purchaseUnit?.payments?.captures?.[0];
    const payer = order.payer;
    
    if (!payment || !payer) {
      throw new Error('Invalid payment data in PayPal response');
    }
    
    return {
      orderId: order.id,
      payerId: payer.payer_id || '',
      paymentId: payment.id || ''
    };
    
  } catch (error) {
    console.error('❌ Error capturing PayPal payment:', error);
    throw new Error(`Failed to capture PayPal payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get PayPal order details
 */
export const getPayPalOrder = async (orderId: string) => {
  try {
    console.log('🔄 Getting PayPal order details:', orderId);
    
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PayPal API error: ${JSON.stringify(errorData)}`);
    }

    const order = await response.json();
    console.log('✅ PayPal order retrieved:', order.id);
    return order;
    
  } catch (error) {
    console.error('❌ Error getting PayPal order:', error);
    throw new Error(`Failed to get PayPal order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Verify PayPal webhook signature
 */
export const verifyPayPalWebhook = async (headers: any, body: string, webhookId: string): Promise<boolean> => {
  try {
    // Note: PayPal webhook verification requires additional setup
    // For now, we'll implement basic verification
    // In production, you should implement proper signature verification
    
    const authAlgo = headers['paypal-auth-algo'];
    const transmissionId = headers['paypal-transmission-id'];
    const certId = headers['paypal-cert-id'];
    const transmissionSig = headers['paypal-transmission-sig'];
    const transmissionTime = headers['paypal-transmission-time'];
    
    if (!authAlgo || !transmissionId || !certId || !transmissionSig || !transmissionTime) {
      console.log('❌ Missing PayPal webhook headers');
      return false;
    }
    
    // Basic validation - in production, implement proper signature verification
    console.log('✅ PayPal webhook headers validated');
    return true;
    
  } catch (error) {
    console.error('❌ Error verifying PayPal webhook:', error);
    return false;
  }
};
