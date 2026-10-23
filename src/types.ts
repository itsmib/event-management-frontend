export type User = {
  userId: number;
  name: string;
  email: string;
  contactNumber: string | null;
  role: "ADMIN" | "USER";
};
export type Event = {
  eventId: number;
  name: string;
  category: string;
  location: string;
  eventDate: string;
  eventTime: string;
  description: string | null;
  totalTickets: number;
  organizerName: string | null;
  hasImage: boolean;
};
export type Booking = {
  bookingId: number;
  bookingDate: string;
  ticketCount: number;
  event: Event;
};
export type Reminder = {
  id: number;
  eventName: string;
  message: string;
  sentAt: string;
};
export type Summary = { events: number; bookings: number; tickets: number };
