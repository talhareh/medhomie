import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';

export const PaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Clean up sessionStorage
    sessionStorage.removeItem('kuickpay_orderId');
    sessionStorage.removeItem('kuickpay_voucherCode');
  }, []);

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-10">
          <FontAwesomeIcon icon={faTimesCircle} className="text-5xl text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-6">
            You cancelled the payment process. No charges were made to your account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/courses')}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-md transition duration-300 flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
