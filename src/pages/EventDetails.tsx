import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Clock, MapPin, ArrowLeft, Users } from "lucide-react";
import { useResource } from "../hooks";
import { useAuth } from "../auth";
import { api, json } from "../api";
import type { Event } from "../types";
import { EventArtwork } from "../components/EventCard";
import { ErrorNotice, Loading, date } from "../components/Feedback";
export function EventDetails() {
  const { id } = useParams();
  const {
    data: event,
    error,
    loading,
    reload,
  } = useResource<Event>(`/events/${id}`);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  async function book(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const count = Number(new FormData(e.currentTarget).get("ticketCount"));
    setBusy(true);
    setFailure("");
    try {
      await api(
        "/bookings",
        json("POST", { eventId: Number(id), ticketCount: count }),
      );
      navigate("/bookings", {
        state: { message: "You’re going! Your booking is confirmed." },
      });
    } catch (e) {
      setFailure((e as Error).message);
      reload();
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <Loading />;
  if (error || !event)
    return <ErrorNotice message={error || "Event not found."} retry={reload} />;
  const started =
    new Date(`${event.eventDate}T${event.eventTime}`) <= new Date();
  return (
    <>
      <Link className="back-link" to="/">
        <ArrowLeft size={16} />
        All experiences
      </Link>
      <EventArtwork event={event} large />
      <div className="detail-layout">
        <section>
          <div className="eyebrow">{event.category}</div>
          <h1 className="page-title">{event.name}</h1>
          <p className="muted">
            Hosted by {event.organizerName || "the organizer"}
          </p>
          <div className="event-facts">
            <span>
              <CalendarDays />
              {date(event.eventDate)}
            </span>
            <span>
              <Clock />
              {event.eventTime.slice(0, 5)}
            </span>
            <span>
              <MapPin />
              {event.location}
            </span>
          </div>
          <h2>About this experience</h2>
          <p className="description">
            {event.description ||
              "Come together for something good. Your organizer will share more details soon."}
          </p>
        </section>
        <aside className="booking-panel">
          <Users size={28} />
          <h2>Save your spot.</h2>
          <p className="muted">
            {started
              ? "This event has already started."
              : `${event.totalTickets} spots available. Make one yours.`}
          </p>
          {failure && <ErrorNotice message={failure} />}
          {!user ? (
            <Link
              className="button full"
              to="/login"
              state={{ from: `/events/${id}` }}
            >
              Sign in to book
            </Link>
          ) : user.role === "ADMIN" ? (
            <p>Bookings are available to member accounts.</p>
          ) : (
            <form onSubmit={book}>
              <label>
                Number of tickets
                <input
                  name="ticketCount"
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={event.totalTickets}
                  required
                  disabled={started || event.totalTickets === 0}
                />
              </label>
              <button
                className="button full"
                disabled={busy || started || event.totalTickets === 0}
              >
                {busy
                  ? "Reserving…"
                  : started
                    ? "Event started"
                    : event.totalTickets === 0
                      ? "Fully booked"
                      : "Confirm booking"}
              </button>
            </form>
          )}
        </aside>
      </div>
    </>
  );
}
