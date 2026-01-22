import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * TypeScript interface for Event document
 * Extends mongoose.Document to include all Event fields with proper typing
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: "online" | "offline" | "hybrid";
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Helper function to generate URL-friendly slug from title
 * Converts to lowercase, replaces spaces/special chars with hyphens
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export async function doesSlugExist(title: string): Promise<boolean> {
  const slug = generateSlug(title);
  const event = await Event.findOne({ slug });
  return event !== null;
}

/**
 * Helper function to normalize date to ISO format (YYYY-MM-DD)
 * Throws error if date is invalid
 */
function normalizeDate(dateStr: string): string {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  // Return ISO format date (YYYY-MM-DD)
  return date.toISOString().split("T")[0];
}

/**
 * Helper function to normalize time to 12-hour format (HH:MM AM/PM)
 * Handles various input formats and validates time ranges
 * Always returns zero-padded hours for consistency
 */
function normalizeTime(timeStr: string): string {
  const trimmed = timeStr.trim();

  // Check if already in 12-hour format with AM/PM
  const match12hr = trimmed.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (match12hr) {
    const hours = parseInt(match12hr[1]);
    const minutes = parseInt(match12hr[2]);
    const period = match12hr[3].toUpperCase();

    // Validate hour range (1-12 for 12-hour format)
    if (hours < 1 || hours > 12) {
      throw new Error(
        `Invalid hour value: ${hours}. Hours must be between 1-12 for 12-hour format`,
      );
    }

    // Validate minute range (0-59)
    if (minutes < 0 || minutes > 59) {
      throw new Error(
        `Invalid minute value: ${minutes}. Minutes must be between 0-59`,
      );
    }

    // Return normalized format with zero-padded hours and consistent spacing
    return `${hours.toString().padStart(2, "0")}:${match12hr[2]} ${period}`;
  }

  // Try to parse 24-hour format (HH:MM)
  const match24hr = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24hr) {
    let hours = parseInt(match24hr[1]);
    const minutes = parseInt(match24hr[2]);

    // Validate 24-hour format ranges
    if (hours < 0 || hours > 23) {
      throw new Error(
        `Invalid hour value: ${hours}. Hours must be between 0-23 for 24-hour format`,
      );
    }

    if (minutes < 0 || minutes > 59) {
      throw new Error(
        `Invalid minute value: ${minutes}. Minutes must be between 0-59`,
      );
    }

    // Convert to 12-hour format
    const period = hours >= 12 ? "PM" : "AM";
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;

    // Return with zero-padded hours for consistency
    return `${hours.toString().padStart(2, "0")}:${match24hr[2]} ${period}`;
  }

  throw new Error(
    `Invalid time format: ${timeStr}. Expected format: HH:MM AM/PM or HH:MM (24-hour)`,
  );
}

/**
 * Event Schema Definition
 * Defines structure and validation rules for Event documents
 */
export const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: "Title cannot be empty",
      },
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      validate: {
        validator: (v: string) => v.trim().length > 0,
        message: "Description cannot be empty",
      },
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      validate: {
        validator: (v: string) => v.trim().length > 0,
        message: "Overview cannot be empty",
      },
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      validate: {
        validator: (v: string) => v.trim().length > 0,
        message: "Image URL cannot be empty",
      },
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: "Venue cannot be empty",
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: "Location cannot be empty",
      },
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be one of: online, offline, or hybrid",
      },
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: "Audience cannot be empty",
      },
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Agenda must have at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: "Organizer cannot be empty",
      },
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Tags must have at least one item",
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  },
);

/**
 * Pre-save hook to auto-generate slug and normalize date/time
 * Only regenerates slug when title is modified
 */
EventSchema.pre("save", async function () {
  // Generate slug only if title is new or modified
  if (this.isModified("title")) {
    this.slug = generateSlug(this.title);
  }

  // Normalize date to ISO format if modified
  if (this.isModified("date")) {
    this.date = normalizeDate(this.date);
  }

  // Normalize time to consistent format if modified
  if (this.isModified("time")) {
    this.time = normalizeTime(this.time);
  }
});

/**
 * Export Event model
 * Uses mongoose.models check to prevent model recompilation during hot-reload
 */
export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
