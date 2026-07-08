import React, { useState, useEffect } from "react";
import { Search, RotateCw, Bell, Store, Landmark, ShieldCheck } from "lucide-react";

const UserQueueStatus = () => {
  // === STATE DATA ANTRIAN AKTIF DARI BACKEND ===
  const [activeQueue, setActiveQueue] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data antrian aktif milik user saat komponen di-load
  useEffect(() => {
    fetchQueueStatus();
  }, []);

const fetchQueueStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // 1. Ambil Antrean Aktif
      const responseActive = await fetch("http://localhost:3000/tickets/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataActive = await responseActive.json();
      
      if (responseActive.ok && dataActive) {
        setActiveQueue({
          ticketNumber: `A${dataActive.queueNumber}`,
          tenantName: dataActive.tenant?.name || "Nama Tenant",
          serviceType: "Dine-In / Regular",
          estimatedWait: dataActive.tenant?.estimatedTime ? `${dataActive.tenant.estimatedTime} min` : "15 min",
          currentlyServing: dataActive.tenant?.currentNumber ? `A${dataActive.tenant.currentNumber}` : "A0",
          progressOffset: 150 
        });
      } else {
        setActiveQueue(null);
      }

      // 2. AMBIL DATA HISTORY REAL DARI BACKEND
      const responseHistory = await fetch("http://localhost:3000/tickets/history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataHistory = await responseHistory.json();

      if (responseHistory.ok && Array.isArray(dataHistory)) {
        // Format data agar sesuai dengan struktur UI komponen history kamu
        const formattedHistory = dataHistory.map((ticket) => ({
          id: ticket.id,
          name: ticket.tenant?.name || "Unknown Tenant",
          // Format tanggal sederhana, atau kamu bisa pakai library seperti date-fns/moment jika mau premium
          date: new Date(ticket.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
          }),
          type: "restaurant" // atau sesuaikan dengan kategori tenant kamu
        }));
        setHistory(formattedHistory);
      }

    } catch (error) {
      console.error("Gagal memuat status antrian:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col antialiased" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Custom Global Glass Style Injection */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 50px rgba(65, 102, 86, 0.05);
        }
      `}</style>

      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl mt-6 mx-auto w-[90%] max-w-[1200px] shadow-[0_20px_50px_rgba(65,102,86,0.1)] hidden md:flex">
        <div className="flex items-center gap-6">
          <span className="text-2xl font-extrabold text-[#416656] cursor-pointer">Kiyu</span>
          <div className="hidden md:flex gap-4">
            <a className="text-[#414844] font-medium hover:text-[#416656] transition-colors duration-300 text-sm" href="/home">Explore</a>
            <a className="text-[#416656] font-bold border-b-2 border-[#416656] pb-1 text-sm" href="#">My Activity</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[#414844] font-medium hover:text-[#416656] transition-colors duration-300 text-sm">Profile</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 md:px-6 pt-[120px] pb-[80px] flex flex-col gap-12">
        
        {/* Header */}
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl md:text-2xl font-bold text-[#191c1e] mb-2 tracking-tight">Good Morning 👋</h1>
            <p className="text-base text-[#414844]">Here is your active queue status.</p>
          </div>
          <button 
            onClick={fetchQueueStatus}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-[#f2f4f6] text-[#416656] rounded-xl text-sm font-semibold hover:bg-[#d1fae5] transition-colors shadow-sm"
          >
            <RotateCw className="w-4 h-4" />
            Refresh Status
          </button>
        </header>

        {loading ? (
          <div className="text-center py-12 text-[#414844] font-medium">Sinkronisasi nomor tiket dengan backend...</div>
        ) : (
          <>
            {/* Active Queue Card & Side Widget (Bento Style) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card Antrian Utama */}
              <div className="md:col-span-2 glass-card rounded-[24px] p-8 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                {/* Background decorative blur circle */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#d1fae5] rounded-full blur-[80px] opacity-30"></div>
                
                <div className="flex justify-between items-start z-10">
                  <div>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6e8ea] text-[#414844] text-[12px] font-mono font-semibold uppercase tracking-wider mb-4">
                      <span className="w-2 h-2 rounded-full bg-[#416656] animate-pulse"></span>
                      In Queue
                    </span>
                    <h2 className="text-2xl font-extrabold text-[#191c1e]">{activeQueue?.tenantName}</h2>
                    <p className="text-sm text-[#414844] mt-1">{activeQueue?.serviceType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-mono font-semibold text-[#414844] uppercase tracking-wider mb-1">Your Number</p>
                    <p className="text-5xl font-extrabold text-[#416656]">{activeQueue?.ticketNumber}</p>
                  </div>
                </div>

                <div className="mt-8 z-10 flex items-center justify-between border-t border-[#c1c8c2]/20 pt-6">
                  <div>
                    <p className="text-[12px] font-mono font-semibold text-[#414844] uppercase tracking-wider mb-1">Estimated Wait</p>
                    <p className="text-3xl font-bold text-[#191c1e]">{activeQueue?.estimatedWait}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[12px] font-mono font-semibold text-[#414844] uppercase tracking-wider mb-1">Currently Serving</p>
                      <p className="text-2xl font-bold text-[#191c1e]">{activeQueue?.currentlyServing}</p>
                    </div>
                    {/* Circular SVG Progress */}
                    <div className="relative w-16 h-16">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-[#e0e3e5]" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" stroke-width="8"></circle>
                        <circle className="text-[#416656] transition-all duration-1000 ease-in-out" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" stroke-dasharray="251.2" stroke-dashoffset={activeQueue?.progressOffset || 150} stroke-width="8"></circle>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Widget */}
              <div className="glass-card rounded-[24px] p-6 flex flex-col justify-center items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#d3e5f1] flex items-center justify-center text-[#566771] mb-2">
                  <Bell className="w-8 h-8 fill-current" />
                </div>
                <h3 className="text-xl font-bold text-[#191c1e]">SMS Alerts ON</h3>
                <p className="text-sm text-[#414844]">We'll notify you when it's your turn.</p>
                <button className="mt-2 text-[#416656] text-sm font-semibold hover:underline">Manage Settings</button>
              </div>

            </section>

            {/* History Section */}
            <section className="mt-4">
              <h3 className="text-2xl font-bold text-[#191c1e] mb-6">Recent History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((item) => (
                  <div key={item.id} className="glass-card rounded-xl p-4 flex items-center justify-between hover:bg-white transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#e6e8ea] flex items-center justify-center text-[#414844] group-hover:bg-[#d1fae5] group-hover:text-[#416656] transition-colors">
                        {item.type === "clinic" ? <Landmark className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#191c1e]">{item.name}</p>
                        <p className="text-[12px] font-mono text-[#414844] mt-1">{item.date}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#ffeed8] text-[#786b58] text-[12px] font-mono font-semibold">Completed</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full pt-[80px] pb-[48px] bg-white border-t border-[#c1c8c2]/30 mt-auto">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-2xl font-extrabold text-[#416656]">Kiyu</span>
          <div className="flex gap-6">
            <a className="text-[12px] font-mono text-[#414844] hover:text-[#416656] underline opacity-80" href="#">Privacy Policy</a>
            <a className="text-[12px] font-mono text-[#414844] hover:text-[#416656] underline opacity-80" href="#">Terms of Service</a>
            <a className="text-[12px] font-mono text-[#414844] hover:text-[#416656] underline opacity-80" href="#">Contact</a>
          </div>
          <p className="text-sm text-[#414844] opacity-80">© 2026 Kiyu Queue Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default UserQueueStatus;