import { uploadFile } from "@/app/server/lib/cloudinary";
import { connectDB } from "@/app/server/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import type { IEvent } from "../../server/db";
import { Event } from "../../server/db";

// hello
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    return NextResponse.json({ message: "Hello, world!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get events" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const eventFormData = await req.formData();

    const image = eventFormData.get("image") as File;
    const uploadedImage = await uploadFile(image);
    console.log("uploadedImage", uploadedImage);

    const eventData = Object.fromEntries(eventFormData) as unknown as IEvent;
    console.log("eventData", eventData);

    const createdEvent = await Event.create({
      title: eventData.title,
      description: eventData.description,
      overview: eventData.overview,
      image: uploadedImage?.secure_url ?? "https://via.placeholder.com/150",
      venue: eventData.venue,
      location: eventData.location,
      date: eventData.date,
      time: eventData.time,
      mode: eventData.mode,
      audience: eventData.audience,
      agenda: eventData.agenda,
      organizer: eventData.organizer,
      tags: eventData.tags,
    });

    return NextResponse.json(
      { event: createdEvent.toObject(), message: "Event created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("error", error);
    return NextResponse.json(
      {
        message: "Failed to create event",
        error: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 },
    );
  }
}
