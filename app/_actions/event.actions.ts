"use server";

import { Event } from "../_server/db";
import { connectDB } from "../_server/lib/mongodb";

export const getSimilarEventsBySlug = async (
  slug: string,
  limit: number = 3,
) => {
  try {
    await connectDB();

    const event = await Event.findOne({ slug }).lean();
    if (!event) {
      return null;
    }

    const otherEvents = await Event.find({
      _id: { $ne: event?._id },
    }).lean();
    console.log(
      "otherEvents",
      otherEvents.map((event) => [event.title, event.tags]),
    );

    const similarEvents = await Event.find({
      _id: { $ne: event?._id },
      tags: { $in: event?.tags },
    })
      .limit(limit)
      .lean();

    return similarEvents;
  } catch (error) {
    console.error("Error connecting to database:", error);
    return null;
  }
};
