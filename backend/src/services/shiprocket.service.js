import axios from 'axios';
import Settings from '../models/Settings.model.js';
import ApiError from '../utils/ApiError.js';

class ShiprocketService {
    constructor() {
        this.baseURL = 'https://apiv2.shiprocket.in/v1/external';
        this.token = null;
        this.tokenExpiry = null;
    }

    async getCredentials() {
        const setting = await Settings.findOne({ key: 'shiprocket' }).lean();
        if (setting && setting.value) {
            return {
                email: setting.value.email,
                password: setting.value.password,
            };
        }
        // Fallback to env variables if not in settings
        if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD) {
            return {
                email: process.env.SHIPROCKET_EMAIL,
                password: process.env.SHIPROCKET_PASSWORD,
            };
        }
        throw new ApiError(500, 'Shiprocket credentials not configured.');
    }

    async authenticate() {
        // Simple memory cache for token
        if (this.token && this.tokenExpiry && this.tokenExpiry > Date.now()) {
            return this.token;
        }

        const credentials = await this.getCredentials();
        try {
            const response = await axios.post(`${this.baseURL}/auth/login`, {
                email: credentials.email,
                password: credentials.password,
            });

            this.token = response.data.token;
            // Token is usually valid for 10 days, but we refresh it if it's older than 24 hours just in case
            this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
            return this.token;
        } catch (error) {
            console.error('Shiprocket Auth Error:', error.response?.data || error.message);
            throw new ApiError(500, 'Failed to authenticate with Shiprocket.');
        }
    }

    async createShipment(order, vendorGroup) {
        const token = await this.authenticate();

        const orderItems = vendorGroup.items.map(item => ({
            name: item.name,
            sku: item.productId.toString(), // Using productId as SKU
            units: item.quantity,
            selling_price: item.price,
            discount: 0,
            tax: 0,
            hsn: 0
        }));

        const payload = {
            order_id: `${order.orderId}-${vendorGroup.vendorId}`, // Unique per vendor for split shipments
            order_date: order.createdAt.toISOString().slice(0, 16).replace('T', ' '),
            pickup_location: "work", // Can be made dynamic later
            billing_customer_name: order.shippingAddress.name,
            billing_last_name: "",
            billing_address: order.shippingAddress.address,
            billing_address_2: "",
            billing_city: order.shippingAddress.city,
            billing_pincode: order.shippingAddress.zipCode,
            billing_state: order.shippingAddress.state,
            billing_country: order.shippingAddress.country || 'India',
            billing_email: order.shippingAddress.email,
            billing_phone: order.shippingAddress.phone,
            shipping_is_billing: true,
            order_items: orderItems,
            payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
            shipping_charges: vendorGroup.shipping,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: vendorGroup.discount,
            sub_total: vendorGroup.subtotal,
            // Defaults as product schema lacks dimensions
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5
        };

        try {
            const response = await axios.post(`${this.baseURL}/orders/create/adhoc`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Shiprocket Create Order Error:', error.response?.data || error.message);
            throw new ApiError(500, 'Failed to create shipment on Shiprocket.');
        }
    }

    async checkServiceability(pickup_postcode, delivery_postcode, cod, weight) {
        const token = await this.authenticate();
        try {
            const response = await axios.get(`${this.baseURL}/courier/serviceability/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    pickup_postcode,
                    delivery_postcode,
                    cod,
                    weight
                }
            });
            return response.data;
        } catch (error) {
            console.error('Shiprocket Serviceability Error:', error.response?.data || error.message);
            throw new ApiError(500, 'Failed to check serviceability.');
        }
    }

    async assignAWB(shipment_id, courier_id = "") {
        const token = await this.authenticate();
        try {
            const response = await axios.post(`${this.baseURL}/courier/assign/awb`, {
                shipment_id,
                courier_id
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Shiprocket Assign AWB Error:', error.response?.data || error.message);
            throw new ApiError(500, 'Failed to assign AWB.');
        }
    }

    async generateLabel(shipment_ids) {
        const token = await this.authenticate();
        try {
            const response = await axios.post(`${this.baseURL}/courier/generate/label`, {
                shipment_id: Array.isArray(shipment_ids) ? shipment_ids : [shipment_ids]
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Shiprocket Generate Label Error:', error.response?.data || error.message);
            throw new ApiError(500, 'Failed to generate shipping label.');
        }
    }

    async requestPickup(shipment_ids) {
        const token = await this.authenticate();
        try {
            const response = await axios.post(`${this.baseURL}/courier/generate/pickup`, {
                shipment_id: Array.isArray(shipment_ids) ? shipment_ids : [shipment_ids]
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Shiprocket Request Pickup Error:', error.response?.data || error.message);
            throw new ApiError(500, 'Failed to request pickup.');
        }
    }

    async trackAWB(awb_code) {
        const token = await this.authenticate();
        try {
            const response = await axios.get(`${this.baseURL}/courier/track/awb/${awb_code}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Shiprocket Track AWB Error:', error.response?.data || error.message);
            throw new ApiError(500, 'Failed to track AWB.');
        }
    }

    async cancelOrder(order_ids) {
        const token = await this.authenticate();
        try {
            const response = await axios.post(`${this.baseURL}/orders/cancel`, {
                ids: Array.isArray(order_ids) ? order_ids : [order_ids]
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Shiprocket Cancel Order Error:', error.response?.data || error.message);
            throw new ApiError(500, 'Failed to cancel order.');
        }
    }
}

const shiprocketService = new ShiprocketService();
export default shiprocketService;
