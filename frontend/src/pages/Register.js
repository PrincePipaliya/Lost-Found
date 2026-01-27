import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register user
      const res = await api.post("/auth/register", form);

      // Save token & auto-login
      localStorage.setItem("token", res.data.token);
localStorage.setItem("role", res.data.user.role);
localStorage.setItem("name", res.data.user.name);

navigate("/dashboard");


    } catch (err) {
      alert("Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-200">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md animate-fadeInUp">

        <h2 className="text-2xl font-bold text-center mb-2">
          Join <span className="text-blue-600">we</span>
          <span className="text-gray-900">FOUND</span>
          <span className="text-green-600">it</span>
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Create your account
        </p>

        <form onSubmit={submit} className="space-y-4">

          <input
            type="text"
            placeholder="Name"
            required
            className="w-full border p-2 rounded"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            required
            className="w-full border p-2 rounded"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full border p-2 rounded"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded
              hover:bg-green-700 active:scale-95 transition"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
