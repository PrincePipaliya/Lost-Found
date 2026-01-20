import { useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      alert("Registration successful");
      window.location.href = "/login";
    } catch {
      alert("Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-200">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-fadeInUp">

        <h2 className="text-2xl font-bold text-center mb-2">
  Join{" "}
  <span className="text-blue-600">we</span>
  <span className="text-gray-900">FOUND</span>
  <span className="text-green-600">it</span>
</h2>
<p className="text-center text-gray-500 mb-6">
  Help items find their way home
</p>


        <form onSubmit={submit} className="space-y-5">

          {["name", "email", "password"].map((field, i) => (
            <div key={i} className="relative">
              <input
                type={field === "password" ? "password" : "text"}
                required
                value={form[field]}
                onChange={(e) =>
                  setForm({ ...form, [field]: e.target.value })
                }
                className="peer w-full border rounded px-3 pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all
                peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                peer-focus:top-2 peer-focus:text-sm capitalize">
                {field}
              </label>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded font-semibold
              hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-700 font-semibold hover:underline transition"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
