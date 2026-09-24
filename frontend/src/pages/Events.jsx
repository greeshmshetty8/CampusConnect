/** Events.jsx — list of all events with a search box and category filter. */
import { useEffect, useState } from "react";
import { api, CATEGORIES } from "../api";
import EventCard from "../components/EventCard.jsx";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const params = new URLSearchParams({ search, category });
    api(`/api/events?${params.toString()}`).then(setEvents).catch(() => setEvents([]));
  }, [search, category]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Events</h1>

      <div className="flex flex-wrap gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, description or place"
          className="border rounded px-3 py-2 flex-1 min-w-[220px]"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {events.length === 0 ? (
        <p className="text-slate-600">No events match your search.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
