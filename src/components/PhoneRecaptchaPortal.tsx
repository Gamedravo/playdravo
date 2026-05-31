import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clearRecaptchaVerifier } from '../lib/phoneAuth';

interface PhoneRecaptchaPortalProps {
  active: boolean;
}

/**
 * Mounts the invisible reCAPTCHA container on document.body (outside modal overflow:hidden).
 * Required for Firebase Phone Auth — iframe must not be clipped by modal CSS.
 */
export function PhoneRecaptchaPortal({ active }: PhoneRecaptchaPortalProps) {
  useEffect(() => {
    return () => {
      clearRecaptchaVerifier();
    };
  }, [active]);

  if (!active || typeof document === 'undefined') return null;

  return createPortal(
    <div
      id="recaptcha-container"
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '1px',
        height: '1px',
        overflow: 'visible',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />,
    document.body
  );
}
