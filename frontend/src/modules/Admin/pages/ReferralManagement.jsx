import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiUsers, FiDollarSign, FiSettings } from 'react-icons/fi';
import AdminLayout from '../components/Layout/AdminLayout';
import DataTable from '../components/DataTable';
import api from '../../../shared/utils/api';
import toast from 'react-hot-toast';

const ReferralManagement = () => {
    const [activeTab, setActiveTab] = useState('history');
    const [history, setHistory] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [settings, setSettings] = useState({ commissionType: 'flat', amount: 50 });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'history') {
                const res = await api.get('/admin/referrals');
                setHistory(res?.data?.data?.referrals || []);
            } else if (activeTab === 'transactions') {
                const res = await api.get('/admin/referrals/transactions');
                setTransactions(res?.data?.data?.transactions || []);
            } else if (activeTab === 'settings') {
                const res = await api.get('/admin/referrals/settings');
                setSettings({
                    commissionType: res?.data?.data?.commissionType || 'flat',
                    amount: res?.data?.data?.amount || 50,
                });
            }
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            await api.put('/admin/referrals/settings', settings);
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
        }
    };

    const historyColumns = [
        { key: 'referrerId', label: 'Referrer', render: (val) => val?.name || 'N/A' },
        { key: 'referredUserId', label: 'Referred User', render: (val) => val?.name || 'N/A' },
        { key: 'status', label: 'Status', render: (val) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                val === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
                {val}
            </span>
        )},
        { key: 'rewardAmount', label: 'Reward (₹)' },
        { key: 'createdAt', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    ];

    const transactionColumns = [
        { key: 'userId', label: 'User', render: (val) => val?.name || 'N/A' },
        { key: 'type', label: 'Type', render: (val) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                val === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
                {val}
            </span>
        )},
        { key: 'amount', label: 'Amount (₹)' },
        { key: 'description', label: 'Description' },
        { key: 'createdAt', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    ];

    return (
        <AdminLayout title="Referral Management">
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Referrals</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage referral history, wallet transactions, and settings.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto gap-4 border-b border-gray-200 mb-6 pb-2">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                            activeTab === 'history' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FiUsers /> History
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                            activeTab === 'transactions' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FiDollarSign /> Wallet Transactions
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                            activeTab === 'settings' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FiSettings /> Settings
                    </button>
                </div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'history' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <DataTable columns={historyColumns} data={history} loading={isLoading} />
                        </div>
                    )}

                    {activeTab === 'transactions' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <DataTable columns={transactionColumns} data={transactions} loading={isLoading} />
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-2xl">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Referral Commission Settings</h2>
                            <form onSubmit={handleSaveSettings} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Commission Type</label>
                                    <select
                                        value={settings.commissionType}
                                        onChange={(e) => setSettings({ ...settings, commissionType: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="flat">Flat Amount</option>
                                        <option value="percentage">Percentage</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Reward {settings.commissionType === 'flat' ? 'Amount (₹)' : 'Percentage (%)'}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={settings.amount}
                                        onChange={(e) => setSettings({ ...settings, amount: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <p className="mt-1 text-xs text-slate-500">
                                        This reward will be credited to the referrer's wallet when the referred user completes their first order.
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                                >
                                    <FiSave /> Save Settings
                                </button>
                            </form>
                        </div>
                    )}
                </motion.div>
            </div>
        </AdminLayout>
    );
};

export default ReferralManagement;
