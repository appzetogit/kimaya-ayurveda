import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import Order from '../../../models/Order.model.js';
import shiprocketService from '../../../services/shiprocket.service.js';

// POST /api/vendor/shiprocket/create-order
export const createShiprocketOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    if (!orderId) throw new ApiError(400, 'Order ID is required.');

    const order = await Order.findOne({
        _id: orderId,
        'vendorItems.vendorId': req.user.id,
    });
    if (!order) throw new ApiError(404, 'Order not found.');

    const vendorGroup = order.vendorItems.find(vi => String(vi.vendorId) === String(req.user.id));
    if (!vendorGroup) throw new ApiError(404, 'Vendor item not found.');

    if (vendorGroup.shiprocketOrderId) {
        throw new ApiError(400, 'Shiprocket order is already created for this order.');
    }

    const response = await shiprocketService.createShipment(order, vendorGroup);
    
    if (response && response.shipment_id) {
        vendorGroup.shiprocketOrderId = String(response.shipment_id); // Saving shipment_id as it is needed for other APIs
        await order.save();
    } else if (response && response.order_id) {
        vendorGroup.shiprocketOrderId = String(response.order_id);
        await order.save();
    }

    res.status(200).json(new ApiResponse(200, response, 'Shiprocket order created successfully.'));
});

// POST /api/vendor/shiprocket/assign-awb
export const assignAWB = asyncHandler(async (req, res) => {
    const { orderId, courierId = "" } = req.body;
    if (!orderId) throw new ApiError(400, 'Order ID is required.');

    const order = await Order.findOne({
        _id: orderId,
        'vendorItems.vendorId': req.user.id,
    });
    if (!order) throw new ApiError(404, 'Order not found.');

    const vendorGroup = order.vendorItems.find(vi => String(vi.vendorId) === String(req.user.id));
    
    if (!vendorGroup || !vendorGroup.shiprocketOrderId) {
        throw new ApiError(400, 'Shiprocket Order not created yet.');
    }

    const response = await shiprocketService.assignAWB(vendorGroup.shiprocketOrderId, courierId);
    
    if (response && response.response && response.response.data) {
         vendorGroup.awbCode = response.response.data.awb_code;
         await order.save();
    }

    res.status(200).json(new ApiResponse(200, response, 'AWB Assigned successfully.'));
});

// POST /api/vendor/shiprocket/generate-label
export const generateLabel = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    if (!orderId) throw new ApiError(400, 'Order ID is required.');

    const order = await Order.findOne({
        _id: orderId,
        'vendorItems.vendorId': req.user.id,
    });
    const vendorGroup = order?.vendorItems.find(vi => String(vi.vendorId) === String(req.user.id));
    if (!vendorGroup || !vendorGroup.shiprocketOrderId) {
        throw new ApiError(400, 'Shiprocket Order ID missing.');
    }

    const response = await shiprocketService.generateLabel(vendorGroup.shiprocketOrderId);
    if (response && response.label_url) {
        vendorGroup.shippingLabelUrl = response.label_url;
        await order.save();
    }
    res.status(200).json(new ApiResponse(200, response, 'Label generated successfully.'));
});

// POST /api/vendor/shiprocket/request-pickup
export const requestPickup = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, 'vendorItems.vendorId': req.user.id });
    const vendorGroup = order?.vendorItems.find(vi => String(vi.vendorId) === String(req.user.id));
    if (!vendorGroup || !vendorGroup.shiprocketOrderId) throw new ApiError(400, 'Invalid order.');

    const response = await shiprocketService.requestPickup(vendorGroup.shiprocketOrderId);
    res.status(200).json(new ApiResponse(200, response, 'Pickup requested successfully.'));
});

// GET /api/vendor/shiprocket/track/:awb
export const trackAWB = asyncHandler(async (req, res) => {
    const { awb } = req.params;
    if (!awb) throw new ApiError(400, 'AWB Code is required.');
    const response = await shiprocketService.trackAWB(awb);
    res.status(200).json(new ApiResponse(200, response, 'Tracking info fetched.'));
});

// POST /api/vendor/shiprocket/cancel
export const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, 'vendorItems.vendorId': req.user.id });
    const vendorGroup = order?.vendorItems.find(vi => String(vi.vendorId) === String(req.user.id));
    
    if (!vendorGroup || !vendorGroup.shiprocketOrderId) throw new ApiError(400, 'Invalid order.');

    const response = await shiprocketService.cancelOrder(vendorGroup.shiprocketOrderId);
    res.status(200).json(new ApiResponse(200, response, 'Order cancelled successfully.'));
});
