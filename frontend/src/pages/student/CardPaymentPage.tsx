import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faSpinner, faTimesCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';

interface PaymentState {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  originalPrice?: number;
  voucherCode?: string;
  discountAmount?: number;
}

interface PricingSummary {
  usdAmount: number;
  exchangeRate?: number;
  pkrAmount?: number;
  baseCurrency: 'USD';
  targetCurrency: 'PKR';
  rateDate?: string;
  feeDisclaimer: string;
}

interface PreparedCheckout {
  orderId: string;
  checkoutUrl: string;
  formFields: Record<string, string>;
  pricing: PricingSummary;
}

const formatUsd = (amount: number): string => `$${amount.toFixed(2)}`;
const formatPkr = (amount: number): string => new Intl.NumberFormat('en-PK').format(amount);

export const CardPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);
  const [preparedCheckout, setPreparedCheckout] = useState<PreparedCheckout | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'preparing' | 'ready' | 'redirecting' | 'failed'>('preparing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (location.state && location.state.courseId) {
      setPaymentState(location.state as PaymentState);
    } else {
      toast.error('No course selected for payment');
      navigate('/courses');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (!paymentState) {
      return;
    }

    let cancelled = false;

    const prepareCheckout = async () => {
      setPaymentStatus('preparing');
      setErrorMessage('');

      try {
        const data = await createOrderMutation.mutateAsync();

        if (!cancelled) {
          setPreparedCheckout(data);
          setPaymentStatus('ready');
        }
      } catch {
        if (!cancelled) {
          setPreparedCheckout(null);
        }
      }
    };

    void prepareCheckout();

    return () => {
      cancelled = true;
    };
  }, [paymentState]);

  const handleBackToCourses = () => {
    navigate('/courses');
  };

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!paymentState) throw new Error('No payment details found');
      const response = await api.post(`/paypal/create-order/${paymentState.courseId}`, {
        voucherCode: paymentState.voucherCode || undefined
      });
      return response.data as {
        orderId: string;
        checkoutUrl: string;
        formFields: Record<string, string>;
        pricing: PricingSummary;
      };
    },
    onSuccess: (data) => {
      if (!paymentState) return;
      sessionStorage.setItem('kuickpay_orderId', data.orderId);
      if (paymentState.voucherCode) {
        sessionStorage.setItem('kuickpay_voucherCode', paymentState.voucherCode);
      } else {
        sessionStorage.removeItem('kuickpay_voucherCode');
      }
    },
    onError: (error: any) => {
      setPaymentStatus('failed');
      const message = error.response?.data?.message || 'Failed to initialize payment checkout';
      setErrorMessage(message);
      toast.error(message);
    }
  });

  const submitHostedForm = (checkoutData: PreparedCheckout) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = checkoutData.checkoutUrl;
    Object.entries(checkoutData.formFields || {}).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  const handleProceedToKuickpay = async () => {
    if (!preparedCheckout) {
      toast.error('Checkout is still being prepared. Please wait a moment.');
      return;
    }

    setPaymentStatus('redirecting');
    queryClient.invalidateQueries({ queryKey: ['student-payments'] });
    submitHostedForm(preparedCheckout);
  };

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={handleBackToCourses}
            className="text-primary hover:text-primary-dark flex items-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Courses
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-primary" />
            Kuickpay Checkout
          </h1>

          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            You are about to be redirected to Kuickpay, a secure third-party payment processor.
            After successful payment, you will be redirected back to MedHOME to complete your enrollment.
          </div>

          {paymentState && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-700">Course: {paymentState.courseTitle}</p>
                    <p className="text-sm text-gray-500">Your card will be charged in PKR through Kuickpay.</p>
                  </div>
                </div>
                {paymentState.voucherCode && paymentState.originalPrice && (
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Original Price:</span>
                      <span className="line-through text-gray-400">{formatUsd(paymentState.originalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Voucher Discount ({paymentState.voucherCode}):</span>
                      <span>-{formatUsd(paymentState.discountAmount || 0)}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center border-t pt-2 mt-2">
                  <span className="font-semibold">Total in USD:</span>
                  <div className="text-xl font-bold text-primary">{formatUsd(paymentState.coursePrice)}</div>
                </div>

                {preparedCheckout?.pricing && (
                  <div className="border-t pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exchange Rate:</span>
                      <span>1 USD = {preparedCheckout.pricing.exchangeRate?.toFixed(4) || '0.0000'} PKR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Charged by Kuickpay:</span>
                      <span className="font-semibold">PKR {formatPkr(preparedCheckout.pricing.pkrAmount || 0)}</span>
                    </div>
                    {preparedCheckout.pricing.rateDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rate Date:</span>
                        <span>{preparedCheckout.pricing.rateDate}</span>
                      </div>
                    )}
                    <div className="rounded-md bg-amber-50 p-3 text-amber-900">
                      {preparedCheckout.pricing.feeDisclaimer}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {paymentStatus === 'preparing' && (
            <div className="text-center py-10">
              <FontAwesomeIcon icon={faSpinner} spin className="text-5xl text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Preparing live exchange rate</h2>
              <p className="text-gray-600">Please wait while we prepare your Kuickpay checkout in PKR...</p>
            </div>
          )}

          {paymentStatus === 'ready' && preparedCheckout && (
            <div className="text-center">
              <button
                onClick={handleProceedToKuickpay}
                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-md transition duration-300"
              >
                Proceed to Kuickpay
              </button>
              <p className="text-xs text-gray-500 mt-3">
                You will now be redirected to Kuickpay hosted checkout and returned to MedHOME after payment.
              </p>
            </div>
          )}

          {paymentStatus === 'redirecting' && (
            <div className="text-center py-10">
              <FontAwesomeIcon icon={faSpinner} spin className="text-5xl text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Redirecting to Kuickpay</h2>
              <p className="text-gray-600">Please wait while we initialize your checkout...</p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="text-center py-10">
              <FontAwesomeIcon icon={faTimesCircle} className="text-5xl text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Payment Initialization Failed</h2>
              <p className="text-gray-600 mb-2">{errorMessage}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <button
                  onClick={() => {
                    setPreparedCheckout(null);
                    setPaymentStatus('preparing');
                    setErrorMessage('');
                    if (paymentState) {
                      void createOrderMutation.mutateAsync().then((data) => {
                        setPreparedCheckout(data);
                        setPaymentStatus('ready');
                      }).catch(() => {
                        // Error state is already handled by the mutation callback.
                      });
                    }
                  }}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-md transition duration-300"
                >
                  Try Again
                </button>
                <button
                  onClick={handleBackToCourses}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-md transition duration-300"
                >
                  Back to Courses
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            <strong>Note:</strong> Kuickpay may apply a small processing charge in addition to the PKR amount shown above.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};
