import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createKuickpayOrder, verifyKuickpaySignature } from '../services/paypalService';
import { CheckoutOrder, CheckoutOrderStatus } from '../models/PayPalOrder';
import { Course } from '../models/Course';
import { User } from '../models/User';
import { validateVoucherForCourse } from './voucherController';
import { processCardPayment } from './enrollmentController';
import { Enrollment } from '../models/Enrollment';
import { hasActiveEnrollmentAccess } from '../utils/enrollmentAccess';
import { Payment, PaymentStatus } from '../models/Payment';
import { getUsdToPkrQuote } from '../services/fxService';

const KUICKPAY_ORDER_ID_LENGTH = 9;
const ORDER_ID_GENERATION_ATTEMPTS = 10;
const DEFAULT_BACKEND_URL = `http://localhost:${process.env.PORT || 5000}`;

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');

const resolveKuickpayWebhookUrl = (): string => {
  const explicitWebhookUrl = process.env.KUICKPAY_WEBHOOK_URL;
  if (explicitWebhookUrl) {
    return normalizeBaseUrl(explicitWebhookUrl);
  }

  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  return `${normalizeBaseUrl(backendUrl)}/api/paypal/kuickpay/webhook`;
};

const generateKuickpayOrderId = (): string => {
  const value = Math.floor(Math.random() * 10 ** KUICKPAY_ORDER_ID_LENGTH);
  return value.toString().padStart(KUICKPAY_ORDER_ID_LENGTH, '0');
};

const generateUniqueKuickpayOrderId = async (): Promise<string> => {
  for (let attempt = 0; attempt < ORDER_ID_GENERATION_ATTEMPTS; attempt += 1) {
    const candidateOrderId = generateKuickpayOrderId();
    const existingOrder = await CheckoutOrder.exists({ gatewayOrderId: candidateOrderId });
    if (!existingOrder) {
      return candidateOrderId;
    }
  }

  throw new Error('Unable to generate a unique Kuickpay order ID');
};
const getString = (...values: Array<string | undefined>): string => {
  for (const value of values) {
    if (value && value.trim()) return value.trim();
  }
  return '';
};

const getRefIdString = (value: unknown): string => {
  if (value && typeof value === 'object' && '_id' in (value as Record<string, unknown>)) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
};

const parseRateDate = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

const buildPricingSummary = (pricing: {
  usdAmount: number;
  exchangeRate?: number;
  exchangeRateDate?: Date;
  pkrAmount?: number;
  feeDisclaimer?: string;
}) => ({
  usdAmount: pricing.usdAmount,
  exchangeRate: pricing.exchangeRate,
  pkrAmount: pricing.pkrAmount,
  baseCurrency: 'USD' as const,
  targetCurrency: 'PKR' as const,
  rateDate: pricing.exchangeRateDate?.toISOString().split('T')[0],
  feeDisclaimer: pricing.feeDisclaimer || 'Kuickpay may charge a small additional processing fee, approximately $1-$2 equivalent.'
});

const hasFulfilledEnrollment = async (
  order: { student: unknown; course: unknown },
  transactionId?: string
): Promise<boolean> => {
  const studentId = getRefIdString(order.student);
  const courseId = getRefIdString(order.course);

  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId
  });

  if (existingEnrollment && hasActiveEnrollmentAccess(existingEnrollment)) {
    return true;
  }

  const paymentFilter: Record<string, unknown> = {
    student: studentId,
    course: courseId,
    status: PaymentStatus.VERIFIED
  };

  if (transactionId) {
    paymentFilter.transactionId = transactionId;
  }

  return !!(await Payment.exists(paymentFilter));
};

const createSilentResponse = (): Response => {
  const responseState = {
    statusCode: 200,
    payload: undefined as unknown
  };

  return {
    status(code: number) {
      responseState.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      responseState.payload = payload;
      return this;
    },
    locals: responseState
  } as unknown as Response;
};

const ensureKuickpayFulfillment = async (
  req: AuthRequest,
  dbOrder: {
    student: unknown;
    course: unknown;
    voucherCode?: string;
  },
  paymentDetails: {
    transactionId: string;
    orderId: string;
    responseCode: string;
    signature: string;
  },
  res?: Response
): Promise<{ alreadyFulfilled: boolean; statusCode?: number; payload?: unknown }> => {
  if (await hasFulfilledEnrollment(dbOrder, paymentDetails.transactionId)) {
    return { alreadyFulfilled: true };
  }

  const mockReq = {
    ...req,
    user: req.user || ({ _id: getRefIdString(dbOrder.student) } as AuthRequest['user']),
    params: { courseId: getRefIdString(dbOrder.course) },
    body: {
      paymentMethod: 'kuickpay',
      paymentDetails,
      voucherCode: dbOrder.voucherCode
    }
  } as unknown as AuthRequest;

  const targetRes = res || createSilentResponse();
  await processCardPayment(mockReq, targetRes);

  const silentState = (targetRes as unknown as { locals?: { statusCode?: number; payload?: unknown } }).locals;
  return {
    alreadyFulfilled: false,
    statusCode: silentState?.statusCode,
    payload: silentState?.payload
  };
};

