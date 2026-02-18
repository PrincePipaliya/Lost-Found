import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Admin() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const myEmail = localStorage.getItem("email");

  /* ================= LOAD DATA ================= */

  const loadData = async () => {
    try {
      setLoading(true);

      const [itemsRes, usersRes, claimsRes] = await Promise.all([
        api.get("/items"),
        api.get("/users"),
        api.get("/items/admin/claims") // ✅ FIXED ROUTE
      ]);

      setItems(itemsRes.data);
      setUsers(usersRes.data);
      setClaims(claimsRes.data);
    } catch (err) {
      console.error("ADMIN LOAD ERROR:", err);
      toast.error("Failed to load admin data");
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
      console.error("APPROVE ITEM ERROR:", err);
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
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  /* ================= CLAIM ACTIONS ================= */

  const approveClaim = async (itemId, claimIndex) => {
    try {
      await api.put(`/items/${itemId}/claim/${claimIndex}/approve`);
      toast.success("Claim approved");
      loadData();
    } catch (err) {
      console.error("APPROVE CLAIM ERROR:", err);
      toast.error("Failed to approve claim");
    }
  };

  const rejectClaim = async (itemId, claimIndex) => {
    try {
      await api.put(`/items/${itemId}/claim/${claimIndex}/reject`);
      toast.success("Claim rejected");
      loadData();
    } catch (err) {
      console.error("REJECT CLAIM ERROR:", err);
      toast.error("Failed to reject claim");
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
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  if (loading) {
    return <div className="p-6">Loading admin panel...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      <h1 className="text-4xl font-extrabold">Admin Dashboard</h1>

      {/* ================= ITEMS ================= */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Items</h2>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
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
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Approve
                  </button>
                )}

                <button
                  onClick={() => deleteItem(item._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CLAIMS ================= */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          AI Claim Review
        </h2>

        {claims.length === 0 ? (
          <p className="text-gray-500">No claim requests yet.</p>
        ) : (
          <div className="space-y-6">
            {claims.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded-xl shadow"
              >
                <h3 className="font-bold text-lg">
                  {item.title}
                </h3>

                {item.claims.map((claim, index) => {
                  const confidenceColor =
                    claim.confidence >= 80
                      ? "text-green-600"
                      : claim.confidence >= 50
                      ? "text-yellow-600"
                      : "text-red-600";

                  return (
                    <div
                      key={index}
                      className="border rounded p-4 mt-4 bg-gray-50"
                    >
                      <p className="font-semibold">
                        {claim.userId?.name} ({claim.userId?.email})
                      </p>

                      <p className={`font-bold mt-1 ${confidenceColor}`}>
                        AI Confidence: {claim.confidence || 0}%
                      </p>

                      <ul className="list-disc ml-5 mt-2 text-sm">
                        {claim.answers.map((ans, i) => (
                          <li key={i}>{ans}</li>
                        ))}
                      </ul>

                      {claim.status === "pending" ? (
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() =>
                              approveClaim(item._id, index)
                            }
                            className="bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              rejectClaim(item._id, index)
                            }
                            className="bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">
                          Status: {claim.status.toUpperCase()}
                        </p>
                      )}
                    </div>
                  );
                })}
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

        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
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
      </section>
    </div>
  );
}
