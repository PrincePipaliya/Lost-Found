import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PostItem from "../components/PostItem";
import MapView from "../components/MapView";
import toast from "react-hot-toast";

export default function Dashboard() {

  const [items, setItems] = useState([]);
  const [nearbyItems, setNearbyItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || null;

  const loadItems = async () => {

    try {

      setLoading(true);

      const query = new URLSearchParams();

      if (search) query.append("search", search);
      if (category) query.append("category", category);

      const res = await api.get(`/items?${query.toString()}`);

      setItems(res.data);

    } catch {

      toast.error("Failed to load items");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    loadItems();
  }, [search, category]);

  const findNearbyItems = () => {

    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      try {

        const res = await api.get(`/items/nearby?lat=${lat}&lng=${lng}`);

        setNearbyItems(res.data);

        toast.success("Nearby items loaded");

      } catch {

        toast.error("Failed to load nearby items");

      }

    });

  };

  const filteredItems = typeFilter
    ? items.filter((i) => i.type === typeFilter)
    : items;

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const categoryIcons = {
    electronics: "📱",
    wallet: "👛",
    documents: "📄",
    keys: "🔑",
    bags: "🎒",
    clothing: "👕",
    pets: "🐶",
    jewelry: "💍",
    other: "📦"
  };

  if (loading) {

    return (
      <div className="p-10 text-center text-lg">
        Loading dashboard...
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">

      {/* HEADER */}

      <div className="bg-white rounded-xl shadow p-6 mb-8">

        <h1 className="text-3xl font-extrabold">
          weFOUNDit
        </h1>

        <p className="text-gray-600 mt-2">
          Community powered Lost & Found system
        </p>

      </div>

      {/* SEARCH + FILTERS */}

      <div className="bg-white p-4 rounded-xl shadow mb-8 flex flex-wrap gap-3">

        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-60"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="wallet">Wallet</option>
          <option value="documents">Documents</option>
          <option value="keys">Keys</option>
          <option value="bags">Bags</option>
          <option value="clothing">Clothing</option>
          <option value="pets">Pets</option>
          <option value="jewelry">Jewelry</option>
          <option value="other">Other</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>

        <button
          onClick={findNearbyItems}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Nearby Items
        </button>

      </div>

      {/* MAP */}

      <div className="bg-white rounded-xl shadow p-6 mb-10">

        <h2 className="text-2xl font-bold mb-4">
          Lost & Found Map
        </h2>

        <MapView items={items} />

      </div>

      {/* POST ITEM */}

      <div className="mb-8">
        <PostItem onPosted={loadItems} />
      </div>

      {/* ITEM GRID */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {filteredItems.map((item) => {

          const imageUrl =
            item.images?.length > 0
              ? getImageUrl(item.images[0])
              : null;

          const icon = categoryIcons[item.category] || "📦";

          return (

            <div
              key={item._id}
              className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden"
            >

              {imageUrl && (

                <img
                  src={imageUrl}
                  alt={item.title}
                  className="h-44 w-full object-cover"
                />

              )}

              <div className="p-4">

                <div className="flex justify-between items-center mb-2">

                  <span className="text-lg">
                    {icon}
                  </span>

                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold
                    ${item.type === "lost"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                      }`}
                  >
                    {item.type.toUpperCase()}
                  </span>

                </div>

                <h2 className="text-lg font-bold">
                  {item.title}
                </h2>

                <p className="text-sm text-gray-500 capitalize">
                  {item.category}
                </p>

                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {item.description}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>

                <Link
                  to={`/items/${item._id}`}
                  className="block mt-4 text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  View Details
                </Link>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

}