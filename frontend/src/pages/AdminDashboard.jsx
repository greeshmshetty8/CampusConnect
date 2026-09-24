/**
 * AdminDashboard.jsx
 * ------------------
 * Admin-only page:
 *  - statistics cards (total events, students, registrations)
 *  - a form to add or edit an event
 *  - the event table with Edit / Delete / View students
 */
import { useEffect, useState } from "react";
import { api, CATEGORIES } from "../api";

const EMPTY = {
  name: "",
  description: "",
  date: "",
  time: "",
  location: "",
  category: "Technical",
  organizer: "",
  max_capacity: 50,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [students, setStudents] = useState(null);
  const [message, setMessage] = useState("");

  function load() {
    api("/api/admin/stats").then(setStats).catch(() => {});
    api("/api/events").then(setEvents).catch(() => {});
  }

  useEffect(load, []);

  function update(field, value) {
    setForm((old) => ({ ...old, [field]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setMessage("");
    const body = JSON.stringify({ ...form, max_capacity: Number(form.max_capacity) });
    try {
      if (editingId) {
        await api(`/api/events/${editingId}`, { method: "PUT", body });
        setMessage("Event updated.");
      } else {
        await api("/api/events", { method: "POST", body });
        setMessage("Event created.");
      }
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this event?")) return;
    await api(`/api/events/${id}`, { method: "DELETE" });
    setMessage("Event deleted.");
    load();
  }

  function startEdit(event) {
    setEditingId(event.id);
    setForm({
      name: event.name,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      organizer: event.organizer,
      max_capacity: event.max_capacity,
    });
    window.scrollTo({ top: 0 });
  }

  async function viewStudents(id) {
    const data = await api(`/api/admin/events/${id}/students`);
    setStudents(data);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin dashboard</h1>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Stat label="Total events" value={stats.total_events} />
          <Stat label="Total students" value={stats.total_students} />
          <Stat label="Total registrations" value={stats.total_registrations} />
        </div>
      )}

      {message && <p className="text-sm mb-3 font-medium">{message}</p>}

      <form onSubmit={save} className="bg-white border rounded-lg p-5 grid gap-3 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">
          {editingId ? "Edit event" : "Add new event"}
        </h2>
        <Field label="Name" value={form.name} onChange={(v) => update("name", v)} />
        <Field label="Organizer" value={form.organizer} onChange={(v) => update("organizer", v)} />
        <Field label="Date (YYYY-MM-DD)" value={form.date} onChange={(v) => update("date", v)} />
        <Field label="Time (HH:MM)" value={form.time} onChange={(v) => update("time", v)} />
        <Field label="Location" value={form.location} onChange={(v) => update("location", v)} />
        <label className="text-sm">
          Category
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <Field
          label="Max capacity"
          type="number"
          value={form.max_capacity}
          onChange={(v) => update("max_capacity", v)}
        />
        <label className="text-sm sm:col-span-2">
          Description
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            rows={3}
          />
        </label>
        <div className="sm:col-span-2 flex gap-3">
          <button className="bg-slate-900 text-white px-4 py-2 rounded">
            {editingId ? "Save changes" : "Add event"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY);
              }}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="font-semibold mt-8 mb-3">All events</h2>
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="bg-white border rounded-lg p-4 flex flex-wrap gap-3 items-center">
            <div className="mr-auto">
              <p className="font-semibold">{event.name}</p>
              <p className="text-sm text-slate-600">
                {event.date} {event.time} — {event.category} — {event.registered_count}/
                {event.max_capacity} registered
              </p>
            </div>
            <button onClick={() => viewStudents(event.id)} className="underline text-sm">
              View students
            </button>
            <button onClick={() => startEdit(event)} className="border px-3 py-1 rounded text-sm">
              Edit
            </button>
            <button
              onClick={() => remove(event.id)}
              className="border border-red-600 text-red-600 px-3 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {students && (
        <div className="bg-white border rounded-lg p-5 mt-6">
          <h2 className="font-semibold">Registered students — {students.event.name}</h2>
          {students.students.length === 0 ? (
            <p className="text-sm text-slate-600 mt-2">Nobody has registered yet.</p>
          ) : (
            <table className="w-full text-sm mt-3">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-1">Name</th>
                  <th>Email</th>
                  <th>Registered at</th>
                </tr>
              </thead>
              <tbody>
                {students.students.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="py-1">{s.name}</td>
                    <td>{s.email}</td>
                    <td>{new Date(s.registered_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button onClick={() => setStudents(null)} className="mt-3 underline text-sm">
            Close
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="text-sm">
      {label}
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border rounded px-3 py-2"
      />
    </label>
  );
}
