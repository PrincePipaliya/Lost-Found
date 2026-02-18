import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PostItem from "../components/PostItem";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const userId = token
    ? JSON.parse(atob(token.split(".")[1])).id
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

      {/* HERO */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-fadeInUp">
        <h1 className="text-3xl font-extrabold">
          <span className="text-blue-600">we</span>
          <span className="text-gray-900">FOUND</span>
          <span className="text-green-600">it</span>
        </h1>

        <p className="text-yellow-600 text-sm mt-2">
          Items require admin approval before appearing publicly.
        </p>

        <p className="text-gray-600 mt-1">
          Secure AI-powered ownership verification enabled 🔐
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Items" value={items.length} />
        <StatCard title="Lost Items" value={lostCount} color="red" />
        <StatCard title="Found Items" value={foundCount} color="green" />
      </div>

      {/* POST ITEM */}
      <div className="animate-fadeInUp mb-8">
        <PostItem onPosted={loadItems} />
      </div>

      {/* FILTER */}
      <div className="flex items-center gap-3 mb-6 animate-fadeInUp">
        <span className="font-semibold text-gray-700">Filter:</span>
        <select
          className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400"
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
        <div className="text-center mt-20 animate-fadeInUp">
          <p className="text-gray-500 text-lg">No items found 🚀</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredItems.map((item, i) => {

            const isOwner =
              item.userId === userId ||
              item.userId?._id === userId;

            const isLost = item.type === "lost";
            const isFound = item.type === "found";

            return (
              <div
                key={item._id}
                style={{ animationDelay: `${i * 60}ms` }}
                className="bg-white rounded-2xl shadow-lg p-5
                  hover:shadow-2xl hover:-translate-y-2 transition-all
                  animate-cardFade border border-gray-100"
              >
                {item.image && (
                  <img
                    src={`http://localhost:5000/${item.image}`}
                    alt={item.title}
                    className="h-40 w-full object-cover rounded-xl mb-4"
                  />
                )}

                <h3 className="text-lg font-bold text-gray-800">
                  {item.title}
                </h3>

                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {item.description}
                </p>

                {/* BADGES */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full
                      ${
                        isLost
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                  >
                    {item.type.toUpperCase()}
                  </span>

                  {item.claimed && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                      CLAIMED
                    </span>
                  )}

                  {isOwner && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                      YOUR ITEM
                    </span>
                  )}
                </div>

                {/* SMART ACTION SECTION */}
                <div className="mt-4">

                  {isLost && !item.claimed && !isOwner && (
                    <p className="text-sm text-gray-500 text-center">
                      Waiting for someone to report finding this item
                    </p>
                  )}

                  {isLost && isOwner && (
                    <Link
                      to={`/items/${item._id}`}
                      className="block text-center bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                      Review Finder Claims
                    </Link>
                  )}

                  {isFound && !item.claimed && (
                    <Link
                      to={`/items/${item._id}`}
                      className="block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Answer Owner Questions
                    </Link>
                  )}

                  {item.claimed && (
                    <p className="text-sm text-green-600 font-semibold text-center">
                      This item has been successfully matched
                    </p>
                  )}

                </div>

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
    <div
      className={`rounded-2xl p-5 shadow-lg hover:shadow-xl transition animate-fadeInUp ${map[color]}`}
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="text-3xl font-extrabold mt-2">{value}</p>
    </div>
  );
}
