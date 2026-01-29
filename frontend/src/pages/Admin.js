import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Admin() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const myEmail = localStorage.getItem("email");

  /* LOAD DATA */
  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsRes, usersRes] = await Promise.all([
        api.get("/items"),
        api.get("/users")
      ]);

      setItems(itemsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
      } else {
        toast.error("Failed to load admin data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= ITEM ACTIONS ================= */

  const approveItem = async (id) => {
    try {
      await api.put(`/items/${id}/approve`);
      toast.success("Item approved");
      loadData();
    } catch (err) {
      toast.error("Failed to approve item");
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete item permanently?")) return;

    try {
      await api.delete(`/items/${id}`);
      toast.success("Item deleted");
      loadData();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
      } else {
        toast.error(
          err.response?.data?.message || "Failed to delete item"
        );
      }
    }
  };

  /* ================= USER ROLE ================= */

  const updateRole = async (id, role, email) => {
    if (email === myEmail && role === "user") {
      toast.error("You cannot demote yourself");
      return;
    }

    try {
      await api.put(`/users/${id}/role`, { role });
      toast.success("Role updated");
      loadData();
    } catch {
      toast.error("Failed to update role");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading admin panel...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">

      {/* HEADER */}
      <h1 className="text-4xl font-extrabold animate-fadeInUp">
        Admin Dashboard
      </h1>

      {/* ================= ITEMS ================= */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          Items
        </h2>

        {items.length === 0 ? (
          <p className="text-gray-500">No items found.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <div
                key={item._id}
                style={{ animationDelay: `${i * 50}ms` }}
                className="bg-white p-4 rounded-xl shadow
                  flex justify-between items-center animate-cardFade"
              >
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    {item.type.toUpperCase()} • {item.status.toUpperCase()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {item.status === "pending" && (
                    <button
                      onClick={() => approveItem(item._id)}
                      className="px-3 py-1 bg-green-500 text-white rounded
                        hover:bg-green-600 transition"
                    >
                      Approve
                    </button>
                  )}

                  <button
                    onClick={() => deleteItem(item._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded
                      hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= USERS ================= */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          User Management
        </h2>

        {users.length === 0 ? (
          <p className="text-gray-500">No users found.</p>
        ) : (
          <div className="space-y-3">
            {users.map((user, i) => (
              <div
                key={user._id}
                style={{ animationDelay: `${i * 50}ms` }}
                className="bg-white p-4 rounded-xl shadow
                  flex justify-between items-center animate-cardFade"
              >
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full
                      ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {user.role.toUpperCase()}
                  </span>

                  {user.role === "admin" ? (
                    <button
                      onClick={() =>
                        updateRole(user._id, "user", user.email)
                      }
                      className="text-red-600 hover:underline text-sm"
                    >
                      Demote
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        updateRole(user._id, "admin", user.email)
                      }
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Promote
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
