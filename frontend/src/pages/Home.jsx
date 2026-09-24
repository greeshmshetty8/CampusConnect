/** Home.jsx — landing page with a short intro and the next few events. */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import EventCard from "../components/EventCard.jsx";

export default function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api("/api/events").then((data) => setEvents(data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      <section className="bg-slate-900 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold">All campus events in one place</h1>
        <p className="mt-2 text-slate-300">
          Browse technical fests, cultural nights, sports and workshops — then
          register in one click.
        </p>
        <div className="mt-4 flex gap-3">
          <Link to="/events" className="bg-amber-500 text-slate-900 px-4 py-2 rounded font-medium">
            Browse events
          </Link>
          <Link to="/register" className="border border-white px-4 py-2 rounded">
            Create account
          </Link>
        </div>
      </section>

      <h2 className="mt-8 mb-3 text-xl font-semibold">Upcoming events</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
