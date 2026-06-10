
import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  registrationId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
  paymentMethod?: string;
  refundId?: string;
  refundStatus?: string;
  refundReason?: string;
  refundedAt?: Date;
  paidAt?: Date;
}

const PaymentSchema: Schema = new Schema({
  registrationId: {
    type: Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  razorpayOrderId: {
    type: String,
    unique: true,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
    unique: true,
    sparse: true,
  },
  razorpaySignature: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
  },
  refundId: {
    type: String,
  },
  refundStatus: {
    type: String,
  },
  refundReason: {
    type: String,
  },
  refundedAt: {
    type: Date,
  },
  paidAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);
