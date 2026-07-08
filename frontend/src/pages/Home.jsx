import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { Search, MapPin, ArrowRight, Users, Clock, X } from "lucide-react";

const Home = () => {
  const navigate = useNavigate(); 
  const [searchQuery, setSearchQuery] = useState("");

  // === STATE USER AUTH ===
  const [userEmail, setUserEmail] = useState("");

  // === STATE DATA BACKEND ===
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  // === STATE UNTUK POP-UP MODAL ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [submitLoading, setSubmitLoading] = useState(false);

  // === FETCH DATA DARI BACKEND SAAT HALAMAN DI-LOAD ===
  useEffect(() => {
    fetchTenants();
    checkUserAuth();
  }, []);

  const checkUserAuth = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const savedEmail = localStorage.getItem("email") || "User";
      setUserEmail(savedEmail);
    }
  };

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/tenants");
      const data = await response.json();
      if (response.ok) {
        setTenants(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data tenant:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic filter pencarian (Sekarang hanya memfilter berdasarkan input pencarian saja)
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = (
      tenant.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tenant.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
      
    return matchesSearch;
  });

  // === FUNGSI SUBMIT DATA ANTRIAN ===
  const handleConfirmQueue = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Silakan login terlebih dahulu untuk mengambil antrian!");
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:3000/tenants/${selectedTenant.id}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ totalPersons: numberOfPeople }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mendaftar antrian");
      }

      alert(`Berhasil mendaftar antrian di ${selectedTenant.name}!`);
      setIsModalOpen(false);
      navigate("/queue-status"); 

    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper untuk memotong email menjadi inisial atau username depan
  const getEmailDisplay = (email) => {
    if (!email) return "Hi!";
    return email.split("@")[0]; 
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col antialiased" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .soft-shadow {
          box-shadow: 0 20px 50px rgba(65, 102, 86, 0.05);
        }
      `}</style>

      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-2 bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(65,102,86,0.1)] rounded-xl mt-6 mx-auto w-[90%] max-w-[1200px] transition-all duration-300">
        <div className="flex items-center gap-6">
          <span className="text-2xl font-extrabold text-[#416656] cursor-pointer" onClick={() => navigate("/home")}>Kiyu</span>
          <div className="hidden md:flex gap-6">
            <a className="text-[#416656] font-bold border-b-2 border-[#416656] pb-1 text-sm" href="/home">Explore</a>
            <a className="text-[#414844] font-medium text-sm hover:text-[#416656]" href="/queue-status">My Activity</a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-[#eceef0] border border-[#c1c8c2]/30 rounded-full px-3 py-1 mr-4 focus-within:border-[#416656] transition-all">
            <Search className="w-4 h-4 text-[#414844] mr-2" />
            <input 
              className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all text-[#191c1e] placeholder:text-[#414844]" 
              placeholder="Search..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {userEmail ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#d1fae5] text-[#416656] px-4 py-2 rounded-full font-bold text-sm border border-[#416656]/10 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {getEmailDisplay(userEmail)}
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("email");
                  window.location.reload(); 
                }} 
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-full transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <a className="text-sm text-[#414844] font-bold hover:text-[#416656] bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-full transition-colors block" href="/login">Login</a>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 mt-[140px] w-full max-w-[1200px] mx-auto px-4 md:px-6 mb-16">
        
        {/* Header & Search */}
        <section className="mb-16 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#191c1e] mb-4 tracking-tight">Find your next spot</h1>
          <p className="text-base text-[#414844] max-w-2xl mb-8">Skip the line at your favorite restaurants, clinics, and more. Join the queue digitally and relax.</p>
          
          <div className="w-full max-w-3xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#414844] w-5 h-5" />
            <input 
              className="w-full h-14 pl-12 pr-4 rounded-xl border border-[#c1c8c2]/30 bg-white soft-shadow text-base text-[#191c1e] focus:outline-none focus:border-[#416656] focus:ring-2 focus:ring-[#416656]/20 transition-all" 
              placeholder="Search by name, cuisine, or service..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Grid Cards */}
        {loading ? (
          <div className="text-center py-12 text-[#414844] font-medium">Memuat antrian dari backend...</div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((tenant) => (
              <div key={tenant.id} className="glass-panel rounded-2xl overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#416656]/10 group cursor-pointer">
                <div className="h-48 relative overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={tenant.image} alt={tenant.name} />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md bg-opacity-90 ${
                    tenant.status === "Open" ? "bg-[#ffeed8] text-[#786b58]" : "bg-[#ffdad6] text-[#93000a]"
                  }`}>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${tenant.status === "Open" ? "bg-[#695d4a]" : "bg-[#ba1a1a]"}`}></span> 
                    {tenant.status || "Open"}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-[#191c1e]">{tenant.name}</h3>
                      <p className="text-sm text-[#50616b]">{tenant.type}</p>
                    </div>
                    <div className="flex items-center text-[#414844] text-xs font-medium">
                      <MapPin className="w-4 h-4 mr-1 text-[#717974]" /> {tenant.distance || "0.0mi"}
                    </div>
                  </div>

                  <div className={`mt-4 p-4 rounded-xl flex items-center justify-between border ${
                    tenant.status === "Open" ? "bg-[#f2f4f6] border-[#c1c8c2]/10" : "bg-[#ffdad6]/20 border-[#ba1a1a]/10"
                  }`}>
                    <div>
                      <p className="text-[10px] text-[#414844] font-mono uppercase tracking-wider">Current Queue</p>
                      <p className={`text-2xl font-bold ${tenant.status === "Open" ? "text-[#416656]" : "text-[#ba1a1a]"}`}>{tenant.currentQueue || tenant.total_queue || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#414844] font-mono uppercase tracking-wider">Est. Wait</p>
                      <p className={`text-xl font-bold ${tenant.status === "Open" ? "text-[#191c1e]" : "text-[#ba1a1a]"}`}>{tenant.estWait || `${tenant.avg_waiting_time || 0} min`}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedTenant(tenant);
                      setNumberOfPeople(1);
                      setIsModalOpen(true);
                    }}
                    className="w-full mt-6 bg-[#e0e3e5] text-[#191c1e] text-sm py-3 rounded-xl font-semibold group-hover:bg-[#416656] group-hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    Join Queue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* ================= MODAL POP-UP JUMLAH ORANG ================= */}
      {isModalOpen && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-[#191c1e]">Konfirmasi Antrian</h3>
                <p className="text-xs text-gray-500">{selectedTenant.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmQueue} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#414844] uppercase tracking-wider block">
                  Jumlah Orang / Pack
                </label>
                <div className="relative flex items-center">
                  <Users className="w-5 h-5 text-gray-400 absolute left-4" />
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                    className="w-full bg-[#f2f4f6] border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm font-semibold text-[#191c1e] focus:outline-none focus:border-[#416656] focus:bg-white transition-all"
                    placeholder="Contoh: 2"
                  />
                </div>
              </div>

              <div className="bg-[#d1fae5]/50 p-3 rounded-xl border border-[#416656]/10 flex items-start gap-2.5 text-xs text-[#507564]">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>Estimasi waktu tunggu saat ini adalah sekitar <strong>{selectedTenant.estWait || `${selectedTenant.avg_waiting_time || 0} min`}</strong>.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitLoading}
                  className="w-1/2 bg-gray-100 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-1/2 bg-[#416656] text-white font-semibold py-3 rounded-xl text-sm hover:bg-[#507564] shadow-md transition-colors"
                >
                  {submitLoading ? "Memproses..." : "Ambil Tiket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-10 border-t border-[#c1c8c2]/30 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-extrabold text-[#416656]">Kiyu</div>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-mono">
            <a className="text-[#414844] hover:text-[#416656] underline opacity-80" href="#">Privacy Policy</a>
            <a className="text-[#414844] hover:text-[#416656] underline opacity-80" href="#">Terms of Service</a>
            <a className="text-[#414844] hover:text-[#416656] underline opacity-80" href="#">Contact</a>
            <a className="text-[#414844] hover:text-[#416656] underline opacity-80" href="#">Status</a>
          </div>
          <div className="text-sm text-[#191c1e] text-center md:text-right">
            © 2026 Kiyu Queue Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;