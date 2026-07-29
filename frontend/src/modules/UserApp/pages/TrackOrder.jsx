import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiPackage, FiTruck, FiMapPin, FiArrowLeft } from 'react-icons/fi';
import MobileLayout from "../components/Layout/MobileLayout";
import { useOrderStore } from '../../../shared/store/orderStore';
import { formatPrice } from '../../../shared/utils/helpers';
import { formatVariantLabel } from '../../../shared/utils/variant';
import PageTransition from '../../../shared/components/PageTransition';
import Badge from '../../../shared/components/Badge';
import LazyImage from '../../../shared/components/LazyImage';
import { useAuthStore } from '../../../shared/store/authStore';

const MobileTrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrder, fetchOrderById, fetchPublicTrackingOrder, fetchOrderTrackingDetails, lastError } = useOrderStore();
  const { user } = useAuthStore();
  const [isResolving, setIsResolving] = useState(true);
  const [liveTracking, setLiveTracking] = useState(null);
  const order = getOrder(orderId);
  const shippingAddress = order?.shippingAddress || {};
  const orderItems = Array.isArray(order?.items) ? order.items : [];
  const normalizedStatus = String(order?.status || 'pending').toLowerCase();
  const displayOrderId = order?.id || order?.orderId || orderId;
  const hasShippingAddress = Boolean(
    shippingAddress?.name ||
    shippingAddress?.address ||
    shippingAddress?.city ||
    shippingAddress?.state ||
    shippingAddress?.zipCode
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      let resolvedOrder = order;
      if (!order && orderId) {
        resolvedOrder = await fetchOrderById(orderId);
        if (!resolvedOrder) {
          resolvedOrder = await fetchPublicTrackingOrder(orderId);
        }
      }
      
      // Fetch live tracking details from Shiprocket
      if (resolvedOrder) {
        const trackingData = await fetchOrderTrackingDetails(resolvedOrder.id || resolvedOrder.orderId);
        if (mounted && trackingData && Array.isArray(trackingData)) {
            setLiveTracking(trackingData);
        }
      }

      if (mounted) setIsResolving(false);
    })();
    return () => {
      mounted = false;
    };
  }, [order, orderId, fetchOrderById, fetchPublicTrackingOrder]);

  useEffect(() => {
    if (!isResolving && !order) {
      navigate(user?.id ? '/orders' : '/home');
    }
  }, [isResolving, order, navigate, user?.id]);

  if (isResolving) {
    return (
      <PageTransition>
        <MobileLayout showBottomNav={false} showCartBar={false}>
          <div className="flex items-center justify-center min-h-[60vh] px-4">
            <p className="text-gray-600">Loading order...</p>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  if (!order) {
    return (
      <PageTransition>
        <MobileLayout showBottomNav={false} showCartBar={false}>
          <div className="flex items-center justify-center min-h-[60vh] px-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Not Found</h2>
              {lastError ? (
                <p className="text-sm text-gray-500 mb-4">{lastError}</p>
              ) : null}
              <button
                onClick={() => navigate(user?.id ? '/orders' : '/home')}
                className="gradient-green text-white px-6 py-3 rounded-xl font-semibold"
              >
                {user?.id ? 'Back to Orders' : 'Go Home'}
              </button>
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTrackingSteps = () => {
    const isCancelled = normalizedStatus === 'cancelled';
    const isReturned = normalizedStatus === 'returned';
    const isProcessingOrLater = ['processing', 'shipped', 'delivered', 'returned'].includes(normalizedStatus);
    const isShippedOrLater = ['shipped', 'delivered', 'returned'].includes(normalizedStatus);
    const isDelivered = normalizedStatus === 'delivered';

    const steps = [
      {
        label: 'Order Placed',
        completed: true,
        date: order?.date || order?.createdAt,
        icon: FiCheckCircle,
      },
      {
        label: 'Processing',
        completed: !isCancelled && isProcessingOrLater,
        date: order?.processingAt || null,
        icon: FiPackage,
      },
      {
        label: 'Shipped',
        completed: !isCancelled && isShippedOrLater,
        date: order?.shippedAt || null,
        icon: FiTruck,
      },
      {
        label: 'Delivered',
        completed: isDelivered,
        date: isDelivered ? (order?.deliveredAt || order?.estimatedDelivery) : null,
        icon: FiCheckCircle,
      },
    ];

    if (isCancelled || isReturned) {
      steps.push({
        label: isCancelled ? 'Cancelled' : 'Returned',
        completed: true,
        date: order?.cancelledAt || order?.returnedAt || order?.updatedAt || order?.date || order?.createdAt,
        icon: FiClock,
      });
    }
    return steps;
  };

  const steps = getTrackingSteps();

  return (
    <PageTransition>
      <MobileLayout showBottomNav={false} showCartBar={true}>
          <div className="w-full pb-24">
            {/* Header */}
            <div className="px-4 py-4 bg-white border-b border-gray-200 sticky top-1 z-30">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiArrowLeft className="text-xl text-gray-700" />
                </button>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-800">Track Order</h1>
                  <p className="text-sm text-gray-600">Order #{displayOrderId}</p>
                </div>
                <Badge variant={normalizedStatus}>{normalizedStatus.toUpperCase()}</Badge>
              </div>
            </div>

            <div className="px-4 py-4 space-y-4">
              {/* Tracking Timeline */}
              <div className="glass-card rounded-2xl p-4">
                <h2 className="text-base font-bold text-gray-800 mb-4">Order Status</h2>
                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${step.completed
                          ? 'gradient-green text-white'
                          : 'bg-gray-200 text-gray-500'
                          }`}>
                          <Icon className="text-lg" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold text-sm mb-1 ${step.completed ? 'text-gray-800' : 'text-gray-500'
                            }`}>
                            {step.label}
                          </h3>
                          <p className="text-xs text-gray-500">{formatDate(step.date)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Shiprocket Tracking */}
              {liveTracking && liveTracking.length > 0 && (
                <div className="space-y-4">
                  {liveTracking.map((shipment, idx) => (
                    <div key={idx} className="glass-card rounded-2xl p-4">
                      <h2 className="text-base font-bold text-gray-800 mb-2">Live Tracking: {shipment.vendorName || "Shipment"}</h2>
                      {shipment.error ? (
                        <p className="text-sm text-red-500">{shipment.error}</p>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600 mb-3">
                            <span className="font-semibold text-gray-800">AWB Code:</span> {shipment.awbCode}
                            <br />
                            <span className="font-semibold text-gray-800">Status:</span> {shipment.tracking?.tracking_data?.track_status === 1 ? 'Delivered' : shipment.tracking?.tracking_data?.track_url ? 'In Transit' : 'Pending'}
                          </p>
                          
                          {shipment.tracking?.tracking_data?.shipment_track_activities && shipment.tracking.tracking_data.shipment_track_activities.length > 0 ? (
                            <div className="space-y-3 mt-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                              {shipment.tracking.tracking_data.shipment_track_activities.map((activity, aIdx) => (
                                <div key={aIdx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-primary-500 group-[.is-active]:text-white text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                    <FiCheckCircle className="text-lg" />
                                  </div>
                                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                      <div className="font-bold text-slate-800 text-sm">{activity.activity}</div>
                                      <time className="text-xs font-medium text-primary-500">{formatDate(activity.date)}</time>
                                    </div>
                                    <div className="text-slate-600 text-xs">{activity.location}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No detailed tracking activities available yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="glass-card rounded-2xl p-4">
                  <h2 className="text-base font-bold text-gray-800 mb-2">Tracking Number</h2>
                  <p className="text-lg font-bold text-primary-600">{order.trackingNumber}</p>
                </div>
              )}

              {/* Shipping Address */}
              {hasShippingAddress ? (
                <div className="glass-card rounded-2xl p-4">
                  <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FiMapPin className="text-primary-600" />
                    Shipping Address
                  </h2>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-800">{shippingAddress.name || 'N/A'}</p>
                    <p>{shippingAddress.address || 'N/A'}</p>
                    <p>
                      {shippingAddress.city || 'N/A'}, {shippingAddress.state || 'N/A'}{' '}
                      {shippingAddress.zipCode || 'N/A'}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Order Items */}
              <div className="glass-card rounded-2xl p-4">
                <h2 className="text-base font-bold text-gray-800 mb-3">Order Items</h2>
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <LazyImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.name}</h3>
                        <p className="text-xs text-gray-600">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                        {formatVariantLabel(item?.variant) && (
                          <p className="text-[11px] text-gray-500">
                            {formatVariantLabel(item?.variant)}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-gray-800 text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  {orderItems.length === 0 && (
                    <p className="text-sm text-gray-600">Item details are not available for this tracking view.</p>
                  )}
                </div>
              </div>

              {/* Estimated Delivery */}
              {order.estimatedDelivery && (
                <div className="glass-card rounded-2xl p-4">
                  <h2 className="text-base font-bold text-gray-800 mb-2">Estimated Delivery</h2>
                  <p className="text-lg font-semibold text-primary-600">
                    {formatDate(order.estimatedDelivery)}
                  </p>
                </div>
              )}

              {/* Actions */}
              {user?.id ? (
                <button
                  onClick={() => navigate(`/orders/${displayOrderId}`)}
                  className="w-full py-3 gradient-green text-white rounded-xl font-semibold hover:shadow-glow-green transition-all"
                >
                  View Order Details
                </button>
              ) : (
                <button
                  onClick={() => navigate('/home')}
                  className="w-full py-3 gradient-green text-white rounded-xl font-semibold hover:shadow-glow-green transition-all"
                >
                  Continue Shopping
                </button>
              )}
            </div>
          </div>
      </MobileLayout>
    </PageTransition>
  );
};

export default MobileTrackOrder;