/**
 * Create a Kuickpay order for course payment.
 */
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { voucherCode } = req.body || {};

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const activeOrder = await CheckoutOrder.findOne({
      student: req.user._id,
      course: courseId,
      status: { $in: [CheckoutOrderStatus.CREATED, CheckoutOrderStatus.REDIRECTED] }
    });

    if (activeOrder) {
      res.status(200).json({
        success: true,
        message: 'Order already exists for this course',
        orderId: activeOrder.gatewayOrderId,
        checkoutUrl: activeOrder.checkoutUrl,
        formFields: activeOrder.requestPayload,
        gateway: 'kuickpay',
        pricing: buildPricingSummary({
          usdAmount: activeOrder.amount,
          exchangeRate: activeOrder.exchangeRate,
          exchangeRateDate: activeOrder.exchangeRateDate,
          pkrAmount: activeOrder.pkrAmount
        })
      });
      return;
    }

    let finalPrice = course.price;
    let discountAmount = 0;
    let originalAmount = course.price;
    let normalizedVoucherCode: string | undefined;

    if (voucherCode) {
      const validationResult = await validateVoucherForCourse(
        voucherCode.trim().toUpperCase(),
        courseId,
        req.user._id
      );

      if (!validationResult.valid) {
        res.status(400).json({
          message: validationResult.message || 'Invalid voucher code'
        });
        return;
      }

      finalPrice = validationResult.finalPrice!;
      discountAmount = validationResult.discountAmount!;
      originalAmount = validationResult.originalPrice!;
      normalizedVoucherCode = voucherCode.trim().toUpperCase();
    }

    const fxQuote = await getUsdToPkrQuote();
    const pkrAmount = Math.round(finalPrice * fxQuote.exchangeRate);
    const orderId = await generateUniqueKuickpayOrderId();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const checkoutCallbackUrl = resolveKuickpayWebhookUrl();

    const kuickpayOrder = await createKuickpayOrder({
      orderId,
      amount: pkrAmount,
      merchantName: 'MedHome',
      transactionDescription: `Course purchase: ${course.title}`,
      customerMobileNumber: user.whatsappNumber || '03000000000',
      customerEmail: user.email,
      successUrl: `${frontendUrl}/payment/success`,
      failureUrl: `${frontendUrl}/payment/cancel`,
      checkoutUrl: checkoutCallbackUrl
    });

    await CheckoutOrder.create({
      gatewayOrderId: orderId,
      student: req.user._id,
      course: courseId,
      amount: finalPrice,
      originalAmount,
      discountAmount,
      voucherCode: normalizedVoucherCode,
      currency: 'USD',
      exchangeRate: fxQuote.exchangeRate,
      exchangeRateDate: parseRateDate(fxQuote.rateDate),
      pkrAmount,
      pkrCurrency: 'PKR',
      status: CheckoutOrderStatus.REDIRECTED,
      checkoutUrl: kuickpayOrder.checkoutUrl,
      requestPayload: kuickpayOrder.formFields
    });

    res.status(201).json({
      success: true,
      orderId,
      checkoutUrl: kuickpayOrder.checkoutUrl,
      formFields: kuickpayOrder.formFields,
      gateway: 'kuickpay',
      pricing: buildPricingSummary({
        usdAmount: finalPrice,
        exchangeRate: fxQuote.exchangeRate,
        exchangeRateDate: parseRateDate(fxQuote.rateDate),
        pkrAmount
      })
    });
  } catch (error) {
    console.error('Error creating Kuickpay order:', error);
    res.status(500).json({
      message: 'Error creating Kuickpay order',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Verify Kuickpay return and complete enrollment.
 */
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      orderId,
      OrderId,
      transactionId,
      TransactionId,
      responseCode,
      ResponseCode,
      signature,
      Signature
    } = req.body || {};

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const normalizedOrderId = getString(orderId, OrderId);
    const normalizedTransactionId = getString(transactionId, TransactionId);
    const normalizedResponseCode = getString(responseCode, ResponseCode);
    const normalizedSignature = getString(signature, Signature);

    if (!normalizedOrderId) {
      res.status(400).json({ message: 'Order ID is required' });
      return;
    }

    const dbOrder = await CheckoutOrder.findOne({
      gatewayOrderId: normalizedOrderId,
      student: req.user._id
    }).populate('course');

    if (!dbOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (!normalizedTransactionId || !normalizedResponseCode || !normalizedSignature) {
      res.status(400).json({ message: 'Missing transaction verification fields' });
      return;
    }

    if (dbOrder.status === CheckoutOrderStatus.COMPLETED) {
      const fulfillment = await ensureKuickpayFulfillment(req, dbOrder, {
        transactionId: normalizedTransactionId,
        orderId: normalizedOrderId,
        responseCode: normalizedResponseCode,
        signature: normalizedSignature
      });

      if (fulfillment.alreadyFulfilled) {
        res.status(200).json({ message: 'Payment already processed', orderId: normalizedOrderId });
        return;
      }

      res.status(200).json({
        message: 'Payment was already verified and enrollment has now been completed',
        orderId: normalizedOrderId
      });
      return;
    }

    const isSignatureValid = verifyKuickpaySignature({
      orderId: normalizedOrderId,
      transactionId: normalizedTransactionId,
      responseCode: normalizedResponseCode,
      signature: normalizedSignature
    });

    if (!isSignatureValid) {
      dbOrder.status = CheckoutOrderStatus.FAILED;
      dbOrder.responseCode = normalizedResponseCode;
      dbOrder.signature = normalizedSignature;
      dbOrder.responsePayload = req.body;
      await dbOrder.save();
      res.status(400).json({ message: 'Invalid payment signature' });
      return;
    }

    if (normalizedResponseCode !== '00') {
      dbOrder.status = CheckoutOrderStatus.FAILED;
      dbOrder.responseCode = normalizedResponseCode;
      dbOrder.signature = normalizedSignature;
      dbOrder.gatewayTransactionId = normalizedTransactionId;
      dbOrder.responsePayload = req.body;
      await dbOrder.save();
      res.status(400).json({ message: 'Payment failed or was cancelled', responseCode: normalizedResponseCode });
      return;
    }

    dbOrder.status = CheckoutOrderStatus.COMPLETED;
    dbOrder.responseCode = normalizedResponseCode;
    dbOrder.signature = normalizedSignature;
    dbOrder.gatewayTransactionId = normalizedTransactionId;
    dbOrder.responsePayload = req.body;
    await dbOrder.save();

    await ensureKuickpayFulfillment(req, dbOrder, {
      transactionId: normalizedTransactionId,
      orderId: normalizedOrderId,
      responseCode: normalizedResponseCode,
      signature: normalizedSignature
    }, res);
  } catch (error) {
    console.error('Error verifying Kuickpay payment:', error);
    res.status(500).json({
      message: 'Error verifying Kuickpay payment',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Get gateway order status.
 */
export const getOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const dbOrder = await CheckoutOrder.findOne({
      gatewayOrderId: orderId,
      student: req.user._id
    }).populate('course');

    if (!dbOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.status(200).json({
      orderId: dbOrder.gatewayOrderId,
      status: dbOrder.status,
      amount: dbOrder.amount,
      currency: dbOrder.currency,
      exchangeRate: dbOrder.exchangeRate,
      exchangeRateDate: dbOrder.exchangeRateDate,
      pkrAmount: dbOrder.pkrAmount,
      pkrCurrency: dbOrder.pkrCurrency,
      course: dbOrder.course,
      gatewayTransactionId: dbOrder.gatewayTransactionId,
      responseCode: dbOrder.responseCode,
      createdAt: dbOrder.createdAt,
      updatedAt: dbOrder.updatedAt
    });
  } catch (error) {
    console.error('Error getting Kuickpay order status:', error);
    res.status(500).json({
      message: 'Error getting order status',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Handle Kuickpay backend notification callback.
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
    const normalizedOrderId = getString(payload.OrderId as string, payload.orderId as string);
    const normalizedTransactionId = getString(payload.TransactionId as string, payload.transactionId as string);
    const normalizedResponseCode = getString(payload.ResponseCode as string, payload.responseCode as string);
    const normalizedSignature = getString(payload.Signature as string, payload.signature as string);

    if (!normalizedOrderId) {
      res.status(400).json({ message: 'Order ID is required' });
      return;
    }

    const dbOrder = await CheckoutOrder.findOne({ gatewayOrderId: normalizedOrderId });
    if (!dbOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (normalizedTransactionId && normalizedResponseCode && normalizedSignature) {
      const isSignatureValid = verifyKuickpaySignature({
        orderId: normalizedOrderId,
        transactionId: normalizedTransactionId,
        responseCode: normalizedResponseCode,
        signature: normalizedSignature
      });

      if (!isSignatureValid) {
        res.status(400).json({ message: 'Invalid webhook signature' });
        return;
      }

      dbOrder.gatewayTransactionId = normalizedTransactionId;
      dbOrder.responseCode = normalizedResponseCode;
      dbOrder.signature = normalizedSignature;
      dbOrder.status = normalizedResponseCode === '00'
        ? CheckoutOrderStatus.COMPLETED
        : CheckoutOrderStatus.FAILED;
    } else {
      dbOrder.status = CheckoutOrderStatus.FAILED;
    }

    dbOrder.responsePayload = payload as Record<string, unknown>;
    await dbOrder.save();

    if (normalizedResponseCode === '00' && normalizedTransactionId && normalizedSignature) {
      const fulfillment = await ensureKuickpayFulfillment(
        {} as AuthRequest,
        dbOrder,
        {
          transactionId: normalizedTransactionId,
          orderId: normalizedOrderId,
          responseCode: normalizedResponseCode,
          signature: normalizedSignature
        }
      );

      if (!fulfillment.alreadyFulfilled && fulfillment.statusCode && fulfillment.statusCode >= 400) {
        console.error('Kuickpay webhook fallback enrollment returned non-success status:', fulfillment);
      }
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error handling Kuickpay webhook:', error);
    res.status(500).json({
      message: 'Error processing webhook',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
