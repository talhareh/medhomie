import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export const EmailVerificationPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { verifyEmail: verifyEmailRequest } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const verificationRef = useRef(false);

  useEffect(() => {
    const verify = async () => {
      // If no token or verification already attempted, return early
      if (!token || verificationRef.current) {
        setVerificationStatus('error');
        setIsVerifying(false);
        return;
      }

      // Mark verification as attempted
      verificationRef.current = true;

      try {
        await verifyEmailRequest(token);
        setVerificationStatus('success');
        toast.success('Email verified successfully!');
      } catch (error: any) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        toast.error(error.response?.data?.message || 'Email verification failed. Please try again or contact support.');
      } finally {
        setIsVerifying(false);
      }
    };

    verify();

    // Cleanup function to handle component unmount
    return () => {
      verificationRef.current = true;
    };
  }, [token, verifyEmailRequest]); // Added proper dependencies

  if (isVerifying && !verificationRef.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Verifying your email...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
        {verificationStatus === 'success' ? (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-6">
                Your email has been successfully verified. You can now access all features of MedHome.
              </p>
              <div className="space-y-4">
                <Link
                  to="/auth?mode=login"
                  className="block w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors"
                >
                  Login to Your Account
                </Link>
                <Link
                  to="/"
                  className="block w-full px-4 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-gray-50 transition-colors"
                >
                  Go to Homepage
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">
                We couldn't verify your email. The link might be expired or invalid.
              </p>
              <div className="space-y-4">
                <Link
                  to="/auth?mode=login"
                  className="block w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors"
                >
                  Try Logging In
                </Link>
                <Link
                  to="/"
                  className="block w-full px-4 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-gray-50 transition-colors"
                >
                  Go to Homepage
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
