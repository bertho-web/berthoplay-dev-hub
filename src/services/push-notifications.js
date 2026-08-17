// ============================================================================
// 🎮 BERTHOPLAY — GESTIONNAIRE DE NOTIFICATIONS PUSH & PWA BADGES
// ============================================================================

export class BerthoPushNotifications {
  
  // 🔔 DEMANDE DE PERMISSION SYSTÈME NATIVE
  static async requestPermission() {
    if (!('Notification' in window)) {
      return { success: false, error: "Notifications non supportées par ce navigateur." };
    }
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        return { success: true };
      } else {
        return { success: false, error: "Permission de notification refusée." };
      }
    } catch (e) {
      return { success: false, error: "Erreur lors de la demande de notification." };
    }
  }
  
  // 🔴 METTRE À JOUR LE BADGE ROUGE SUR L'ICÔNE PWA
  static setAppBadge(count = 1) {
    if ('setAppBadge' in navigator) {
      try {
        if (count > 0) {
          navigator.setAppBadge(count);
        } else {
          navigator.clearAppBadge();
        }
      } catch (e) {}
    }
  }
  
  // 📢 AFFICHER UNE NOTIFICATION SYSTÈME
  static async showNotification(title, message, targetUrl = '/') {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }
    
    try {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, {
        body: message,
        icon: '/public/logo.png',
        badge: '/public/logo.png',
        vibrate: [100, 50, 100],
        data: { url: targetUrl }
      });
    } catch (e) {
      new Notification(title, {
        body: message,
        icon: '/public/logo.png'
      });
    }
  }
}