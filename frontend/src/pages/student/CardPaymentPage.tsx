import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faSpinner, faCheckCircle, faTimesCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';
// We don't need to import EnrollmentStatus as we're using the server response

// PayPal client ID would be loaded from environment variables in a production app
// We're not using the SDK directly in this implementation, so we don't need the client ID

interface PaymentState {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
}

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  name: string;
}

export const CardPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    name: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Load payment state from location state
  useEffect(() => {
    if (location.state && location.state.courseId) {
      setPaymentState(location.state as PaymentState);
    } else {
      // Redirect if no course data is provided
      toast.error('No course selected for payment');
      navigate('/courses');
    }
  }, [location.state, navigate]);

  // Enrollment mutation with automatic approval
  const enrollMutation = useMutation({
    mutationFn: async ({ courseId }: { courseId: string }) => {
      // Create a payment record with PayPal details instead of receipt upload
      const paymentData = {
        courseId,
        paymentMethod: 'paypal',
        paymentDetails: {
          transactionId: `pp-${Date.now()}`, // In a real app, this would come from PayPal
          cardLast4: cardDetails.cardNumber.slice(-4),
        },
        // Auto-approve the enrollment
        autoApprove: true,
      };
      
      const response = await api.post(`/enrollments/courses/${courseId}/card-payment`, paymentData);
      return response.data;
    },
    onSuccess: () => {
      // Update queries to reflect the new enrollment
      queryClient.invalidateQueries({ queryKey: ['public-courses'] });
      queryClient.invalidateQueries({ queryKey: ['student-payments'] });
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
      
      setPaymentStatus('success');
      setIsProcessing(false);
    },
    onError: (error: Error | unknown) => {
      setPaymentStatus('failed');
      setIsProcessing(false);
      setErrorMessage(error.response?.data?.message || 'Error processing enrollment');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '') // Remove existing spaces
        .replace(/\D/g, '') // Remove non-digits
        .replace(/(.{4})/g, '$1 ') // Add space after every 4 digits
        .trim(); // Remove trailing space
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      const formattedValue = value
        .replace(/\D/g, '') // Remove non-digits
        .replace(/^(\d{2})(?=\d)/, '$1/'); // Add slash after first 2 digits
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }
    
    // For other fields
    setCardDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateCardDetails = (): boolean => {
    // Basic validation
    if (cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Please enter a valid card number');
      return false;
    }
    
    if (cardDetails.expiryDate.length < 5) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    if (cardDetails.cvc.length < 3) {
      toast.error('Please enter a valid CVC code');
      return false;
    }
    
    if (cardDetails.name.length < 3) {
      toast.error('Please enter the cardholder name');
      return false;
    }
    
    return true;
  };

  const processPayment = async () => {
    if (!paymentState) {
      toast.error('No course selected for payment');
      return;
    }
    
    if (!validateCardDetails()) {
      return;
    }
    
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      // In a real implementation, this would call the PayPal API
      // For this demo, we'll simulate a payment process
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes: Approve payment for test card, reject for others
      const isTestCard = cardDetails.cardNumber.replace(/\s/g, '') === '4032036864600794';
      
      if (isTestCard) {
        // Process enrollment with automatic approval
        enrollMutation.mutate({ courseId: paymentState.courseId });
      } else {
        // Simulate payment failure
        setPaymentStatus('failed');
        setIsProcessing(false);
        setErrorMessage('Payment declined. Please try a different card or payment method.');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentStatus('failed');
      setIsProcessing(false);
      setErrorMessage('An unexpected error occurred. Please try again later.');
    }
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setErrorMessage('');
  };

  const handleBackToCourses = () => {
    navigate('/courses');
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
            Credit/Debit Card Payment
          </h1>
          
          {paymentState && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-700">Course: {paymentState.courseTitle}</p>
                  <p className="text-sm text-gray-500">You will be enrolled immediately after successful payment</p>
                </div>
                <div className="text-xl font-bold text-primary">
                  ${paymentState.coursePrice.toFixed(2)}
                </div>
              </div>
            </div>
          )}
          
          {paymentStatus === 'idle' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19} // 16 digits + 3 spaces
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={cardDetails.name}
                    onChange={handleInputChange}
                    placeholder="John Smith"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardDetails.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    name="cvc"
                    value={cardDetails.cvc}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-4">
                  <strong>Test Card:</strong> 4032 0368 6460 0794 | Any expiry date | Any CVC
                </p>
                <button
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-md transition duration-300 flex justify-center items-center"
                >
                  {isProcessing ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>Pay ${paymentState?.coursePrice.toFixed(2)}</>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Secured by PayPal. Your card details are encrypted.
                </p>
              </div>
            </div>
          )}
          
          {paymentStatus === 'processing' && (
            <div className="text-center py-10">
              <FontAwesomeIcon icon={faSpinner} spin className="text-5xl text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Processing Your Payment</h2>
              <p className="text-gray-600">Please wait while we process your payment...</p>
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="text-center py-10">
              <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">Your enrollment has been approved automatically.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/my-courses')}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-md transition duration-300"
                >
                  Go to My Courses
                </button>
                <button
                  onClick={handleBackToCourses}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-md transition duration-300"
                >
                  Browse More Courses
                </button>
              </div>
            </div>
          )}
          
          {paymentStatus === 'failed' && (
            <div className="text-center py-10">
              <FontAwesomeIcon icon={faTimesCircle} className="text-5xl text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-2">{errorMessage}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <button
                  onClick={handleRetry}
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
            <strong>Note:</strong> This is a sandbox payment environment for testing purposes.
            <br />No real payments will be processed.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};
