/* gestiona las notificaciones del navegador y muestra notificaciones en la aplicación si el navegador no admite notificaciones nativas.. */
export class NotificationManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  
  async init() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
    
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
      this.showInAppNotification(title, options?.body || '');
    }
  }
  
  private showInAppNotification(title: string, body: string) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-purple-600 text-white px-6 py-4 rounded-lg shadow-lg z-50';
    toast.innerHTML = `
      <div class="flex items-center space-x-3">
        <div>
          <div class="font-semibold">${title}</div>
          <div class="text-sm opacity-90">${body}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
}

export const notificationManager = new NotificationManager();