import { admin, isFirebaseInitialized } from '../config/firebase.js';
import Notification from '../models/Notification.model.js'; // Assuming you have a general Notification model to store in DB too

/**
 * Send push notification using Firebase Cloud Messaging
 * @param {Object} options
 * @param {Array<string>} options.fcmTokens - Array of web FCM tokens
 * @param {Array<string>} options.fcmTokensMobile - Array of mobile FCM tokens
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {Object} options.data - Additional data payload (optional)
 * @param {string} options.logoUrl - Logo URL for notification (optional)
 */
export const sendPushNotification = async ({ fcmTokens = [], fcmTokensMobile = [], title, body, data = {}, logoUrl = '' }) => {
    if (!isFirebaseInitialized) {
        console.warn('Firebase is not initialized. Cannot send push notification.');
        return;
    }

    // Clean up empty or falsy tokens
    const validWebTokens = fcmTokens.filter(t => t);
    const validMobileTokens = fcmTokensMobile.filter(t => t);
    
    // Combine to unique tokens to prevent duplicate pushes if same token is accidentally in both
    const allTokens = [...new Set([...validWebTokens, ...validMobileTokens])];

    if (allTokens.length === 0) {
        console.log('No valid FCM tokens provided. Skipping push notification.');
        return;
    }

    const message = {
        notification: {
            title,
            body,
            ...(logoUrl ? { image: logoUrl } : {})
        },
        data: {
            ...data,
            click_action: "FLUTTER_NOTIFICATION_CLICK" // Common for cross-platform
        },
        tokens: allTokens,
        android: {
            notification: {
                icon: 'stock_ticker_update',
                color: '#7e55c3',
                sound: 'default'
            }
        },
        apns: {
            payload: {
                aps: {
                    sound: 'default'
                }
            }
        },
        webpush: {
            notification: {
                icon: logoUrl || '/logo.jpeg',
            }
        }
    };

    try {
        const response = await admin.messaging().sendMulticast(message);
        console.log(`Successfully sent message to ${response.successCount} devices`);
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(allTokens[idx]);
                    console.error(`Failed to send to token ${allTokens[idx]}:`, resp.error);
                    // You might want to remove these invalid tokens from the database here
                }
            });
            console.log('Failed tokens:', failedTokens);
        }
        return response;
    } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
};
