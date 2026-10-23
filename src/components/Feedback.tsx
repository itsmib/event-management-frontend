import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, LoaderCircle } from "lucide-react";
export function Loading() {
  return (
    <div className="empty" role="status">
      <LoaderCircle className="spin" size={28} />
      <p>Loading your next experience…</p>
    </div>
  );
}
export function ErrorNotice({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="notice error" role="alert">
      <AlertCircle size={20} />
      <div>
        {message}
        {retry && (
          <button className="text-button" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
export function Empty({
  title,
  text,
  link,
}: {
  title: string;
  text: string;
  link?: string;
}) {
  return (
    <div className="empty">
      <span className="empty-symbol">✳</span>
      <h2>{title}</h2>
      <p>{text}</p>
      {link && (
        <Link className="button" to={link}>
          Explore events <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
export const date = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
