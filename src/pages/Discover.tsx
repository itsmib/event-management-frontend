import { useMemo, useState } from "react";
import { Search, ArrowDownRight } from "lucide-react";
import { useResource } from "../hooks";
import type { Event } from "../types";
import { EventCard } from "../components/EventCard";
import { Empty, ErrorNotice, Loading } from "../components/Feedback";
export function Discover() {
  const { data, loading, error, reload } =
    useResource<Event[]>("/events/upcoming");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All events");
  const [sort, setSort] = useState("date");
  const categories = [
    "All events",
    ...new Set(data?.map((e) => e.category) || []),
  ];
  const filtered = useMemo(
    () =>
      (data || [])
        .filter(
          (e) =>
            (category === "All events" || e.category === category) &&
            `${e.name} ${e.location} ${e.category}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "name"
            ? a.name.localeCompare(b.name)
            : `${a.eventDate}T${a.eventTime}`.localeCompare(
                `${b.eventDate}T${b.eventTime}`,
              ),
        ),
    [data, query, category, sort],
  );
  return (
    <>
      <div className="eyebrow">DISCOVER / CONNECT / BELONG</div>
      <section className="hero">
        <div>
          <h1>
            Get out there.
            <br />
            Find your <em>people.</em>
          </h1>
          <p>
            From new interests to shared passions.
            <br />
            Find an experience worth showing up for.
          </p>
          <a className="hero-link" href="#events">
            Find your next experience <ArrowDownRight size={21} />
          </a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="hero-flower">✳</span>
          <span className="hero-art-label">
            BETTER
            <br />
            TOGETHER.
          </span>
          <span className="hero-sticker">
            See you
            <br />
            <i>there!</i>
          </span>
        </div>
      </section>
      <section id="events" className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">FIND YOUR NEXT THING</div>
            <h2>
              Upcoming experiences{" "}
              <span className="count">{data?.length || 0}</span>
            </h2>
          </div>
          <label className="sort">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort events"
            >
              <option value="date">Date: soonest</option>
              <option value="name">Name: A–Z</option>
            </select>
          </label>
        </div>
        <div className="filters">
          <label className="search">
            <Search size={19} />
            <input
              aria-label="Search events"
              placeholder="Search events, places, or interests"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="chips" aria-label="Event categories">
            {categories.map((c) => (
              <button
                key={c}
                className={category === c ? "chip selected" : "chip"}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorNotice message={error} retry={reload} />
        ) : filtered.length ? (
          <div className="event-grid">
            {filtered.map((e) => (
              <EventCard key={e.eventId} event={e} />
            ))}
          </div>
        ) : (
          <Empty
            title={
              data?.length
                ? "No matches just yet."
                : "Good things are on their way."
            }
            text={
              data?.length
                ? "Try another search or choose a different category."
                : "New experiences will appear here when organizers publish them."
            }
          />
        )}
      </section>
    </>
  );
}
