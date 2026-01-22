import { IEvent } from "@/app/_server/db";

export async function getEvents(): Promise<IEvent[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events`,
  );
  const data = await response.json();
  return data.events as IEvent[];
}

export async function getEvent(slug: string): Promise<IEvent | null> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${slug}`,
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch event: ${response.statusText}`);
  }

  const data = await response.json();
  return data.event as IEvent;
}
