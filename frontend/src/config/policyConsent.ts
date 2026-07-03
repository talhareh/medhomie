/**
 * Must match backend `POLICY_CONSENT_VERSION` in `authController.ts`.
 * Bump both when policies materially change and students must re-accept.
 */
export const POLICY_CONSENT_VERSION = '2026-04-18-v1';

export const POLICY_LINKS = [
  {
    id: 'refund',
    label: 'Refund policy',
    url: 'https://medhome.courses/refund-poliicy/',
  },
  {
    id: 'terms',
    label: 'Terms and conditions',
    url: 'https://medhome.courses/terms-and-conditions/',
  },
  {
    id: 'copyright',
    label: 'Copyright policy',
    url: 'https://medhome.courses/copyright-policy/',
  },
  {
    id: 'privacy',
    label: 'Privacy policy',
    url: 'https://medhome.courses/privacy-policy-2/',
  },
] as const;
