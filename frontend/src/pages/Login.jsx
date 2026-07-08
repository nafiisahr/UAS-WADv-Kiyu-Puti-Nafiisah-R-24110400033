import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flower2, Rabbit, Mail, Lock, Eye, EyeOff, ArrowRight, Footprints } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "tenant_admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-sans min-h-screen w-full flex items-center justify-center relative overflow-hidden selection:bg-[#d1fae5] selection:text-[#507564]">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#d1fae5]/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#d3e5f1]/20 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="w-[92%] max-w-[1100px] flex flex-col md:flex-row bg-white/70 backdrop-blur-xl border border-white/50 rounded-[24px] shadow-[0_40px_80px_rgba(65,102,86,0.06)] overflow-hidden z-10 my-8 relative">
        {/* LEFT SIDE */}
        <div className="hidden md:block md:w-1/2 relative bg-white overflow-hidden border-r border-[#c1c8c2]/10 min-h-[550px]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f7f9fb] to-[#f2f4f6] opacity-50 z-0"></div>
          <div
            className="absolute inset-0 bg-cover bg-center z-10 mix-blend-multiply opacity-90 transition-transform duration-1000 hover:scale-105"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBQo6HEg1_zjdxgaWqFXRAY-0-AIXd4EnoOo59wb46bfSVMhaw_r0Zat1W1Ty-9-_mwFzbErcvG6Ihd3_ejdyA_Sm6QD77Zta16hWf4dGWi1leONJLkV8mUqgYxNpd6OHPwLyDxB3GhAjy6s4bCFe7_8k9esFuECBSC2awDXXe7SCZ6xhiX4XeQcw0HSFn9i_QhPICiijw4FqL0Urhegf-bIwkKDj_ZuycgdakOqC0SnHFeRuqVUF7UUA')",
            }}
          />
          <div className="absolute top-8 left-8 z-20">
            <div className="w-16 h-16 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-[0_20px_40px_rgba(65,102,86,0.1)] border border-white/60 animate-bounce" style={{ animationDuration: "4s" }}>
              <Flower2 className="text-[#416656] w-8 h-8" />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-white md:bg-transparent">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Footprints className="text-[#416656] w-9 h-9" />
              <h1 className="text-[32px] font-extrabold text-[#416656] tracking-tight">Kiyu</h1>
            </div>
            <h2 className="text-[24px] font-bold text-[#191c1e] mb-1">Welcome back</h2>
            <p className="text-sm text-[#414844]">Log in to manage your premium queues.</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-xl font-medium">{error}</div>}

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            {/* EMAIL */}
            <div className="flex flex-col gap-1.5 relative group">
              <label className="text-xs font-semibold text-[#414844] ml-2" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717974] group-focus-within:text-[#416656] transition-colors w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  required
                  className="w-full bg-[#e0e3e5]/50 border border-transparent rounded-[16px] pl-12 pr-4 py-3.5 text-sm text-[#191c1e] placeholder:text-[#717974]/60 outline-none focus:bg-white focus:border-[#416656]/50 focus:ring-4 focus:ring-[#416656]/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col gap-1.5 relative group">
              <div className="flex justify-between items-center mx-2">
                <label className="text-xs font-semibold text-[#414844]" htmlFor="password">Password</label>
                <a className="text-xs font-semibold text-[#416656] hover:underline" href="#">Forgot Password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717974] group-focus-within:text-[#416656] transition-colors w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#e0e3e5]/50 border border-transparent rounded-[16px] pl-12 pr-12 py-3.5 text-sm text-[#191c1e] placeholder:text-[#717974]/60 outline-none focus:bg-white focus:border-[#416656]/50 focus:ring-4 focus:ring-[#416656]/10 transition-all duration-300"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#717974] hover:text-[#191c1e] transition-colors">
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="mt-2 w-full bg-[#416656] disabled:bg-[#416656]/50 text-white rounded-[16px] py-4 font-semibold shadow-[0_12px_24px_rgba(65,102,86,0.2)] hover:shadow-[0_16px_32px_rgba(65,102,86,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group">
              {loading ? "Logging in..." : "Login to Account"}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#414844]">
            Don't have an account yet? <a className="text-[#416656] font-bold hover:underline" href="#">Register here</a>
          </div>
        </div>
      </main>
    </div>
  );
}