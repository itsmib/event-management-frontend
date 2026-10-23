import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { Discover } from "../pages/Discover";
const events = [
  {
    eventId: 1,
    name: "Live jazz",
    category: "Music",
    location: "Studio",
    eventDate: "2027-01-02",
    eventTime: "14:00:00",
    totalTickets: 20,
  },
  {
    eventId: 2,
    name: "Build together",
    category: "Technology",
    location: "Workshop",
    eventDate: "2027-01-03",
    eventTime: "15:00:00",
    totalTickets: 0,
  },
];
afterEach(() => vi.unstubAllGlobals());
it("filters by text and category and shows an actionable empty state", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(events), {
          headers: { "Content-Type": "application/json" },
        }),
      ),
  );
  render(
    <MemoryRouter>
      <Discover />
    </MemoryRouter>,
  );
  await screen.findByText("Live jazz");
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Technology" }));
  expect(screen.queryByText("Live jazz")).not.toBeInTheDocument();
  expect(screen.getByText("Fully booked")).toBeInTheDocument();
  await user.type(
    screen.getByRole("textbox", { name: "Search events" }),
    "nonexistent",
  );
  expect(screen.getByText("No matches just yet.")).toBeInTheDocument();
});
it("shows API errors with retry instead of fabricated events", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  render(
    <MemoryRouter>
      <Discover />
    </MemoryRouter>,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("Cannot connect");
  expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  expect(screen.queryByText("Live jazz")).not.toBeInTheDocument();
});
