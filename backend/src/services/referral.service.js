import User from '../models/User.model.js';
import ReferralHistory from '../models/ReferralHistory.model.js';
import WalletTransaction from '../models/WalletTransaction.model.js';
import Settings from '../models/Settings.model.js';
import mongoose from 'mongoose';

export const processReferralReward = async (userId, orderId, orderSubtotal) => {
    // Check if the user has a pending referral
    const referral = await ReferralHistory.findOne({ referredUserId: userId, status: 'pending' });
    if (!referral) return;

    // Check if this is truly the first delivered order (just to be safe)
    // Assuming this function is only called when an order becomes 'Delivered'
    
    // Get referral settings
    let referralSettings = await Settings.findOne({ key: 'referral_settings' });
    let rewardAmount = 50; // Default flat amount 50
    let commissionType = 'flat'; // 'flat' or 'percentage'

    if (referralSettings && referralSettings.value) {
        commissionType = referralSettings.value.commissionType || 'flat';
        rewardAmount = Number(referralSettings.value.amount) || 50;
    }

    let calculatedReward = 0;
    if (commissionType === 'percentage') {
        calculatedReward = (orderSubtotal * rewardAmount) / 100;
    } else {
        calculatedReward = rewardAmount;
    }

    if (calculatedReward <= 0) return;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Mark referral as completed
        referral.status = 'completed';
        referral.rewardAmount = calculatedReward;
        referral.orderId = orderId;
        await referral.save({ session });

        // Credit referrer wallet
        await User.findByIdAndUpdate(
            referral.referrerId,
            { $inc: { walletBalance: calculatedReward } },
            { session }
        );

        // Create wallet transaction
        await WalletTransaction.create(
            [{
                userId: referral.referrerId,
                type: 'credit',
                amount: calculatedReward,
                description: 'Referral reward for user signup and first order',
                relatedModel: 'ReferralHistory',
                relatedId: referral._id
            }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error processing referral reward:', error);
    }
};
