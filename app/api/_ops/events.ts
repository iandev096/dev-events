import { IEvent } from "@/app/server/db";

export async function getEvents(): Promise<IEvent[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events`,
  );
  const data = await response.json();
  return data.events as IEvent[];
}
