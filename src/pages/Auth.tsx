import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api, json } from "../api";
import { useAuth } from "../auth";
import { ErrorNotice } from "../components/Feedback";
export function AuthPage({ mode }: { mode: "login" | "register" | "reset" }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [success, setSuccess] = useState("");
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "login") {
        await api("/auth/login", {
          method: "POST",
          body: new URLSearchParams({
            username: String(data.get("email")).trim().toLowerCase(),
            password: String(data.get("password")),
          }),
        });
        const user = await refresh();
        if (!user)
          throw new Error("Sign-in could not be verified. Please try again.");
        const from = location.state?.from;
        navigate(
          typeof from === "string" &&
            from.startsWith("/") &&
            !from.startsWith("//")
            ? from
            : user.role === "ADMIN"
              ? "/admin"
              : "/",
          { replace: true },
        );
      } else if (mode === "register") {
        await api("/auth/register", json("POST", Object.fromEntries(data)));
        navigate("/login", {
          state: {
            message: "Your account is ready. Sign in to start exploring.",
          },
        });
      } else if (!sent) {
        await api(
          "/auth/password/request",
          json("POST", { email: data.get("email") }),
        );
        setSent(true);
        setSuccess(
          "If that email is registered, a code is on its way. Keep this browser open.",
        );
      } else {
        await api(
          "/auth/password/confirm",
          json("POST", Object.fromEntries(data)),
        );
        navigate("/login", {
          state: {
            message: "Password updated. Sign in with your new password.",
          },
        });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const title =
    mode === "login"
      ? "Welcome back."
      : mode === "register"
        ? "Your people are out there."
        : sent
          ? "Check your inbox."
          : "Let’s get you back in.";
  return (
    <section className="auth-layout">
      <div className="auth-intro">
        <div className="eyebrow">A LITTLE MORE TOGETHER</div>
        <h1>
          Good moments
          <br />
          start with
          <br />
          <em>showing up.</em>
        </h1>
        <span className="auth-star" aria-hidden="true">
          ✳
        </span>
        <p>
          Discover an event. Meet your people.
          <br />
          Make it a day to remember.
        </p>
      </div>
      <div className="form-panel">
        <h2>{title}</h2>
        <p className="muted">
          {mode === "login"
            ? "Sign in to book your next experience."
            : mode === "register"
              ? "Create a member account and find your next experience."
              : "We’ll help you reset your password securely."}
        </p>
        {(success || location.state?.message) && (
          <p className="notice" role="status">
            {success || location.state.message}
          </p>
        )}
        {error && <ErrorNotice message={error} />}
        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Full name
              <input name="name" autoComplete="name" required maxLength={100} />
            </label>
          )}
          {(!sent || mode !== "reset") && (
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            </label>
          )}
          {mode === "register" && (
            <label>
              Contact number <span className="muted">(optional)</span>
              <input
                name="contactNumber"
                type="tel"
                autoComplete="tel"
                maxLength={30}
              />
            </label>
          )}
          {mode === "reset" && sent && (
            <label>
              6-digit code
              <input
                name="otp"
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
                maxLength={6}
              />
            </label>
          )}
          {(mode !== "reset" || sent) && (
            <label>
              {mode === "reset" ? "New password" : "Password"}
              <input
                name={mode === "reset" ? "newPassword" : "password"}
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                minLength={mode === "login" ? undefined : 8}
                maxLength={72}
              />
              {mode !== "login" && <small>Use at least 8 characters.</small>}
            </label>
          )}
          {mode === "login" && (
            <Link className="form-link" to="/reset-password">
              Forgot password?
            </Link>
          )}
          <button className="button full" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : mode === "register"
                  ? "Create account"
                  : sent
                    ? "Reset password"
                    : "Send reset code"}
            <ArrowRight size={17} />
          </button>
        </form>
        <p className="form-footer">
          {mode === "login" ? (
            <>
              New to Gather? <Link to="/register">Join us</Link>
            </>
          ) : (
            <Link to="/login">Back to sign in</Link>
          )}
        </p>
        {mode === "reset" && sent && (
          <button
            className="text-button"
            onClick={() => {
              setSent(false);
              setSuccess("");
              setError("");
            }}
          >
            Request a new code
          </button>
        )}
      </div>
    </section>
  );
}
