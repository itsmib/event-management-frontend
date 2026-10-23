import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  CalendarDays,
  Ticket,
  Users,
  Pencil,
  ArrowUpRight,
} from "lucide-react";
import { useResource } from "../hooks";
import { useAuth } from "../auth";
import { api } from "../api";
import type { Event, Summary, Reminder } from "../types";
import { Empty, ErrorNotice, Loading, date } from "../components/Feedback";
export function Dashboard() {
  const { user } = useAuth();
  const { data, error, loading, reload } =
    useResource<Summary>("/admin/summary");
  return (
    <>
      <div className="eyebrow">YOUR ORGANIZER WORKSPACE</div>
      <div className="section-heading">
        <div>
          <h1 className="page-title">Hello, {user?.name.split(" ")[0]}.</h1>
          <p className="page-description">
            Bring people together. Make something memorable.
          </p>
        </div>
        <Link className="button" to="/admin/events/new">
          <Plus size={18} />
          Create event
        </Link>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNotice message={error} retry={reload} />
      ) : (
        <div className="stats">
          {[
            { label: "Your events", value: data?.events, icon: CalendarDays },
            {
              label: "Confirmed bookings",
              value: data?.bookings,
              icon: Ticket,
            },
            { label: "Tickets reserved", value: data?.tickets, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <article key={label}>
              <Icon size={22} />
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
      )}
      <div className="organizer-banner">
        <div>
          <span className="eyebrow">FROM AN IDEA TO A SHARED EXPERIENCE</span>
          <h2>
            Your next great event
            <br />
            starts right here.
          </h2>
          <Link to="/admin/events">
            Manage your events <ArrowUpRight size={18} />
          </Link>
        </div>
        <span aria-hidden="true">✳</span>
      </div>
    </>
  );
}
export function ManageEvents() {
  const { data, error, loading, reload } =
    useResource<Event[]>("/admin/events");
  const [pending, setPending] = useState<{
    id: number;
    action: "delete" | "remind";
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [message, setMessage] = useState("");
  async function act() {
    if (!pending) return;
    setBusy(true);
    setFailure("");
    setMessage("");
    try {
      await api(
        pending.action === "delete"
          ? `/events/${pending.id}`
          : `/admin/events/${pending.id}/reminders`,
        { method: pending.action === "delete" ? "DELETE" : "POST" },
      );
      setMessage(
        pending.action === "delete"
          ? "Event and its bookings deleted."
          : "Reminder emails sent to booked attendees.",
      );
      setPending(null);
      reload();
    } catch (e) {
      setFailure((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="eyebrow">MAKE GOOD THINGS HAPPEN</div>
      <div className="section-heading">
        <div>
          <h1 className="page-title">My events.</h1>
          <p className="page-description">Every detail, in one place.</p>
        </div>
        <Link className="button" to="/admin/events/new">
          <Plus size={18} />
          Create event
        </Link>
      </div>
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
          title="Make your first gathering."
          text="Create an event and give people something to look forward to."
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Date & time</th>
                <th>Available spots</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((e) => (
                <tr key={e.eventId}>
                  <td>
                    <Link className="table-title" to={`/events/${e.eventId}`}>
                      {e.name}
                    </Link>
                    <small>
                      {e.category} · {e.location}
                    </small>
                  </td>
                  <td>
                    {date(e.eventDate)}
                    <small>{e.eventTime.slice(0, 5)}</small>
                  </td>
                  <td>
                    <span className="pill">{e.totalTickets} available</span>
                  </td>
                  <td>
                    <div className="actions">
                      <Link
                        className="icon-button"
                        aria-label={`Edit ${e.name}`}
                        to={`/admin/events/${e.eventId}/edit`}
                      >
                        <Pencil size={17} />
                      </Link>
                      <button
                        className="text-button"
                        onClick={() =>
                          setPending({ id: e.eventId, action: "remind" })
                        }
                      >
                        Remind
                      </button>
                      <button
                        className="text-button danger-text"
                        onClick={() =>
                          setPending({ id: e.eventId, action: "delete" })
                        }
                      >
                        Delete
                      </button>
                    </div>
                    {pending?.id === e.eventId && (
                      <div className="confirm" role="alert">
                        <strong>
                          {pending.action === "delete"
                            ? "Delete this event and all its bookings?"
                            : "Send reminders to all booked attendees?"}
                        </strong>
                        <div className="actions">
                          <button
                            className={`button small ${pending.action === "delete" ? "danger" : ""}`}
                            disabled={busy}
                            onClick={act}
                          >
                            {busy ? "Working…" : "Confirm"}
                          </button>
                          <button
                            className="button secondary small"
                            disabled={busy}
                            onClick={() => setPending(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
export function Reminders() {
  const { data, error, loading, reload } =
    useResource<Reminder[]>("/admin/reminders");
  return (
    <>
      <div className="eyebrow">KEEP EVERYONE IN THE LOOP</div>
      <h1 className="page-title">Reminder history.</h1>
      <p className="page-description">
        Email reminders sent for your events.{" "}
        <Link to="/admin/events">Send a reminder →</Link>
      </p>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNotice message={error} retry={reload} />
      ) : !data?.length ? (
        <Empty
          title="All quiet for now."
          text="Sent reminders will appear here. You can send them from My events."
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Message</th>
                <th>Sent</th>
              </tr>
            </thead>
            <tbody>
              {data.map((n) => (
                <tr key={n.id}>
                  <td>{n.eventName}</td>
                  <td>{n.message}</td>
                  <td>{new Date(n.sentAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
