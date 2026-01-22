import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { getEvents } from "./api/_ops/events";

export default async function Home() {
  const fetchedEvents = await getEvents();

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can't Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Conferences, Workshops, and More
      </p>

      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul id="events" className="events">
          {fetchedEvents.map((event) => (
            <li key={event.title} className="list-none">
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
