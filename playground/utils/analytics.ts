/**
 * Simple analytics utility with fallback handling for blocked requests
 * Based on Mixpanel's official documentation for handling blocked analytics:
 * https://developer.mixpanel.com/docs/privacy-controls
 */

// Track if analytics are blocked
let analyticsBlocked = false;

// Check if code is running in browser
const isBrowser = typeof window !== 'undefined';

// Detect if analytics are blocked (will be true if any request fails)
const checkIfAnalyticsBlocked = async (): Promise<boolean> => {
  if (!isBrowser) return false;
  
  try {
    // Try to make a HEAD request to Mixpanel to see if it's blocked
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    
    const response = await fetch('https://api-js.mixpanel.com/ping', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return false; // Not blocked
  } catch (error: unknown) {
    console.debug('Analytics are likely blocked by browser extensions');
    return true; // Blocked or timed out
  }
};

// Initialize analytics check
if (isBrowser) {
  (async () => {
    analyticsBlocked = await checkIfAnalyticsBlocked();
  })();
}

/**
 * Safe analytics event tracking that won't cause console errors
 * @param eventName Event to track
 * @param properties Event properties
 */
export const trackEvent = (eventName: string, properties: Record<string, any> = {}): void => {
  // Don't try to track if not in browser or if analytics are blocked
  if (!isBrowser || analyticsBlocked) {
    return;
  }

  try {
    // Check if window.mixpanel exists (could be added by a third-party script)
    if ((window as any).mixpanel) {
      (window as any).mixpanel.track(eventName, properties);
    }
  } catch (error: unknown) {
    // Silently fail so it doesn't affect user experience
    analyticsBlocked = true;
    console.debug('Analytics tracking disabled due to error');
  }
};

/**
 * Safely disable analytics tracking
 */
export const disableAnalytics = (): void => {
  analyticsBlocked = true;
  
  // Additionally try to opt-out if mixpanel exists
  if (!isBrowser) return;
  
  try {
    if ((window as any).mixpanel) {
      (window as any).mixpanel.opt_out_tracking();
    }
  } catch (error: unknown) {
    // Silently fail
  }
};

export default {
  trackEvent,
  disableAnalytics
};
