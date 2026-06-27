import { User } from '../models/User.model.js';
import { Vendor } from '../models/Vendor.model.js';
import DeliveryBoy from '../models/DeliveryBoy.model.js';
import Admin from '../models/Admin.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Save FCM token for push notifications
 * Expected body: { token: string, platform: 'web' | 'app' }
 */
export const saveFcmToken = asyncHandler(async (req, res) => {
    const { token, platform } = req.body;
    const { id, role } = req.user;

    if (!token || !platform) {
        throw new ApiError(400, 'Token and platform are required.');
    }

    if (!['web', 'app', 'android', 'ios'].includes(platform)) {
        throw new ApiError(400, 'Invalid platform. Must be "web", "app", "android", or "ios".');
    }

    const updateField = platform === 'web' ? { fcmToken: token } : { fcmtokenMobile: token };

    let updated = false;

    if (role === 'customer' || role === 'user') {
        const user = await User.findByIdAndUpdate(id, updateField, { new: true });
        if (user) updated = true;
    } else if (role === 'vendor') {
        const vendor = await Vendor.findByIdAndUpdate(id, updateField, { new: true });
        if (vendor) updated = true;
    } else if (role === 'delivery') {
        const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(id, updateField, { new: true });
        if (deliveryBoy) updated = true;
    } else if (role === 'admin') {
        // Admin might not have fcmtoken fields yet, but we'll try updating it anyway or skip it safely.
        try {
            const admin = await Admin.findByIdAndUpdate(id, updateField, { new: true });
            if (admin) updated = true;
        } catch (e) {
            updated = false;
        }
    }

    if (!updated) {
        throw new ApiError(404, 'User not found or role invalid.');
    }

    console.log(`[FCM] Token saved successfully for ${role} with ID: ${id} on platform: ${platform}`);

    res.status(200).json({
        success: true,
        message: 'FCM token saved successfully.',
    });
});
