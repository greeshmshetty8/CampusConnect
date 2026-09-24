/**
 * EventCard.jsx — one event shown as a card in the events list.
 */
import { Link } from "react-router-dom";

export default function EventCard({ event }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <span className="text-xs bg-slate-900 text-white px-2 py-1 rounded">
        {event.category}
      </span>
      <h3 className="mt-2 font-semibold text-lg">{event.name}</h3>
      <p className="text-sm text-slate-600 mt-1">
        {event.date} at {event.time} — {event.location}
      </p>
      <p className="text-sm text-slate-600">Organizer: {event.organizer}</p>
      <p className="text-sm text-slate-600">
        {event.registered_count}/{event.max_capacity} registered
      </p>
      <Link
        to={`/events/${event.id}`}
        className="inline-block mt-3 text-sm font-medium text-slate-900 underline"
      >
        View details
      </Link>
    </div>
  );
}
