const THEME_KEY = 'zencart-theme';
const RECENT_PRODUCTS_KEY = 'zencart-recent-products';

export const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
};

export const setTheme = (theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
};

// Register the service worker so the storefront can work offline and install like an app.
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
};

export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return null;

  const registration = await navigator.serviceWorker.ready;
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidPublicKey ? urlBase64ToUint8Array(vapidPublicKey) : undefined,
  });

  return subscription;
};

export const showAppNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const payload = {
    body: options.body || 'A new update is ready for you.',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    ...options,
  };

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => registration.showNotification(title, payload));
  } else {
    new Notification(title, payload);
  }
};

export const trackRecentlyViewedProduct = (product) => {
  if (!product?.id) return;
  const raw = localStorage.getItem(RECENT_PRODUCTS_KEY);
  const current = raw ? JSON.parse(raw) : [];
  const next = [
    { id: product.id, name: product.name, price: product.price, image: product.primary_image || product.image_url || '' },
    ...current.filter((item) => item.id !== product.id),
  ].slice(0, 6);
  localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(next));
};

export const getRecentlyViewedProducts = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_PRODUCTS_KEY) || '[]');
  } catch {
    return [];
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
