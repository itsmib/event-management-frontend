import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, Guard } from "./auth";
import { Layout } from "./components/Layout";
import { Discover } from "./pages/Discover";
import { AuthPage } from "./pages/Auth";
import { EventDetails } from "./pages/EventDetails";
import { Bookings } from "./pages/Bookings";
import { Profile } from "./pages/Profile";
import { Dashboard, ManageEvents, Reminders } from "./pages/Admin";
import { EventEditor } from "./pages/EventEditor";
import "./styles.css";
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Discover />} />
            <Route path="events/:id" element={<EventDetails />} />
            <Route
              path="login"
              element={<AuthPage key="login" mode="login" />}
            />
            <Route
              path="register"
              element={<AuthPage key="register" mode="register" />}
            />
            <Route
              path="reset-password"
              element={<AuthPage key="reset" mode="reset" />}
            />
            <Route
              path="bookings"
              element={
                <Guard role="USER">
                  <Bookings />
                </Guard>
              }
            />
            <Route
              path="profile"
              element={
                <Guard>
                  <Profile />
                </Guard>
              }
            />
            <Route
              path="admin"
              element={
                <Guard role="ADMIN">
                  <Dashboard />
                </Guard>
              }
            />
            <Route
              path="admin/events"
              element={
                <Guard role="ADMIN">
                  <ManageEvents />
                </Guard>
              }
            />
            <Route
              path="admin/events/new"
              element={
                <Guard role="ADMIN">
                  <EventEditor />
                </Guard>
              }
            />
            <Route
              path="admin/events/:id/edit"
              element={
                <Guard role="ADMIN">
                  <EventEditor />
                </Guard>
              }
            />
            <Route
              path="admin/reminders"
              element={
                <Guard role="ADMIN">
                  <Reminders />
                </Guard>
              }
            />
            <Route
              path="about"
              element={
                <section className="about">
                  <div className="eyebrow">THIS IS GATHER</div>
                  <h1 className="page-title">
                    Life happens
                    <br />
                    <em>together.</em>
                  </h1>
                  <p>
                    Gather is the Event Management System’s home for shared
                    experiences. Discover upcoming events, reserve tickets, and
                    keep your plans in one place.
                  </p>
                  <p>
                    For organizers, it is a space to publish events, manage
                    availability, and keep attendees informed.
                  </p>
                  <Link className="button" to="/">
                    Find an experience →
                  </Link>
                </section>
              }
            />
            <Route
              path="*"
              element={
                <section className="empty">
                  <h1>We couldn’t find that page.</h1>
                  <Link className="button" to="/">
                    Back to Discover
                  </Link>
                </section>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
