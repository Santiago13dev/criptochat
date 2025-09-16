export class NotificationManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  
  async init() {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
    
    // Request permission
    const permission = await this.requestPermission();
    return permission === 'granted';
  }
  
  async requestPermission(): Promise<NotificationPermission> {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }
  
  async showNotification(title: string, options?: NotificationOptions) {
    if (Notification.permission !== 'granted') {
      console.log('Notifications not permitted');
      return;
    }
    
    // If app is in background, use service worker
    if (this.swRegistration && !document.hasFocus()) {
      await this.swRegistration.showNotification(title, {
        body: options?.body || 'Nuevo mensaje',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        tag: 'criptochat-message',
        renotify: true,
        ...options
      });
    } else if (document.hasFocus()) {
      // If app is in foreground, show in-app notification
      this.showInAppNotification(title, options?.body || '');
    }
  }
  
  private showInAppNotification(title: string, body: string) {
    // Create a toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-purple-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in';
    toast.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        <div>
          <div class="font-semibold">${title}</div>
          <div class="text-sm opacity-90">${body}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
  
  async subscribeToPush(serverPublicKey: string) {
    if (!this.swRegistration) {
      console.error('Service Worker not registered');
      return null;
    }
    
    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(serverPublicKey)
      });
      
      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      return null;
    }
  }
  
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const notificationManager = new NotificationManager();