import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 Role-based guard (frontend UX)
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/items");
      setItems(res.data);
    } catch (err) {
      // Token expired or invalid
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const approveItem = async (id) => {
    try {
      await api.put(`/items/${id}/approve`);
      loadItems();
    } catch (err) {
      alert("Failed to approve item");
    }
  };

  const deleteItem = async (id) => {
    const confirm = window.confirm(
      "⚠ This will permanently delete the item.\nAre you sure?"
    );
    if (!confirm) return;

    try {
      await api.delete(`/items/${id}`);
      loadItems();
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  const pendingCount = items.filter(i => i.status === "pending").length;
  const approvedCount = items.filter(i => i.status === "approved").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">

      {/* HEADER */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 animate-fadeInUp">
        <h1 className="text-3xl font-extrabold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Moderate and control all Lost & Found items
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Stat title="Total Items" value={items.length} />
        <Stat title="Pending Approval" value={pendingCount} color="yellow" />
        <Stat title="Approved Items" value={approvedCount} color="green" />
      </div>

      {/* ITEM LIST */}
      <div className="bg-white rounded-xl shadow p-5 animate-fadeInUp">
        <h2 className="text-xl font-bold mb-4">All Items</h2>

        {loading ? (
          <p className="text-gray-500">Loading items...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">No items available</p>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item._id}
                style={{ animationDelay: `${index * 60}ms` }}
                className="border rounded-xl p-4 flex flex-col md:flex-row
                  justify-between items-start md:items-center gap-4
                  hover:shadow-lg hover:-translate-y-0.5 transition
                  animate-cardFade"
              >
                {/* ITEM INFO */}
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {item.type.toUpperCase()}
                  </p>
                  <StatusBadge status={item.status} />
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">
                  {item.status === "pending" && (
                    <button
                      onClick={() => approveItem(item._id)}
                      className="px-4 py-1.5 rounded bg-green-500 text-white
                        hover:bg-green-600 hover:shadow
                        active:scale-95 transition"
                    >
                      Approve
                    </button>
                  )}

                  <button
                    onClick={() => deleteItem(item._id)}
                    className="px-4 py-1.5 rounded bg-red-500 text-white
                      hover:bg-red-600 hover:shadow
                      active:scale-95 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function StatusBadge({ status }) {
  const styles =
    status === "approved"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${styles}`}>
      {status.toUpperCase()}
    </span>
  );
}

function Stat({ title, value, color = "blue" }) {
  const map = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600"
  };

  return (
    <div
      className={`rounded-xl p-5 shadow hover:shadow-lg transition animate-fadeInUp ${map[color]}`}
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="text-3xl font-extrabold mt-2">{value}</p>
    </div>
  );
}
