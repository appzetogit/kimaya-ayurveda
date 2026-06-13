import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import ReferralHistory from '../../../models/ReferralHistory.model.js';
import WalletTransaction from '../../../models/WalletTransaction.model.js';
import Settings from '../../../models/Settings.model.js';
import User from '../../../models/User.model.js';

// GET /api/admin/referrals
export const getReferrals = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 20;
    const skip = (numericPage - 1) * numericLimit;

    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const [referrals, total] = await Promise.all([
        ReferralHistory.find(filter)
            .populate('referrerId', 'name email phone referralCode')
            .populate('referredUserId', 'name email phone')
            .populate('orderId', 'orderId total')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        ReferralHistory.countDocuments(filter),
    ]);

    res.status(200).json(new ApiResponse(200, {
        referrals,
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit),
    }, 'Referrals fetched.'));
});

// GET /api/admin/referrals/transactions
export const getWalletTransactions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 20;
    const skip = (numericPage - 1) * numericLimit;

    const [transactions, total] = await Promise.all([
        WalletTransaction.find()
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        WalletTransaction.countDocuments(),
    ]);

    res.status(200).json(new ApiResponse(200, {
        transactions,
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit),
    }, 'Transactions fetched.'));
});

// GET /api/admin/referrals/settings
export const getReferralSettings = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne({ key: 'referral_settings' });
    if (!settings) {
        settings = await Settings.create({
            key: 'referral_settings',
            value: {
                commissionType: 'flat',
                amount: 50
            }
        });
    }
    res.status(200).json(new ApiResponse(200, settings.value, 'Settings fetched.'));
});

// PUT /api/admin/referrals/settings
export const updateReferralSettings = asyncHandler(async (req, res) => {
    const { commissionType, amount } = req.body;
    if (!commissionType || !amount) {
        throw new ApiError(400, 'commissionType and amount are required.');
    }
    
    let settings = await Settings.findOneAndUpdate(
        { key: 'referral_settings' },
        { value: { commissionType, amount: Number(amount) } },
        { new: true, upsert: true }
    );
    res.status(200).json(new ApiResponse(200, settings.value, 'Settings updated.'));
});
