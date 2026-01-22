import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Event } from './event.model';

/**
 * TypeScript interface for Booking document
 * Extends mongoose.Document to include all Booking fields with proper typing
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email validation regex pattern
 * Validates standard email format
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Booking Schema Definition
 * Defines structure and validation rules for Booking documents
 */
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true, // Index for faster queries
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

/**
 * Compound index on eventId and email
 * Prevents duplicate bookings for the same event by the same email
 */
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

/**
 * Pre-save hook to verify that the referenced event exists
 * Only validates when eventId is new or modified
 */
BookingSchema.pre('save', async function () {
  // Only validate if eventId is new or modified
  if (!this.isModified('eventId')) {
    return;
  }
  
  // Validate ObjectId format first
  if (!mongoose.Types.ObjectId.isValid(this.eventId)) {
    throw new Error(`Invalid event ID format: ${this.eventId}`);
  }
  
  // Check if event exists in database
  const eventExists = await Event.findById(this.eventId);
  
  if (!eventExists) {
    throw new Error(`Event with ID ${this.eventId} does not exist`);
  }
});

/**
 * Export Booking model
 * Uses mongoose.models check to prevent model recompilation during hot-reload
 */
export const Booking: Model<IBooking> = 
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
