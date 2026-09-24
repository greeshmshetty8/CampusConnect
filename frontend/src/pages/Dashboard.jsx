/** Dashboard.jsx — the student's home: simple profile + a count of registrations. */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    api("/api/registrations/me").then(setRegistrations).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>

      <div className="grid gap-4 sm:grid-cols-3 mt-5">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-slate-500">Email</p>
          <p className="font-medium break-all">{user.email}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-slate-500">Role</p>
          <p className="font-medium capitalize">{user.role}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-slate-500">My registrations</p>
          <p className="font-medium">{registrations.length}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/events" className="bg-slate-900 text-white px-4 py-2 rounded">
          Browse events
        </Link>
        <Link to="/my-registrations" className="border px-4 py-2 rounded">
          My registrations
        </Link>
      </div>
    </div>
  );
}
