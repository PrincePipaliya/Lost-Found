import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { Mail, Lock, User, Loader2 } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Register
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      // 2️⃣ Auto-login
      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      // 3️⃣ Save auth
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("name", res.data.user.name);

      toast.success("Welcome! Your account is ready 🎉");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-bg relative flex items-center justify-center overflow-hidden">

      {/* 🌈 Animated Gradient */}
      <div className="absolute inset-0 animate-gradient" />

      {/* 🔮 Floating Blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-pink-400 rounded-full blur-3xl opacity-40 animate-blob" />
      <div className="absolute top-1/3 -right-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl opacity-40 animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-400 rounded-full blur-3xl opacity-40 animate-blob animation-delay-4000" />

      {/* 🧊 Glass Card */}
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
          Create your account
        </p>

        {/* Name */}
        <div className="mb-4 relative">
          <User className="absolute left-3 top-3.5 text-white/70" size={18} />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full pl-10 pr-3 py-2.5 rounded-lg
              bg-white/20 text-white placeholder-white/70
              border border-white/30
              focus:outline-none focus:ring-2 focus:ring-white/60
              transition"
          />
        </div>

        {/* Email */}
        <div className="mb-4 relative">
          <Mail className="absolute left-3 top-3.5 text-white/70" size={18} />
          <input
            type="email"
            required
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
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
              Creating account...
            </>
          ) : (
            "Register"
          )}
        </button>

        {/* Login */}
        <p className="mt-6 text-center text-white/80 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
