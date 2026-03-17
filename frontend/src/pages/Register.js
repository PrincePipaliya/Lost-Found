import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";

import Particles from "@tsparticles/react";
import { loadSlim } from "tsparticles-slim";
import Tilt from "react-parallax-tilt";

export default function Register() {

  const navigate = useNavigate();
  const nameRef = useRef(null);

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");

  const [loading,setLoading] = useState(false);

  const [showPassword,setShowPassword] = useState(false);
  const [showConfirmPassword,setShowConfirmPassword] = useState(false);

  const [mousePosition,setMousePosition] = useState({x:0,y:0});
  const [particlesReady,setParticlesReady] = useState(false);

  /* AUTO FOCUS NAME + LOAD PARTICLES */

  useEffect(()=>{
    nameRef.current?.focus();
    setParticlesReady(true);
  },[]);

  const particlesInit = useCallback(async(engine)=>{
    await loadSlim(engine);
  },[]);

  const handleMouseMove = (e)=>{
    const rect = e.currentTarget.getBoundingClientRect();

    setMousePosition({
      x:e.clientX - rect.left,
      y:e.clientY - rect.top
    });
  };

  const handleSubmit = async(e)=>{
    e.preventDefault();
    if(loading) return;

    if(password !== confirmPassword){
      toast.error("Passwords do not match");
      return;
    }

    try{

      setLoading(true);

      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      await api.post("/auth/register",{
        name:name.trim(),
        email:trimmedEmail,
        password:trimmedPassword
      });

      const res = await api.post("/auth/login",{
        email:trimmedEmail,
        password:trimmedPassword
      });

      const { accessToken, refreshToken, user } = res.data;

      localStorage.clear();
      localStorage.setItem("accessToken",accessToken);
      localStorage.setItem("refreshToken",refreshToken);
      localStorage.setItem("user",JSON.stringify(user));

      toast.success("Welcome! Your account is ready 🎉");

      navigate("/dashboard",{replace:true});

    }catch(err){

      toast.error(
        err?.response?.data?.message || "Registration failed"
      );

    }finally{
      setLoading(false);
    }
  };

  return(

    <div className="min-h-screen animated-bg relative flex items-center justify-center overflow-hidden">

      {/* PARTICLES (LAZY LOADED) */}

      {particlesReady && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          className="absolute inset-0"
          options={{
            fpsLimit:60,
            particles:{
              number:{value:30},
              size:{value:2},
              move:{speed:0.3},
              opacity:{value:0.3},
              links:{
                enable:true,
                distance:140,
                color:"#ffffff",
                opacity:0.1
              }
            }
          }}
        />
      )}

      {/* BLOBS */}

      <div className="absolute -top-20 -left-20 w-72 h-72 bg-pink-400 rounded-full blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute top-1/3 -right-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-400 rounded-full blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

      {/* REGISTER CARD */}

      <Tilt
        glareEnable
        glareMaxOpacity={0.25}
        scale={1.05}
        tiltMaxAngleX={10}
        tiltMaxAngleY={10}
        className="relative z-10"
      >

        <form
          onSubmit={handleSubmit}
          onMouseMove={handleMouseMove}
          style={{
            background:`radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.35), rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.05) 80%)`
          }}
          className="w-[380px]
          backdrop-blur-xl
          border border-white/40
          shadow-[0_0_60px_rgba(255,255,255,0.15)]
          rounded-2xl
          p-10 animate-fadeInUp transition-all duration-200"
        >

          {/* LOGO */}

          <h1 className="text-4xl font-extrabold text-center mb-8 text-white tracking-wide animate-pulse">
            <span className="text-blue-200">we</span>
            <span className="text-white">FOUND</span>
            <span className="text-green-300">it</span>
          </h1>

          {/* NAME */}

          <div className="relative mb-6">

            <User className="absolute left-3 top-4 text-gray-700" size={18}/>

            <input
              ref={nameRef}
              type="text"
              required
              value={name}
              onChange={(e)=>setName(e.target.value)}
              placeholder=" "
              className="peer w-full pl-10 pt-5 pb-2 rounded-lg
              bg-white/40 text-gray-900
              border border-white/50
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-400
              outline-none"
            />

            <label className="absolute left-10 top-2 text-xs text-gray-700
            transition-all
            peer-placeholder-shown:top-4
            peer-placeholder-shown:text-sm
            peer-focus:top-2
            peer-focus:text-xs">
              Full Name
            </label>

          </div>

          {/* EMAIL */}

          <div className="relative mb-6">

            <Mail className="absolute left-3 top-4 text-gray-700" size={18}/>

            <input
              type="email"
              required
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder=" "
              className="peer w-full pl-10 pt-5 pb-2 rounded-lg
              bg-white/40 text-gray-900
              border border-white/50
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-400
              outline-none"
            />

            <label className="absolute left-10 top-2 text-xs text-gray-700
            transition-all
            peer-placeholder-shown:top-4
            peer-placeholder-shown:text-sm
            peer-focus:top-2
            peer-focus:text-xs">
              Email Address
            </label>

          </div>

          {/* PASSWORD */}

          <div className="relative mb-6">

            <Lock className="absolute left-3 top-4 text-gray-700" size={18}/>

            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder=" "
              className="peer w-full pl-10 pr-10 pt-5 pb-2 rounded-lg
              bg-white/40 text-gray-900
              border border-white/50
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-400
              outline-none"
            />

            <label className="absolute left-10 top-2 text-xs text-gray-700
            transition-all
            peer-placeholder-shown:top-4
            peer-placeholder-shown:text-sm
            peer-focus:top-2
            peer-focus:text-xs">
              Password
            </label>

            <button
              type="button"
              onClick={()=>setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-700 hover:text-black"
            >
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="relative mb-6">

            <Lock className="absolute left-3 top-4 text-gray-700" size={18}/>

            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e)=>setConfirmPassword(e.target.value)}
              placeholder=" "
              className="peer w-full pl-10 pr-10 pt-5 pb-2 rounded-lg
              bg-white/40 text-gray-900
              border border-white/50
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-400
              outline-none"
            />

            <label className="absolute left-10 top-2 text-xs text-gray-700
            transition-all
            peer-placeholder-shown:top-4
            peer-placeholder-shown:text-sm
            peer-focus:top-2
            peer-focus:text-xs">
              Confirm Password
            </label>

            <button
              type="button"
              onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-700 hover:text-black"
            >
              {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2
            py-2.5 rounded-lg
            bg-white text-indigo-700 font-bold
            hover:bg-indigo-50
            active:scale-95 transition"
          >

            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18}/>
                Creating account...
              </>
            ) : "Register"}

          </button>

          <p className="mt-6 text-center text-white text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold underline hover:text-blue-200"
            >
              Login
            </Link>
          </p>

        </form>

      </Tilt>

    </div>

  );
}