import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { api, json } from "../api";
import { ErrorNotice } from "../components/Feedback";
export function Profile() {
  const { user, refresh } = useAuth();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await api(
        "/profile",
        json("PUT", Object.fromEntries(new FormData(e.currentTarget))),
      );
      await refresh();
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="eyebrow">MAKE YOURSELF AT HOME</div>
      <h1 className="page-title">My profile.</h1>
      <div className="profile-panel">
        <div className="profile-heading">
          <span className="avatar large-avatar">{user?.name.charAt(0)}</span>
          <div>
            <h2>{user?.name}</h2>
            <p className="muted">
              {user?.role === "ADMIN" ? "Organizer" : "Member"} account
            </p>
          </div>
        </div>
        {error && <ErrorNotice message={error} />}{" "}
        {saved && (
          <p className="notice" role="status">
            Your profile has been updated.
          </p>
        )}
        <form onSubmit={save}>
          <label>
            Full name
            <input
              name="name"
              defaultValue={user?.name}
              required
              maxLength={100}
              autoComplete="name"
            />
          </label>
          <label>
            Email address
            <input type="email" value={user?.email || ""} readOnly />
            <small>Your sign-in email is managed separately.</small>
          </label>
          <label>
            Contact number
            <input
              type="tel"
              name="contactNumber"
              defaultValue={user?.contactNumber || ""}
              maxLength={30}
              autoComplete="tel"
            />
          </label>
          <button className="button" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </form>
        <div className="profile-security">
          <h3>Password & security</h3>
          <p className="muted">
            Reset your password using a verification code sent to your email.
          </p>
          <Link className="text-button" to="/reset-password">
            Reset password →
          </Link>
        </div>
      </div>
    </>
  );
}
