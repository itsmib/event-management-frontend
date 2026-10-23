import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { api } from "../api";
import { useResource } from "../hooks";
import type { Event } from "../types";
import { ErrorNotice, Loading } from "../components/Feedback";
export function EventEditor() {
  const { id } = useParams();
  return id ? <EditExisting id={id} /> : <Editor />;
}
function EditExisting({ id }: { id: string }) {
  const { data, error, loading, reload } =
    useResource<Event[]>("/admin/events");
  if (loading) return <Loading />;
  if (error) return <ErrorNotice message={error} retry={reload} />;
  const event = data?.find((e) => e.eventId === Number(id));
  if (!event)
    return (
      <ErrorNotice message="Event not found in your organizer workspace." />
    );
  return <Editor event={event} />;
}
function Editor({ event }: { event?: Event }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = new FormData(e.currentTarget);
    const file = body.get("imageFile") as File;
    if (file?.size > 5 * 1024 * 1024) {
      setError("Choose an image smaller than 5 MB.");
      return;
    }
    if (!file?.size) body.delete("imageFile");
    setBusy(true);
    setError("");
    try {
      await api(event ? `/events/${event.eventId}` : "/events", {
        method: event ? "PUT" : "POST",
        body,
      });
      navigate("/admin/events");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link className="back-link" to="/admin/events">
        <ArrowLeft size={16} />
        My events
      </Link>
      <div className="eyebrow">LET’S BRING PEOPLE TOGETHER</div>
      <h1 className="page-title">
        {event ? "Edit your event." : "Create something good."}
      </h1>
      <p className="page-description">
        The details that turn an idea into an experience.
      </p>
      <form className="editor" onSubmit={save}>
        {error && <ErrorNotice message={error} />}
        <section>
          <h2>01 / The essentials</h2>
          <label>
            Event name
            <input
              name="name"
              required
              maxLength={100}
              defaultValue={event?.name}
              placeholder="Give your gathering a name"
            />
          </label>
          <div className="form-grid">
            <label>
              Category
              <input
                name="category"
                list="categories"
                required
                maxLength={60}
                defaultValue={event?.category}
                placeholder="Choose or enter a category"
              />
              <datalist id="categories">
                {[
                  "Music",
                  "Arts & culture",
                  "Technology",
                  "Food & drink",
                  "Community",
                  "Sports",
                  "Workshops",
                ].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label>
              Location
              <input
                name="location"
                required
                maxLength={200}
                defaultValue={event?.location}
                placeholder="Venue or meeting point"
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              name="description"
              rows={4}
              maxLength={255}
              defaultValue={event?.description || ""}
              placeholder="What can people look forward to?"
            />
            <small>Up to 255 characters.</small>
          </label>
        </section>
        <section>
          <h2>02 / When & how many</h2>
          <div className="form-grid">
            <label>
              Event date
              <input
                name="eventDate"
                type="date"
                required
                defaultValue={event?.eventDate}
              />
            </label>
            <label>
              Start time
              <input
                name="eventTime"
                type="time"
                required
                defaultValue={event?.eventTime.slice(0, 5)}
              />
            </label>
          </div>
          {event ? (
            <p className="notice">
              {event.totalTickets} tickets currently available. Existing ticket
              inventory is preserved when you edit.
            </p>
          ) : (
            <label>
              Ticket capacity
              <input
                name="totalTickets"
                type="number"
                min={0}
                max={2147483647}
                required
                defaultValue={50}
              />
            </label>
          )}
        </section>
        <section>
          <h2>03 / Set the scene</h2>
          {event?.hasImage && (
            <img
              className="editor-preview"
              src={`/api/events/${event.eventId}/image`}
              alt="Current event image"
            />
          )}
          <label className="upload">
            <Upload size={24} />
            <strong>{fileName || "Add an event image"}</strong>
            <span>PNG or JPEG · maximum 5 MB</span>
            <input
              name="imageFile"
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
            />
          </label>
          {event && <small>Leave empty to keep the current image.</small>}
        </section>
        <div className="actions">
          <button className="button" disabled={busy}>
            {busy ? "Saving…" : event ? "Save changes" : "Publish event"}
          </button>
          <Link className="button secondary" to="/admin/events">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
