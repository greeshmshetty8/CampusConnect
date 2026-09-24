/** MyRegistrations.jsx — every event this student joined, each with a Cancel button. */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function MyRegistrations() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  function load() {
    api("/api/registrations/me").then(setRows).catch((err) => setMessage(err.message));
  }

  useEffect(load, []);

  async function cancel(eventId) {
    try {
      await api(`/api/registrations/${eventId}`, { method: "DELETE" });
      setMessage("Registration cancelled.");
      load();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My registrations</h1>
      {message && <p className="text-sm mb-3">{message}</p>}

      {rows.length === 0 ? (
        <p className="text-slate-600">
          You have not registered for any event yet.{" "}
          <Link to="/events" className="underline">Browse events</Link>
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="bg-white border rounded-lg p-4 flex flex-wrap gap-3 items-center"
            >
              <div className="mr-auto">
                <p className="font-semibold">{row.event.name}</p>
                <p className="text-sm text-slate-600">
                  {row.event.date} at {row.event.time} — {row.event.location}
                </p>
              </div>
              <Link to={`/events/${row.event.id}`} className="underline text-sm">
                Details
              </Link>
              <button
                onClick={() => cancel(row.event.id)}
                className="border border-slate-900 px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
