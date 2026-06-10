
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  phone: string;
  userType: 'vendor' | 'visitor';
  registrations: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['vendor', 'visitor'],
    required: true,
  },
  registrations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Registration',
    },
  ],
}, {
  timestamps: true,
});

export default mongoose.model<IUser>('User', UserSchema);
