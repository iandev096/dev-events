import { Event } from "@/app/_server/db";
import { connectDB } from "@/app/_server/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  try {
    await connectDB();

    const slug = (await params).slug;

    // Validate slug parameter
    if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
      return NextResponse.json(
        { message: "Invalid slug parameter", error: null },
        { status: 400 },
      );
    }

    // Normalize slug: decode URI component and convert to lowercase
    const normalizedSlug = decodeURIComponent(slug).toLowerCase().trim();

    // Query event by slug
    const event = await Event.findOne({ slug: normalizedSlug }).lean();

    if (!event) {
      return NextResponse.json(
        { message: "Event not found", error: null },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { event, message: "Event fetched successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `Failed to get event: ${error instanceof Error ? error.message : "Unknown"}`,
        error,
      },
      { status: 500 },
    );
  }
}
