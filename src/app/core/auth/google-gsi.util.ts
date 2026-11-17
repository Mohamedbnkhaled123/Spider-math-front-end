export const SPIDER_GOOGLE_CLIENT_ID =
  '157492277386-n7dudqv4devn897v381bpvf8b101bi8s.apps.googleusercontent.com';

/**
 * Ensures the Google Identity Services (GIS) client script is loaded in browser context.
 */
export function ensureGoogleGsiScriptLoaded(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(false);
      return;
    }
    const win = window as any;
    if (win.google?.accounts?.oauth2) {
      resolve(true);
      return;
    }

    let script = document.querySelector('script[src*="accounts.google.com/gsi/client"]') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    let waitedMs = 0;
    const interval = setInterval(() => {
      waitedMs += 100;
      if (win.google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve(true);
      } else if (waitedMs >= 4000) {
        clearInterval(interval);
        resolve(false);
      }
    }, 100);
  });
}
