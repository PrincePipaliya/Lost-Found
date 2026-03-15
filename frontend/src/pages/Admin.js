import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Admin() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  /* ================= LOAD ITEMS ================= */

  const loadItems = async () => {

    try {

      setLoading(true);

      const res = await api.get("/items/admin/all");

      const data =
        Array.isArray(res.data)
          ? res.data
          : res.data.items || [];

      setItems(data);

    } catch (error) {

      console.error("Admin load items error:", error);
      toast.error("Failed to load items");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    loadItems();
  }, []);

  /* ================= ACTIONS ================= */

  const approveItem = async (id) => {

    try {

      await api.put(`/items/${id}/approve`);

      toast.success("Item approved");

      loadItems();

    } catch (error) {

      console.error("Approve error:", error);
      toast.error("Approval failed");

    }

  };

  const deleteItem = async (id) => {

    if (!window.confirm("Delete item permanently?")) return;

    try {

      await api.delete(`/items/admin/${id}`);

      toast.success("Item deleted");

      loadItems();

    } catch (error) {

      console.error("Delete error:", error);
      toast.error("Delete failed");

    }

  };

  /* ================= FILTER ITEMS ================= */

  const filteredItems = items.filter(item => {

    const matchSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase());

    const matchType =
      !filterType || item.type === filterType;

    return matchSearch && matchType;

  });

  const pendingItems = filteredItems.filter(i => i.status === "pending");
  const approvedItems = filteredItems.filter(i => i.status === "approved");

  /* ================= STATS ================= */

  const totalItems = items.length;
  const pendingCount = items.filter(i => i.status === "pending").length;
  const approvedCount = items.filter(i => i.status === "approved").length;
  const lostCount = items.filter(i => i.type === "lost").length;
  const foundCount = items.filter(i => i.type === "found").length;

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="p-8 text-lg font-semibold">
        Loading admin panel...
      </div>
    );
  }

  /* ================= UI ================= */

  return (

    <div className="p-6 max-w-7xl mx-auto space-y-10">

      <h1 className="text-4xl font-extrabold">
        Admin Dashboard
      </h1>

      {/* STATS */}

      <div className="grid md:grid-cols-5 gap-4">

        <StatCard title="Total Items" value={totalItems} />
        <StatCard title="Pending Approval" value={pendingCount} />
        <StatCard title="Approved Items" value={approvedCount} />
        <StatCard title="Lost Items" value={lostCount} />
        <StatCard title="Found Items" value={foundCount} />

      </div>

      {/* SEARCH */}

      <div className="flex flex-wrap gap-3 items-center">

        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-lg w-64"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="">All Types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>

      </div>

      {/* PENDING */}

      <section>

        <h2 className="text-2xl font-bold mb-4">
          Pending Approval
        </h2>

        {pendingItems.length === 0 && (
          <p className="text-gray-500">No pending items</p>
        )}

        <div className="space-y-3">

          {pendingItems.map(item => (

            <div
              key={item._id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >

              <div>

                <h3 className="font-bold text-lg">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {item.type?.toUpperCase()}
                </p>

              </div>

              <div className="flex gap-2">

                <button
                  onClick={() => approveItem(item._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => deleteItem(item._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

                <Link
                  to={`/items/${item._id}`}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  View
                </Link>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* APPROVED */}

      <section>

        <h2 className="text-2xl font-bold mb-4">
          Approved Items
        </h2>

        {approvedItems.length === 0 && (
          <p className="text-gray-500">No approved items</p>
        )}

        <div className="space-y-3">

          {approvedItems.map(item => (

            <div
              key={item._id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >

              <div>

                <h3 className="font-bold text-lg">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {item.type?.toUpperCase()}
                </p>

              </div>

              <div className="flex gap-2">

                <Link
                  to={`/items/${item._id}`}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  View
                </Link>

                <button
                  onClick={() => deleteItem(item._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>

  );

}

/* ================= STAT CARD ================= */

function StatCard({ title, value }) {

  return (

    <div className="bg-white p-5 rounded-xl shadow text-center">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <p className="text-3xl font-bold mt-1">
        {value}
      </p>

    </div>

  );

}