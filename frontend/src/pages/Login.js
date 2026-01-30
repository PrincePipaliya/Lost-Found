import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // ✅ prevent double submit
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("name", res.data.user.name);

      successToast("Welcome back 👋");
      navigate("/dashboard");
    } catch (err) {
      errorToast(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* 🌈 Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 animate-gradient" />

      {/* 🔮 Floating blobs */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-pink-400 rounded-full blur-3xl opacity-40 animate-blob" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-blue-400 rounded-full blur-3xl opacity-40 animate-blob animation-delay-2000" />
      <div className="absolute bottom-24 left-1/3 w-80 h-80 bg-purple-400 rounded-full blur-3xl opacity-40 animate-blob animation-delay-4000" />

      {/* 🧊 Glass login card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md
          bg-white/20 backdrop-blur-xl
          border border-white/30
          rounded-2xl shadow-2xl
          p-8 animate-fadeInUp"
      >
        {/* Logo */}
        <h1 className="text-3xl font-extrabold text-center mb-2 text-white">
          <span className="text-blue-200">we</span>
          <span className="text-white">FOUND</span>
          <span className="text-green-300">it</span>
        </h1>

        <p className="text-center text-white/80 mb-8">
          Sign in to continue
        </p>

        {/* Email */}
        <div className="mb-4 relative">
          <Mail className="absolute left-3 top-3.5 text-white/70" size={18} />
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full pl-10 pr-3 py-2.5 rounded-lg
              bg-white/20 text-white placeholder-white/70
              border border-white/30
              focus:outline-none focus:ring-2 focus:ring-white/60
              transition"
          />
        </div>

        {/* Password */}
        <div className="mb-6 relative">
          <Lock className="absolute left-3 top-3.5 text-white/70" size={18} />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full pl-10 pr-3 py-2.5 rounded-lg
              bg-white/20 text-white placeholder-white/70
              border border-white/30
              focus:outline-none focus:ring-2 focus:ring-white/60
              transition"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2
            py-2.5 rounded-lg
            bg-white text-indigo-700 font-bold
            hover:bg-indigo-50
            active:scale-95 transition
            disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        {/* Register */}
        <p className="mt-6 text-center text-white/80 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="font-semibold underline hover:text-white">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
