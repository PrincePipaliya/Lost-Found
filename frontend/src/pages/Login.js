import { useState } from "react";
import api from "../services/api";

import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch {
      alert("Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-fadeInUp">

        <h2 className="text-2xl font-bold text-center mb-2">
  Welcome to{" "}
  <span className="text-blue-600">we</span>
  <span className="text-gray-900">FOUND</span>
  <span className="text-green-600">it</span>
</h2>
<p className="text-center text-gray-500 mb-6">
  Reuniting people with what they lost
</p>


        <form onSubmit={submit} className="space-y-5">

          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full border rounded px-3 pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all
              peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
              peer-focus:top-2 peer-focus:text-sm">
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full border rounded px-3 pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all
              peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
              peer-focus:top-2 peer-focus:text-sm">
              Password
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold
              hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline transition"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
