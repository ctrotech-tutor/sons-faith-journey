import React from 'react';

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered:', this.registration);
      return true;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      return null;
    }

    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Error getting push subscription:', error);
      return null;
    }
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      return null;
    }

    try {
      // For demo purposes, using a dummy VAPID key
      // In production, you would use your actual VAPID keys
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'BCEwP3HGLKb7w8ArF3BK_PBvNZDcGTc_7fQQGQR4s3j3KTRhFcjnuNdQGtHbVNS8-sG8GXRdTCvgQKNBE5z8k2Y'
        )
      });

      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Error creating push subscription:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    const subscription = await this.getSubscription();
    if (!subscription) {
      return true;
    }

    try {
      const result = await subscription.unsubscribe();
      console.log('Push subscription cancelled:', result);
      return result;
    } catch (error) {
      console.error('Error cancelling push subscription:', error);
      return false;
    }
  }

  async showNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      // Fallback to browser notification
      if (Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icons/android-chrome-192x192.png',
          badge: payload.badge || '/icons/favicon-32x32.png',
          tag: payload.tag,
          data: payload.data
        });
      }
      return;
    }

    try {
      await this.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/android-chrome-192x192.png',
        badge: payload.badge || '/icons/favicon-32x32.png',
        tag: payload.tag,
        data: payload.data,
        requireInteraction: false
      });
    } catch (error) {
      console.error('Error showing notification:', error);
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

  // Send notification to all subscribers when a new post is created
  async notifyNewPost(postData: {
    authorName: string;
    content: string;
    postId: string;
  }): Promise<void> {
    // In a real app, this would be handled by your backend
    // For demo purposes, we'll just show a local notification
    await this.showNotification({
      title: `New post by ${postData.authorName}`,
      body: postData.content.substring(0, 100) + (postData.content.length > 100 ? '...' : ''),
      icon: '/icons/android-chrome-192x192.png',
      tag: `post-${postData.postId}`,
      data: {
        type: 'new-post',
        postId: postData.postId
      }
    });
  }

  // Send notification for new comments
  async notifyNewComment(commentData: {
    authorName: string;
    content: string;
    postId: string;
  }): Promise<void> {
    await this.showNotification({
      title: `New comment by ${commentData.authorName}`,
      body: commentData.content.substring(0, 100) + (commentData.content.length > 100 ? '...' : ''),
      icon: '/icons/android-chrome-192x192.png',
      tag: `comment-${commentData.postId}`,
      data: {
        type: 'new-comment',
        postId: commentData.postId
      }
    });
  }
}

export const pushNotificationService = new PushNotificationService();

// Hook for using push notifications in React components
export const usePushNotifications = () => {
  const [permission, setPermission] = React.useState<NotificationPermission>('default');
  const [subscription, setSubscription] = React.useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = React.useState(false);

  React.useEffect(() => {
    const checkSupport = async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        const currentSubscription = await pushNotificationService.getSubscription();
        setSubscription(currentSubscription);
      }
    };

    checkSupport();
  }, []);

  const requestPermission = async () => {
    const newPermission = await pushNotificationService.requestPermission();
    setPermission(newPermission);
    return newPermission;
  };

  const subscribe = async () => {
    const newSubscription = await pushNotificationService.subscribe();
    setSubscription(newSubscription);
    return newSubscription;
  };

  const unsubscribe = async () => {
    const result = await pushNotificationService.unsubscribe();
    if (result) {
      setSubscription(null);
    }
    return result;
  };

  return {
    permission,
    subscription,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification: pushNotificationService.showNotification.bind(pushNotificationService)
  };
};

export default pushNotificationService;