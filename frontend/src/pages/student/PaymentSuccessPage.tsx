import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  const orderIdFromUrl = searchParams.get('OrderId') || searchParams.get('orderId') || searchParams.get('token');
  const orderIdFromStorage = sessionStorage.getItem('kuickpay_orderId');
  const orderId = orderIdFromUrl || orderIdFromStorage;
  const transactionId = searchParams.get('TransactionId') || searchParams.get('transactionId');
  const responseCode = searchParams.get('ResponseCode') || searchParams.get('responseCode');
  const signature = searchParams.get('Signature') || searchParams.get('signature');

  // Payment verification mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      const response = await api.post('/paypal/verify-payment', {
        orderId,
        transactionId: transactionId || undefined,
        responseCode: responseCode || undefined,
        signature: signature || undefined
      });
      return response.data;
    },
    onSuccess: () => {
      // Clean up sessionStorage
      sessionStorage.removeItem('kuickpay_orderId');
      sessionStorage.removeItem('kuickpay_voucherCode');
      
      // Update queries to reflect the new enrollment
      queryClient.invalidateQueries({ queryKey: ['public-courses'] });
      queryClient.invalidateQueries({ queryKey: ['student-payments'] });
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
      
      setStatus('success');
      toast.success('Payment successful! You have been enrolled in the course.');
    },
    onError: (error: any) => {
      setStatus('failed');
      setErrorMessage(error.response?.data?.message || 'Error processing payment');
      toast.error('Payment verification failed');
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!orderId) {
      setStatus('failed');
      setErrorMessage('Order ID not found');
      return;
    }

    verifyPaymentMutation.mutate({ orderId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, user, navigate, transactionId, responseCode, signature]);

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {status === 'processing' && (
          <div className="text-center py-10">
            <FontAwesomeIcon icon={faSpinner} spin className="text-5xl text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verifying Your Payment</h2>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-10">
            <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your enrollment has been confirmed and invoice has been generated.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/my-courses')}
                className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-md transition duration-300"
              >
                Go to My Courses
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-md transition duration-300"
              >
                Browse More Courses
              </button>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center py-10">
            <FontAwesomeIcon icon={faTimesCircle} className="text-5xl text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-2">{errorMessage}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <button
                onClick={() => navigate('/courses')}
                className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-md transition duration-300"
              >
                Back to Courses
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
