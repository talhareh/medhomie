import crypto from 'crypto';

const getKuickpayTokenUrl = (): string =>
  process.env.KUICKPAY_TOKEN_URL || 'https://testcheckout.kuickpay.com/api/KPToken';

const getKuickpayRedirectionUrl = (): string =>
  process.env.KUICKPAY_REDIRECTION_URL || 'https://testcheckout.kuickpay.com/api/Redirection';

const getKuickpayInstitutionId = (): string =>
  (process.env.KUICKPAY_INSTITUTION_ID || '').trim();

const getKuickpaySecuredKey = (): string =>
  (process.env.KUICKPAY_SECURED_KEY || '').trim();

export interface KuickpayOrderData {
  orderId: string;
  amount: number;
  merchantName: string;
  transactionDescription: string;
  customerMobileNumber: string;
  customerEmail: string;
  successUrl: string;
  failureUrl: string;
  checkoutUrl?: string;
}

export interface KuickpayOrderResponse {
  orderId: string;
  checkoutUrl: string;
  formFields: Record<string, string>;
}

export interface KuickpayVerificationPayload {
  orderId: string;
  transactionId: string;
  responseCode: string;
  signature: string;
}

const buildMd5Signature = (value: string): string => crypto.createHash('md5').update(value).digest('hex');

const getOrderDate = (): string => new Date().toISOString().split('T')[0];

const getKuickpayAuthToken = async (): Promise<string> => {
  const institutionId = getKuickpayInstitutionId();
  const securedKey = getKuickpaySecuredKey();

  if (!institutionId || !securedKey) {
    throw new Error('Kuickpay credentials are not configured');
  }

  const response = await fetch(getKuickpayTokenUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'MedHome-Backend/1.0'
    },
    body: JSON.stringify({
      institutionID: institutionId,
      kuickpaySecuredKey: securedKey
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get Kuickpay auth token: ${errorText}`);
  }

  const data = await response.json();
  const token = data?.auth_token;
  if (!token) {
    throw new Error('Kuickpay auth token missing in response');
  }

  return token;
};

export const createKuickpayOrder = async (orderData: KuickpayOrderData): Promise<KuickpayOrderResponse> => {
  const authToken = await getKuickpayAuthToken();
  const institutionId = getKuickpayInstitutionId();
  const securedKey = getKuickpaySecuredKey();
  const amount = orderData.amount.toFixed(2);

  // Kuickpay signature for initiating checkout.
  const signature = buildMd5Signature(
    `${institutionId}${orderData.orderId}${amount}${securedKey}`
  );

  const formFields: Record<string, string> = {
    InstitutionID: institutionId,
    OrderID: orderData.orderId,
    MerchantName: orderData.merchantName,
    Amount: amount,
    TransactionDescription: orderData.transactionDescription,
    CustomerMobileNumber: orderData.customerMobileNumber,
    CustomerEmail: orderData.customerEmail,
    SuccessUrl: orderData.successUrl,
    FailureUrl: orderData.failureUrl,
    OrderDate: getOrderDate(),
    CheckoutUrl: orderData.checkoutUrl || '',
    Token: authToken,
    GrossAmount: amount,
    TaxAmount: '0',
    Discount: '0',
    Signature: signature
  };

  return {
    orderId: orderData.orderId,
    checkoutUrl: getKuickpayRedirectionUrl(),
    formFields
  };
};

const buildKuickpayReturnSignatureString = (payload: KuickpayVerificationPayload, securedKey: string): string =>
  `OrderId=${payload.orderId}` +
  `&TransactionId=${payload.transactionId}` +
  `&KuickpaySecuredKey=${securedKey}` +
  `&ResponseCode=${payload.responseCode}`;

export const verifyKuickpaySignature = (payload: KuickpayVerificationPayload): boolean => {
  const securedKey = getKuickpaySecuredKey();
  if (!securedKey) {
    return false;
  }

  const expectedSignature = buildMd5Signature(
    buildKuickpayReturnSignatureString(payload, securedKey)
  );

  return expectedSignature.toLowerCase() === payload.signature.toLowerCase();
};
