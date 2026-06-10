
import mongoose, { Document, Schema } from 'mongoose';

export interface IEventSettings extends Document {
  eventName: string;
  eventDate: Date;
  eventLocation: string;
  eventDescription: string;
  ticketTypes: Array<{ name: string; price: number; limit?: number }>;
  stallTypes: Array<{ name: string; price: number; limit?: number }>;
  organizerEmail: string;
  organizerPhone: string;
  registrationOpen: boolean;
  maxVendors: number;
  maxVisitors: number;
  confirmationEmailTemplate: string;
  reminderEmailTemplate: string;
  supportEmail: string;
  supportPhone: string;
}

const EventSettingsSchema: Schema = new Schema({
  eventName: {
    type: String,
    default: 'Event Registration',
  },
  eventDate: {
    type: Date,
    default: Date.now,
  },
  eventLocation: {
    type: String,
    default: 'Venue TBA',
  },
  eventDescription: {
    type: String,
    default: 'An amazing event!',
  },
  ticketTypes: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      limit: { type: Number },
    },
  ],
  stallTypes: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      limit: { type: Number },
    },
  ],
  organizerEmail: {
    type: String,
    default: 'organizer@example.com',
  },
  organizerPhone: {
    type: String,
    default: '1234567890',
  },
  registrationOpen: {
    type: Boolean,
    default: true,
  },
  maxVendors: {
    type: Number,
    default: 100,
  },
  maxVisitors: {
    type: Number,
    default: 1000,
  },
  confirmationEmailTemplate: {
    type: String,
    default: 'Thank you for registering!',
  },
  reminderEmailTemplate: {
    type: String,
    default: 'Reminder: Your event is coming up!',
  },
  supportEmail: {
    type: String,
    default: 'support@example.com',
  },
  supportPhone: {
    type: String,
    default: '1234567890',
  },
}, {
  timestamps: true,
});

export default mongoose.model<IEventSettings>('EventSettings', EventSettingsSchema);
