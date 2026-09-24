/**
 * EventDetails.jsx — full details of one event with the Register / Cancel button.
 *
 * Clicking "Register" sends POST /api/registrations/{id} to FastAPI, which
 * inserts a row in the registrations table in SQLite and sends back a result.
 */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth.jsx";

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const data = await api(`/api/events/${id}`);
    setEvent(data);
    if (user) {
      const mine = await api("/api/registrations/me");
      setRegistered(mine.some((r) => r.event.id === Number(id)));
    }
  }

  useEffect(() => {
    load().catch((err) => setMessage(err.message));
  }, [id, user]);

  async function handleRegister() {
    setMessage("");
    if (!user) return navigate("/login");
    try {
      await api(`/api/registrations/${id}`, { method: "POST" });
      setMessage("You are registered for this event.");
      await load();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleCancel() {
    setMessage("");
    try {
      await api(`/api/registrations/${id}`, { method: "DELETE" });
      setMessage("Registration cancelled.");
      await load();
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!event) return <p>Loading…</p>;

  return (
    <div className="bg-white border rounded-lg p-6">
      <span className="text-xs bg-slate-900 text-white px-2 py-1 rounded">{event.category}</span>
      <h1 className="text-2xl font-bold mt-2">{event.name}</h1>
      <p className="mt-3 text-slate-700">{event.description}</p>
      <ul className="mt-4 text-sm text-slate-700 space-y-1">
        <li>Date: {event.date}</li>
        <li>Time: {event.time}</li>
        <li>Location: {event.location}</li>
        <li>Organizer: {event.organizer}</li>
        <li>
          Seats: {event.registered_count}/{event.max_capacity} ({event.seats_left} left)
        </li>
      </ul>

      {message && <p className="mt-4 text-sm text-slate-900 font-medium">{message}</p>}

      <div className="mt-5">
        {registered ? (
          <button onClick={handleCancel} className="border border-slate-900 px-4 py-2 rounded">
            Cancel my registration
          </button>
        ) : (
          <button
            onClick={handleRegister}
            disabled={event.seats_left === 0}
            className="bg-slate-900 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {event.seats_left === 0 ? "Event is full" : "Register for this event"}
          </button>
        )}
      </div>
    </div>
  );
}
