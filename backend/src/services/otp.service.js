import crypto from 'crypto';
import { sendEmail } from './email.service.js';

/**
 * Generates a 6-digit OTP and sets expiry (10 minutes)
 * @param {Object} user - Mongoose user/vendor document
 * @param {string} type - Purpose label (for logging)
 */
export const sendOTP = async (user, type = 'verification') => {
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            to: user.email,
            subject: 'Kimaya Ayurveda - Verification Code',
            text: `Your verification code is ${otp}. It expires in 10 minutes.`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Kimaya Ayurveda</h1>
                </div>
                <div style="padding: 30px; text-align: center; color: #333333;">
                    <h2 style="margin-top: 0;">Verify Your Email Address</h2>
                    <p style="font-size: 16px; line-height: 1.5;">Thank you for registering with Kimaya Ayurveda. To complete your verification, please enter the following One-Time Password (OTP):</p>
                    <div style="margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #4CAF50; padding: 10px 20px; border: 2px dashed #4CAF50; border-radius: 4px; background-color: #f9fff9;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #666666; margin-bottom: 0;">This verification code will expire in 10 minutes.</p>
                </div>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #999999;">
                    <p style="margin: 0;">If you didn't request this email, please ignore it.</p>
                    <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Kimaya Ayurveda. All rights reserved.</p>
                </div>
            </div>`,
        });
    } catch (err) {
        // Keep auth flow working in environments where SMTP is not configured.
        console.warn(`[OTP] Email send failed for ${user.email}: ${err.message}`);
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[OTP] ${type} OTP generated for ${user.email}`);
        }
    }

    return otp;
};
