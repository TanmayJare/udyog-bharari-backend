
import razorpay from '../config/razorpay';
import crypto from 'crypto';

export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
  const options = {
    amount: amount * 100, // convert to paise
    currency,
    receipt: `receipt_${Date.now()}`,
  };
  return await razorpay.orders.create(options);
};

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return generatedSignature === signature;
};

export const refundPayment = async (paymentId: string, amount: number, reason: string) => {
  return await razorpay.payments.refund(paymentId, {
    amount: amount * 100,
    notes: {
      reason,
    },
  });
};
