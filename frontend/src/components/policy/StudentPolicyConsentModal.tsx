import React, { useEffect, useState } from 'react';
import { POLICY_LINKS } from '../../config/policyConsent';

interface StudentPolicyConsentModalProps {
  onAgree: () => Promise<void>;
  onLogout: () => void;
  isSubmitting: boolean;
}

export const StudentPolicyConsentModal: React.FC<StudentPolicyConsentModalProps> = ({
  onAgree,
  onLogout,
  isSubmitting,
}) => {
  const [checks, setChecks] = useState<Record<string, boolean>>({
    refund: false,
    terms: false,
    copyright: false,
    privacy: false,
  });

  const allChecked = POLICY_LINKS.every((p) => checks[p.id]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const toggle = (id: string) => {
    setChecks((c) => ({ ...c, [id]: !c[id] }));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-consent-title"
    >
      <div
        className="w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl flex flex-col"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 rounded-t-3xl sm:rounded-t-2xl z-10">
          <h2 id="policy-consent-title" className="text-lg sm:text-xl font-bold text-gray-900 pr-8">
            Policies &amp; agreement
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Please confirm you have read and agree to each item below. Links open in a new tab.
          </p>
        </div>

        <div className="px-4 sm:px-6 py-4 space-y-3 flex-1">
          {POLICY_LINKS.map((policy) => (
            <label
              key={policy.id}
              className="flex gap-3 items-start p-3 rounded-xl border border-gray-200 active:bg-gray-50 cursor-pointer min-h-[48px] touch-manipulation"
            >
              <input
                type="checkbox"
                checked={checks[policy.id]}
                onChange={() => toggle(policy.id)}
                className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-800 leading-snug">
                I have read and agree to the{' '}
                <a
                  href={policy.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {policy.label}
                </a>
                .
              </span>
            </label>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-4 space-y-3 rounded-b-3xl sm:rounded-b-2xl">
          <button
            type="button"
            disabled={!allChecked || isSubmitting}
            onClick={() => void onAgree()}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[48px] transition-colors"
          >
            {isSubmitting ? 'Saving…' : 'I agree'}
          </button>
          <button
            type="button"
            onClick={onLogout}
            disabled={isSubmitting}
            className="w-full py-2.5 text-sm text-gray-600 hover:text-gray-900 min-h-[44px]"
          >
            Log out instead
          </button>
        </div>
      </div>
    </div>
  );
};
