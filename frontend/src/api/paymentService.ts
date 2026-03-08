import apiClient from './apiClient';

export const paymentService = {
    /**
     * Create a Razorpay order on the backend
     * @param itemId The ID of the course or test
     * @param itemType 'Course' or 'Test'
     */
    createOrder: async (itemId: string, itemType: 'Course' | 'Test') => {
        try {
            const response = await apiClient.post('/payments/create-order', {
                itemId,
                itemType,
            });
            return response.data;
        } catch (error: any) {
            console.error('Error creating payment order:', error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Verify the payment signature on the backend
     */
    verifyPayment: async (paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }) => {
        try {
            const response = await apiClient.post('/payments/verify-payment', paymentData);
            return response.data;
        } catch (error: any) {
            console.error('Error verifying payment:', error);
            throw error.response?.data || error.message;
        }
    },
};
