import React, { useState, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import { POLICY_CONSENT_VERSION } from '../../config/policyConsent';
import { StudentPolicyConsentModal } from './StudentPolicyConsentModal';

function studentNeedsPolicyConsent(user: { role: UserRole; policyConsentAt?: string | null; policyConsentVersion?: string | null }): boolean {
  if (user.role !== UserRole.STUDENT) return false;
  if (!user.policyConsentAt) return true;
  if (user.policyConsentVersion !== POLICY_CONSENT_VERSION) return true;
  return false;
}

export const StudentPolicyConsentGate: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading, acceptPolicyConsent, logout } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const show =
    !isLoading &&
    user !== null &&
    studentNeedsPolicyConsent(user);

  const handleAgree = async () => {
    setSubmitting(true);
    try {
      await acceptPolicyConsent();
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Could not save your agreement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {children}
      {show && (
        <StudentPolicyConsentModal
          onAgree={handleAgree}
          onLogout={logout}
          isSubmitting={submitting}
        />
      )}
    </>
  );
};
