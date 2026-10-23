import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Ticket } from "lucide-react";
import { api } from "../api";
import { useResource } from "../hooks";
import type { Booking } from "../types";
import { Empty, ErrorNotice, Loading, date } from "../components/Feedback";
export function Bookings() {
  const { data, loading, error, reload } = useResource<Booking[]>("/bookings");
  const [confirm, setConfirm] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [message, setMessage] = useState(useLocation().state?.message || "");
  async function cancel(id: number) {
    setBusy(true);
    setFailure("");
    try {
      await api(`/bookings/${id}`, { method: "DELETE" });
      setConfirm(null);
      setMessage("Booking cancelled. Your tickets have been returned.");
      reload();
    } catch (e) {
      setFailure((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="eyebrow">YOUR PLANS, ALL IN ONE PLACE</div>
      <h1 className="page-title">My bookings.</h1>
      <p className="page-description">Something to look forward to.</p>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {failure && <ErrorNotice message={failure} />}{" "}
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNotice message={error} retry={reload} />
      ) : !data?.length ? (
        <Empty
          title="Your calendar is open."
          text="Find an experience you love and your tickets will appear here."
          link="/"
        />
      ) : (
        <div className="booking-list">
          {data.map((b) => (
            <article className="booking-row" key={b.bookingId}>
              <div className="ticket-icon">
                <Ticket size={27} />
              </div>
              <div className="booking-info">
                <span className="eyebrow">BOOKING #{b.bookingId}</span>
                <h2>
                  <Link to={`/events/${b.event.eventId}`}>{b.event.name}</Link>
                </h2>
                <p>
                  {date(b.event.eventDate)} · {b.event.eventTime.slice(0, 5)} ·{" "}
                  {b.event.location}
                </p>
                <span className="pill">
                  {b.ticketCount} ticket{b.ticketCount !== 1 ? "s" : ""}
                </span>
              </div>
              {confirm === b.bookingId ? (
                <div className="confirm" role="alert">
                  <strong>Cancel this booking?</strong>
                  <p>All {b.ticketCount} tickets will be released.</p>
                  <div className="actions">
                    <button
                      className="button danger small"
                      disabled={busy}
                      onClick={() => cancel(b.bookingId)}
                    >
                      {busy ? "Cancelling…" : "Yes, cancel"}
                    </button>
                    <button
                      className="button secondary small"
                      disabled={busy}
                      onClick={() => setConfirm(null)}
                    >
                      Keep booking
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="text-button muted"
                  onClick={() => setConfirm(b.bookingId)}
                >
                  Cancel booking
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
