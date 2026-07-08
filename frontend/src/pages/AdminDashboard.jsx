import React, { useState, useEffect } from "react";
import { Footprints, Users, Play, CheckCircle, RefreshCw, LogOut, LayoutDashboard, Store } from "lucide-react";

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAllTickets();
  }, []);

  // ⚡ Fetch all active tickets from all tenants
  const fetchAllTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/admin/all-tickets", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setTickets(data);
      }
    } catch (error) {
      console.error("Failed to load global queue data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ⚡ Call next queue action for a specific tenant
  const handleNextQueue = async (tenantId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/tenants/${tenantId}/next`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchAllTickets();
      } else {
        alert("Failed to call next queue.");
      }
    } catch (error) {
      alert("System error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  // ⚡ Complete queue action (Done) -> Shifts ticket to user history
  const handleDoneQueue = async (ticketId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/tickets/${ticketId}/done`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        fetchAllTickets(); // Refresh monitor data
      } else {
        alert("Failed to complete the ticket.");
      }
    } catch (error) {
      alert("System error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const waitingTickets = tickets.filter(t => t.status === "waiting");
  const calledTickets = tickets.filter(t => t.status === "called");

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col antialiased" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      <style>{`
        .bento-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 50px rgba(65, 102, 86, 0.04);
        }
      `}</style>

      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(65,102,86,0.05)] rounded-xl mt-6 mx-auto w-[92%] max-w-[1200px]">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-[#d1fae5] rounded-lg text-[#416656]">
              <Footprints className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold text-[#416656]">Kiyu <span className="text-xs font-mono px-2 py-0.5 bg-[#416656] text-white rounded ml-1">Super Admin</span></span>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href="/login"; }} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      {/* Main Body */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 md:px-6 pt-[120px] pb-12 flex flex-col gap-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-[#191c1e] tracking-tight">Global Queue Control</h1>
            <p className="text-sm text-gray-500">Monitor and manage all active cross-tenant queues across the Kiyu platform.</p>
          </div>
          <button onClick={fetchAllTickets} className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-[#416656] shadow-sm flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Monitor
          </button>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bento-card rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">⏱️</div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Waiting</p>
              <h4 className="text-3xl font-black text-[#191c1e]">{waitingTickets.length} Tickets</h4>
            </div>
          </div>
          <div className="bento-card rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold">⚡</div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Currently Serving (Called)</p>
              <h4 className="text-3xl font-black text-[#191c1e]">{calledTickets.length} Tickets</h4>
            </div>
          </div>
        </div>

        {/* MAIN WAITING LIST ROWS */}
        <section className="bento-card rounded-[24px] p-6">
          <h3 className="text-lg font-bold text-[#191c1e] mb-4">📋 Active Queue Overview</h3>
          
          <div className="overflow-x-auto">
            {tickets.length === 0 ? (
              <div className="text-center py-12 text-sm font-medium text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                No active queues found across any merchant locations at the moment.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-mono font-bold uppercase text-gray-400">
                    <th className="pb-3 pl-2">Merchant / Tenant</th>
                    <th className="pb-3">Queue No.</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Check-In Time</th>
                    <th className="pb-3 text-right pr-2">Actions Console</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pl-2 font-bold text-gray-800 flex items-center gap-2">
                        <Store className="w-4 h-4 text-[#416656]" />
                        {ticket.tenant?.name || `Tenant #${ticket.tenantId}`}
                      </td>
                      <td className="py-4 font-black text-lg text-[#416656]">A{ticket.queueNumber}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          ticket.status === "called" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {ticket.status === "called" ? "Serving" : "Waiting"}
                        </span>
                      </td>
                      <td className="py-4 font-mono text-xs text-gray-400">
                        {new Date(ticket.createdAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 text-right pr-2">
                        {ticket.status === "waiting" ? (
                          <button 
                            onClick={() => handleNextQueue(ticket.tenantId)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-[#416656] text-white text-xs font-bold rounded-lg hover:bg-[#345245] transition-colors cursor-pointer"
                          >
                            Call (Next)
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleDoneQueue(ticket.id)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                          >
                            Set Complete (Done)
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;