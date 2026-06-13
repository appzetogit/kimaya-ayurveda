import mongoose from 'mongoose';

const referralHistorySchema = new mongoose.Schema(
    {
        referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending', index: true },
        rewardAmount: { type: Number, default: 0 },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    },
    { timestamps: true }
);

// Prevent duplicate referrals for the same referred user
referralHistorySchema.index({ referredUserId: 1 }, { unique: true });

const ReferralHistory = mongoose.model('ReferralHistory', referralHistorySchema);
export { ReferralHistory };
export default ReferralHistory;
