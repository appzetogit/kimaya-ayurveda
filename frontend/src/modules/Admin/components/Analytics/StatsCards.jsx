import { FiShoppingBag, FiPackage, FiUsers, FiArrowRight } from 'react-icons/fi';
import { IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../../../shared/utils/helpers';

const StatsCards = ({ stats, period = 'month' }) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue || 0),
      change: stats.revenueChange,
      icon: IndianRupee,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
      cardBg: 'bg-gradient-to-br from-green-50 to-emerald-50 hover:bg-green-100',
      iconBg: 'bg-white/20',
      link: `/admin/reports/sales-report?period=${period}`
    },
    {
      title: 'Total Orders',
      value: (stats.totalOrders || 0).toLocaleString(),
      change: stats.ordersChange,
      icon: FiShoppingBag,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      cardBg: 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:bg-blue-100',
      iconBg: 'bg-white/20',
      link: '/admin/orders'
    },
    {
      title: 'Total Products',
      value: (stats.totalProducts || 0).toLocaleString(),
      change: stats.productsChange,
      icon: FiPackage,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-purple-500 to-violet-600',
      cardBg: 'bg-gradient-to-br from-purple-50 to-violet-50 hover:bg-purple-100',
      iconBg: 'bg-white/20',
      link: '/admin/products'
    },
    {
      title: 'Total Customers',
      value: (stats.totalCustomers || 0).toLocaleString(),
      change: stats.customersChange,
      icon: FiUsers,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-orange-500 to-amber-600',
      cardBg: 'bg-gradient-to-br from-orange-50 to-amber-50 hover:bg-orange-100',
      iconBg: 'bg-white/20',
      link: '/admin/customers'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const hasChange = Number.isFinite(card.change);
        const isPositive = hasChange ? card.change >= 0 : false;

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(card.link)}
            className={`${card.cardBg} rounded-xl p-4 sm:p-6 shadow-md border-2 border-transparent hover:shadow-lg transition-all duration-300 relative overflow-hidden cursor-pointer group`}
          >
            {/* Decorative gradient overlay */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.bgColor} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500`}></div>

            <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10">
              <div className={`${card.bgColor} ${card.iconBg} p-2 sm:p-3 rounded-lg shadow-md`}>
                <Icon className={`${card.color} text-lg sm:text-xl`} />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-gray-800 text-xl sm:text-2xl font-bold">{card.value}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatsCards;

