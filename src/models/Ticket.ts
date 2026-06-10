
import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  registrationId: mongoose.Types.ObjectId;
  ticketNumber: string;
  qrCode: string;
  qrCodeImage: string;
  name: string;
  email: string;
  phone: string;
  ticketType: string;
  stallNumber?: string;
  status: 'generated' | 'used' | 'invalid';
  checkedInAt?: Date;
  checkedInBy?: string;
  generatedAt: Date;
  eventDate: Date;
}

const TicketSchema: Schema = new Schema({
  registrationId: {
    type: Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
  },
  ticketNumber: {
    type: String,
    unique: true,
    required: true,
  },
  qrCode: {
    type: String,
    unique: true,
    required: true,
  },
  qrCodeImage: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  ticketType: {
    type: String,
    required: true,
  },
  stallNumber: {
    type: String,
  },
  status: {
    type: String,
    enum: ['generated', 'used', 'invalid'],
    default: 'generated',
  },
  checkedInAt: {
    type: Date,
  },
  checkedInBy: {
    type: String,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  eventDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model<ITicket>('Ticket', TicketSchema);
