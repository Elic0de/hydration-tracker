// PWA utilities for Hydration Tracker

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export interface PWAInstallInfo {
  canInstall: boolean;
  isInstalled: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

// Service Worker registration
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator && typeof window !== 'undefined') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('ServiceWorker registered successfully:', registration);
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (confirm('新しいバージョンが利用可能です。更新しますか？')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
      return null;
    }
  }
  return null;
};

// PWA install prompt handling
export const initPWAInstall = (): void => {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    console.log('PWA install prompt available');
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });
  
  // Handle successful install
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
};

// Show PWA install prompt
export const showPWAInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    console.log('PWA install prompt not available');
    return false;
  }
  
  try {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`PWA install prompt outcome: ${outcome}`);
    
    // Reset the deferred prompt
    deferredPrompt = null;
    
    return outcome === 'accepted';
  } catch (error) {
    console.error('Error showing PWA install prompt:', error);
    return false;
  }
};

// Get PWA install information
export const getPWAInstallInfo = (): PWAInstallInfo => {
  if (typeof window === 'undefined') {
    return {
      canInstall: false,
      isInstalled: false,
      platform: 'unknown'
    };
  }
  
  // Check if running as PWA
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                     (window.navigator as any).standalone ||
                     document.referrer.includes('android-app://');
  
  // Detect platform
  let platform: PWAInstallInfo['platform'] = 'unknown';
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    platform = 'ios';
  } else if (/android/.test(userAgent)) {
    platform = 'android';
  } else if (!/mobile/.test(userAgent)) {
    platform = 'desktop';
  }
  
  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    platform
  };
};

// Check if device supports PWA features
export const checkPWASupport = (): {
  serviceWorker: boolean;
  notifications: boolean;
  installPrompt: boolean;
  offlineStorage: boolean;
} => {
  if (typeof window === 'undefined') {
    return {
      serviceWorker: false,
      notifications: false,
      installPrompt: false,
      offlineStorage: false
    };
  }
  
  return {
    serviceWorker: 'serviceWorker' in navigator,
    notifications: 'Notification' in window,
    installPrompt: 'BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window,
    offlineStorage: 'localStorage' in window && 'indexedDB' in window
  };
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return 'denied';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  
  // Request permission
  const permission = await Notification.requestPermission();
  console.log('Notification permission:', permission);
  
  return permission;
};

// Show local notification
export const showLocalNotification = (title: string, options?: NotificationOptions): void => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.log('Notifications not available or not permitted');
    return;
  }
  
  const defaultOptions: NotificationOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'hydration-reminder',
    requireInteraction: false,
    silent: false,
    ...options
  };
  
  const notification = new Notification(title, defaultOptions);
  
  // Auto-close after 10 seconds
  setTimeout(() => {
    notification.close();
  }, 10000);
  
  // Handle click
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
};

// Schedule recurring notifications
export const scheduleRecurringNotifications = (
  intervalMinutes: number,
  startTime: string,
  endTime: string,
  enabled: boolean
): (() => void) => {
  let intervalId: NodeJS.Timeout | null = null;
  
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
  
  if (!enabled) {
    stop();
    return stop;
  }
  
  const checkAndNotify = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    // Check if current time is within the allowed range
    if (currentTime >= startTime && currentTime <= endTime) {
      showLocalNotification('💧 水分補給の時間です！', {
        body: '健康的な水分補給習慣を続けましょう',
        data: { action: 'hydration-reminder' }
      });
    }
  };
  
  // Set up recurring notifications
  intervalId = setInterval(checkAndNotify, intervalMinutes * 60 * 1000);
  
  return stop;
};

// Background sync for offline data
export const scheduleBackgroundSync = (tag: string): void => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then(registration => {
      return registration.sync.register(tag);
    }).then(() => {
      console.log('Background sync registered:', tag);
    }).catch(error => {
      console.error('Background sync registration failed:', error);
    });
  }
};

// Update app data when online
export const syncWhenOnline = (callback: () => void): (() => void) => {
  const handleOnline = () => {
    console.log('App is back online, syncing data...');
    callback();
  };
  
  window.addEventListener('online', handleOnline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
  };
};

// Get connection status
export const getConnectionStatus = (): {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} => {
  if (typeof window === 'undefined') {
    return { isOnline: true };
  }
  
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  return {
    isOnline: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt
  };
};

// Initialize PWA features
export const initPWA = async (): Promise<void> => {
  console.log('Initializing PWA features...');
  
  // Register service worker
  await registerServiceWorker();
  
  // Initialize install prompt
  initPWAInstall();
  
  // Check PWA support
  const support = checkPWASupport();
  console.log('PWA support:', support);
  
  // Check install info
  const installInfo = getPWAInstallInfo();
  console.log('PWA install info:', installInfo);
};

// Type definitions for better TypeScript support
declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
  }
  
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
    'pwa-install-available': CustomEvent;
    'pwa-installed': CustomEvent;
  }
}