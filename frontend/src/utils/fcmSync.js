import { messaging, getToken } from '../firebase';
import api from '../shared/utils/api.js';

/**
 * Request notification permission, retrieve FCM token, and send it to the backend.
 * @param {string} roleEndpoint - The endpoint prefix for the role (e.g. '/api/user/fcm-token', '/api/vendor/fcm-token')
 * @param {string} platform - 'web' or 'app'
 */
export const syncFcmToken = async (roleEndpoint, platform = 'web') => {
  if (!messaging) {
    console.warn('Firebase Messaging not supported in this environment.');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      const currentToken = await getToken(messaging, { 
        // VAPID key is optional for standard Firebase projects but recommended if you have one.
        // vapidKey: 'YOUR_VAPID_KEY_HERE' 
      });

      if (currentToken) {
        console.log('FCM Token received successfully:', currentToken);
        
        // Send the token to your server
        try {
          const response = await api.post(roleEndpoint, {
            token: currentToken,
            platform: platform
          });
          console.log(`[FCM Sync] Token saved successfully to ${roleEndpoint}:`, response.data);
        } catch (apiError) {
          console.error(`[FCM Sync] Failed to save token to ${roleEndpoint}:`, apiError);
        }
      } else {
        console.warn('No registration token available. Request permission to generate one.');
      }
    } else {
      console.warn('Notification permission denied.');
    }
  } catch (error) {
    console.error('Error retrieving or syncing FCM token:', error);
  }
};
