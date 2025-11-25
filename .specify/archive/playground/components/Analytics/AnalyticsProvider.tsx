"use client";

import React, { useEffect } from 'react';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Analytics Provider Component
 * 
 * Handles global error catching for analytics errors
 * Based on official Next.js error handling patterns
 * https://nextjs.org/docs/advanced-features/error-handling
 */
const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  useEffect(() => {
    // Global error handling for third-party analytics scripts
    const originalOnError = window.onerror;
    
    window.onerror = function(message, source, lineno, colno, error) {
      // Check if error is related to analytics/tracking
      const errorString = message?.toString().toLowerCase() || '';
      const sourceString = source?.toString().toLowerCase() || '';
      
      const isAnalyticsError = 
        errorString.includes('mixpanel') || 
        sourceString.includes('mixpanel') ||
        sourceString.includes('analytics') ||
        sourceString.includes('tracking');
        
      // Suppress analytics errors from console
      if (isAnalyticsError) {
        console.debug('Suppressed analytics error:', { message, source });
        return true; // Prevents the error from showing in console
      }
      
      // Fall back to default handler for other errors
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      
      return false;
    };

    return () => {
      // Restore original handler on cleanup
      window.onerror = originalOnError;
    };
  }, []);

  return <>{children}</>;
};

export default AnalyticsProvider;
