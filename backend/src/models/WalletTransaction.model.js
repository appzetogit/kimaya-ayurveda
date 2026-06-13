import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: { type: String, enum: ['credit', 'debit'], required: true },
        amount: { type: Number, required: true },
        description: { type: String, required: true },
        relatedModel: { type: String, enum: ['ReferralHistory', 'Order', 'Admin'], default: null },
        relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
        status: { type: String, enum: ['completed', 'failed', 'pending'], default: 'completed' },
    },
    { timestamps: true }
);

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
export { WalletTransaction };
export default WalletTransaction;
