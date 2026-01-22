import { doesSlugExist } from "@/app/_server/db/event.model";
import { uploadFile } from "@/app/_server/lib/cloudinary";
import { connectDB } from "@/app/_server/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Event } from "../../_server/db";

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(
      { events, message: `${events.length} events fetched successfully` },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `Failed to get events: ${error instanceof Error ? error.message : "Unknown"}`,
        error,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const eventFormData = await req.formData();
    const eventData = {
      title: eventFormData.get("title") as string,
      description: eventFormData.get("description") as string,
      overview: eventFormData.get("overview") as string,
      venue: eventFormData.get("venue") as string,
      location: eventFormData.get("location") as string,
      date: eventFormData.get("date") as string,
      time: eventFormData.get("time") as string,
      mode: eventFormData.get("mode") as "online" | "offline" | "hybrid",
      audience: eventFormData.get("audience") as string,
      agenda: eventFormData.get("agenda") as unknown as string[],
      organizer: eventFormData.get("organizer") as string,
      tags: eventFormData.get("tags") as unknown as string[],
    };

    if (await doesSlugExist(eventData.title)) {
      return NextResponse.json(
        {
          message: `Event with title "${eventData.title}" already exists`,
          error: null,
        },
        { status: 400 },
      );
    }

    const image = eventFormData.get("image") as File;
    const uploadedImage = await uploadFile(image);

    const createdEvent = await Event.create({
      ...eventData,
      image: uploadedImage?.secure_url ?? "https://via.placeholder.com/150",
    });

    return NextResponse.json(
      { event: createdEvent.toObject(), message: "Event created successfully" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `Failed to create event: ${error instanceof Error ? error.message : "Unknown"}`,
        error,
      },
      { status: 500 },
    );
  }
}
