/** Register.jsx — create a student account (or an admin one with the staff code). */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", adminCode: "" });
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((old) => ({ ...old, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const user = await register(form.name, form.email, form.password, form.adminCode);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create account</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-5 space-y-3">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <label className="block text-sm">
          Full name
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Password (min 6 characters)
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Admin code (optional)
          <input
            value={form.adminCode}
            onChange={(e) => update("adminCode", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Leave blank if you are a student"
          />
        </label>
        <button className="w-full bg-slate-900 text-white rounded py-2">Register</button>
      </form>
      <p className="text-sm mt-3">
        Already registered? <Link to="/login" className="underline">Login</Link>
      </p>
    </div>
  );
}
