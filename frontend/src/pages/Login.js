import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading) return;

    try {

      setLoading(true);

      const res = await api.post("/auth/login",{
        email: email.trim().toLowerCase(),
        password
      });

      const { accessToken, refreshToken, user } = res.data;

      localStorage.clear();

      localStorage.setItem("accessToken",accessToken);
      localStorage.setItem("refreshToken",refreshToken);
      localStorage.setItem("user",JSON.stringify(user));

      toast.success("Welcome back 👋");

      navigate("/dashboard",{ replace:true });

    } catch (err) {

      console.error(err);

      toast.error(
        err?.response?.data?.message || "Login failed"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-8"
      >

        <h1 className="text-3xl font-extrabold text-center mb-2 text-white">
          weFOUNDit
        </h1>

        <p className="text-center text-white/80 mb-8">
          Sign in to continue
        </p>

        {/* EMAIL */}
        <div className="mb-4 relative">

          <Mail className="absolute left-3 top-3.5 text-white/70" size={18} />

          <input
            type="email"
            required
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30"
          />

        </div>

        {/* PASSWORD */}
        <div className="mb-6 relative">

          <Lock className="absolute left-3 top-3.5 text-white/70" size={18} />

          <input
            type="password"
            required
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            placeholder="Password"
            className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30"
          />

        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white text-indigo-700 font-bold hover:bg-indigo-50 transition"
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

        <p className="mt-6 text-center text-white/80 text-sm">

          Don’t have an account?{" "}

          <Link
            to="/register"
            className="font-semibold underline"
          >
            Register
          </Link>

        </p>

      </form>

    </div>

  );

}