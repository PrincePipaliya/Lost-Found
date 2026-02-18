import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PostItem from "../components/PostItem";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("token")
    ? JSON.parse(atob(localStorage.getItem("token").split(".")[1])).id
    : null;

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/items");
      setItems(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
      } else {
        toast.error("Failed to load items");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = filter
    ? items.filter((i) => i.type === filter)
    : items;

  const lostCount = items.filter((i) => i.type === "lost").length;
  const foundCount = items.filter((i) => i.type === "found").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">

      {/* HEADER */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h1 className="text-3xl font-extrabold">
          <span className="text-blue-600">we</span>
          <span className="text-gray-900">FOUND</span>
          <span className="text-green-600">it</span>
        </h1>

        <p className="text-gray-600 mt-2">
          Secure AI-powered ownership verification 🔐
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Items" value={items.length} />
        <StatCard title="Lost Items" value={lostCount} color="red" />
        <StatCard title="Found Items" value={foundCount} color="green" />
      </div>

      {/* POST ITEM */}
      <div className="mb-8">
        <PostItem onPosted={loadItems} />
      </div>

      {/* FILTER */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-semibold">Filter:</span>
        <select
          className="border p-2 rounded-lg"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
      </div>

      {/* ITEMS */}
      {loading ? (
        <p className="text-center text-gray-500">Loading items...</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No items found
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredItems.map((item) => {

            const isOwner = item.userId === userId;

            return (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow p-4 hover:shadow-xl transition"
              >
                {item.image && (
                  <img
                    src={`http://localhost:5000/${item.image}`}
                    alt={item.title}
                    className="h-40 w-full object-cover rounded-lg mb-3"
                  />
                )}

                <h2 className="text-lg font-bold mb-1">
                  {item.title}
                </h2>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex gap-2 mt-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold
                      ${item.type === "lost"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                      }`}
                  >
                    {item.type.toUpperCase()}
                  </span>

                  {item.claimed && (
                    <span className="text-xs px-3 py-1 rounded-full font-semibold bg-green-100 text-green-700">
                      CLAIMED
                    </span>
                  )}

                  {isOwner && (
                    <span className="text-xs px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-700">
                      YOUR ITEM
                    </span>
                  )}
                </div>

                {/* VERY CLEAR VIEW BUTTON */}
                <Link
                  to={`/items/${item._id}`}
                  className="block mt-4 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  View Details
                </Link>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* STAT CARD */
function StatCard({ title, value, color = "blue" }) {
  const map = {
    blue: "text-blue-600 bg-blue-50",
    red: "text-red-600 bg-red-50",
    green: "text-green-600 bg-green-50"
  };

  return (
    <div className={`rounded-xl p-5 shadow ${map[color]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-3xl font-extrabold mt-2">{value}</p>
    </div>
  );
}
