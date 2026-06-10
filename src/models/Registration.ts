
import mongoose, { Document, Schema } from 'mongoose';

export interface IRegistration extends Document {
  userType: 'vendor' | 'visitor';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  stallDescription?: string;
  stallNumber?: string;
  numPasses?: number;
  specialRequirements?: string;
  ticketType?: string;
  numTickets?: number;
  dietaryRequirements?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentId?: mongoose.Types.ObjectId;
  ticketIds: mongoose.Types.ObjectId[];
  attendanceStatus: 'not_marked' | 'attended' | 'absent';
  checkInTime?: Date;
  checkInBy?: string;
}

const RegistrationSchema: Schema = new Schema({
  userType: {
    type: String,
    enum: ['vendor', 'visitor'],
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
  },
  stallDescription: {
    type: String,
  },
  stallNumber: {
    type: String,
  },
  numPasses: {
    type: Number,
  },
  specialRequirements: {
    type: String,
  },
  ticketType: {
    type: String,
    enum: ['general', 'vip', 'couple', 'student'],
  },
  numTickets: {
    type: Number,
  },
  dietaryRequirements: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
  },
  ticketIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
    },
  ],
  attendanceStatus: {
    type: String,
    enum: ['not_marked', 'attended', 'absent'],
    default: 'not_marked',
  },
  checkInTime: {
    type: Date,
  },
  checkInBy: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IRegistration>('Registration', RegistrationSchema);
