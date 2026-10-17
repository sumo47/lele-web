'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  redirectPath?: string;
  mode?: 'login' | 'signup';
  onError?: (errorMessage: string) => void;
  className?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

/**
 * Sanitizes redirect URL to prevent open redirect vulnerabilities.
 * Allows only relative paths starting with a single forward slash.
 */
function getSafeRedirectPath(rawPath: string | undefined): string {
  if (!rawPath) return '/';
  // Disallow absolute URLs (http://, https://), protocol-relative (//), or backslashes (/\)
  if (rawPath.startsWith('/') && !rawPath.startsWith('//') && !rawPath.startsWith('/\\')) {
    return rawPath;
  }
  return '/';
}

export function GoogleSignInButton({
  redirectPath = '/',
  mode = 'login',
  onError,
  className = '',
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      const idToken = response?.credential;
      if (!idToken) {
        const msg = 'Google Sign-In was cancelled or did not return credentials.';
        setLocalError(msg);
        onError?.(msg);
        return;
      }

      setLoading(true);
      setLocalError(null);
      try {
        await loginWithGoogle(idToken);
        const safePath = getSafeRedirectPath(redirectPath);
        router.push(safePath);
      } catch (err: any) {
        const errorMsg =
          err?.message ||
          'Google authentication failed. Please try again or use email login.';
        setLocalError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [loginWithGoogle, redirectPath, router, onError]
  );

  // Load Google Identity Services SDK script safely
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script is already present
    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      if (window.google?.accounts?.id) {
        setScriptLoaded(true);
      } else {
        existingScript.addEventListener('load', () => setScriptLoaded(true));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      const msg = 'Failed to load Google Sign-In SDK. Check your internet connection or ad blocker.';
      setLocalError(msg);
      onError?.(msg);
    };
    document.head.appendChild(script);
  }, [onError]);

  const credentialCallbackRef = useRef(handleCredentialResponse);
  credentialCallbackRef.current = handleCredentialResponse;

  // Initialize GIS and render official Google button
  useEffect(() => {
    if (!scriptLoaded || !window.google?.accounts?.id || !buttonContainerRef.current) {
      return;
    }

    if (!clientId) {
      // Client ID is missing from environment
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res: any) => credentialCallbackRef.current(res),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Clear previous children before rendering
      buttonContainerRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: mode === 'signup' ? 'signup_with' : 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: buttonContainerRef.current.offsetWidth || 340,
      });
    } catch (err: any) {
      console.warn('[GoogleSignInButton] Failed to initialize Google button:', err);
    }
  }, [scriptLoaded, clientId, mode]);


  // Fallback click handler if clicked before GIS button mounts or if custom trigger is needed
  const handleFallbackClick = () => {
    if (!clientId) {
      const msg = 'Google Sign-In is not configured (missing NEXT_PUBLIC_GOOGLE_CLIENT_ID).';
      setLocalError(msg);
      onError?.(msg);
      return;
    }

    if (window.google?.accounts?.id) {
      setLocalError(null);
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason?.() || 'popup_blocked';
          if (reason === 'opt_out_or_no_session') {
            setLocalError('Please sign in to your Google Account in your browser.');
          } else {
            setLocalError('Google Sign-In prompt could not open. Please click the button again.');
          }
        }
      });
    }
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {localError && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
          <span>{localError}</span>
          <button
            type="button"
            onClick={() => setLocalError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      <div className="relative w-full">
        {/* Loading overlay when authenticating */}
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-xs rounded-xl flex items-center justify-center gap-2 border border-gray-200">
            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
            <span className="text-xs font-bold text-gray-700">Signing in with Google...</span>
          </div>
        )}

        {/* GIS Official Container */}
        <div
          ref={buttonContainerRef}
          className={`w-full min-h-[44px] flex justify-center [&>div]:w-full ${
            loading ? 'opacity-50 pointer-events-none' : ''
          }`}
        />

        {/* Polished Fallback Button (visible while script loads or if client_id is unconfigured) */}
        {(!scriptLoaded || !clientId) && (
          <button
            type="button"
            disabled={loading}
            onClick={handleFallbackClick}
            className="w-full h-[44px] px-4 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-300 rounded-xl flex items-center justify-center gap-3 transition shadow-xs text-xs font-bold text-gray-700 disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
