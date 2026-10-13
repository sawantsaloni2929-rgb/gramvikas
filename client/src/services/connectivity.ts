import { useState, useEffect } from 'react';

export interface ConnectivityState {
  isOnline: boolean;
  isBackendReachable: boolean;
  lastChecked: Date;
  checkConnection: () => Promise<boolean>;
}

export const checkBackendHealth = async (): Promise<boolean> => {
  if (!navigator.onLine) return false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('/api/health', {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
};

export const useConnectivity = (): ConnectivityState => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isBackendReachable, setIsBackendReachable] = useState<boolean>(navigator.onLine);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkConnection = async (): Promise<boolean> => {
    const reachable = await checkBackendHealth();
    setIsBackendReachable(reachable);
    setIsOnline(navigator.onLine && reachable);
    setLastChecked(new Date());
    return reachable;
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsBackendReachable(false);
      setLastChecked(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkConnection();

    // Low-resource friendly interval: 20 seconds
    const interval = setInterval(() => {
      if (navigator.onLine) {
        checkConnection();
      }
    }, 20000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    isBackendReachable,
    lastChecked,
    checkConnection,
  };
};
