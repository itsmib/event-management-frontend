import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { Bookings } from "../pages/Bookings";
afterEach(() => vi.unstubAllGlobals());
it("requires confirmation before cancelling and refreshes the list", async () => {
  const reply = (body: unknown) =>
    new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
    });
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      reply([
        {
          bookingId: 1,
          ticketCount: 2,
          event: {
            eventId: 1,
            name: "Live jazz",
            eventDate: "2027-01-02",
            eventTime: "14:00:00",
            location: "Studio",
          },
        },
      ]),
    )
    .mockResolvedValueOnce(
      reply({ token: "token", headerName: "X-CSRF-TOKEN" }),
    )
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
    .mockResolvedValueOnce(reply([]));
  vi.stubGlobal("fetch", fetch);
  render(
    <MemoryRouter>
      <Bookings />
    </MemoryRouter>,
  );
  await screen.findByText("Live jazz");
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Cancel booking" }));
  expect(fetch).toHaveBeenCalledTimes(1);
  await user.click(screen.getByRole("button", { name: "Yes, cancel" }));
  await screen.findByText("Your calendar is open.");
  expect(fetch.mock.calls[2][0]).toBe("/api/bookings/1");
  expect(fetch.mock.calls[2][1].method).toBe("DELETE");
});
