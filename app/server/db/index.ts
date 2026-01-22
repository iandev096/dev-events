/**
 * Database Models Central Export
 * 
 * This file serves as a single import location for all database models and types.
 * Import models and types from this file instead of individual model files.
 * 
 * Example usage:
 * import { Event, Booking, IEvent, IBooking } from '@/app/server/db';
 */

// Re-export Event model and types
export { Event } from './event.model';
export type { IEvent } from './event.model';

// Re-export Booking model and types
export { Booking } from './booking.model';
export type { IBooking } from './booking.model';

