import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Event } from "../types";
import { date } from "./Feedback";
export function EventArtwork({
  event,
  large = false,
}: {
  event: Event;
  large?: boolean;
}) {
  return (
    <div
      className={`event-art art-${event.eventId % 4} ${large ? "large" : ""}`}
    >
      {event.hasImage ? (
        <img src={`/api/events/${event.eventId}/image`} alt={event.name} />
      ) : (
        <>
          <span className="art-circle" />
          <span className="art-grid" />
          <span className="art-word">{event.category || "Together"}</span>
          <span className="art-star">✳</span>
        </>
      )}
      <span className="category-label">{event.category}</span>
    </div>
  );
}
export function EventCard({ event }: { event: Event }) {
  return (
    <Link className="event-card" to={`/events/${event.eventId}`}>
      <EventArtwork event={event} />
      <div className="card-body">
        <p className="event-date">
          {date(event.eventDate)} <span>· {event.eventTime.slice(0, 5)}</span>
        </p>
        <h3>
          {event.name}
          <ArrowUpRight size={21} />
        </h3>
        <p className="location">
          <MapPin size={15} />
          {event.location}
        </p>
        <div className="card-bottom">
          <span>
            {event.totalTickets > 0
              ? `${event.totalTickets} spots available`
              : "Fully booked"}
          </span>
          <span>View event →</span>
        </div>
      </div>
    </Link>
  );
}
