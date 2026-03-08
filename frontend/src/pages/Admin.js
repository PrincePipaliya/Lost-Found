import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Admin() {

  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DATA ================= */

  const loadData = async () => {
    try {

      setLoading(true);

      const [itemsRes, claimsRes] = await Promise.all([
        api.get("/items/admin/all"),
        api.get("/items/admin/claims")
      ]);

      setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      setClaims(Array.isArray(claimsRes.data) ? claimsRes.data : []);

    } catch (err) {

      console.error(err);
      toast.error("Failed to load admin data");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= STATS ================= */

  const totalItems = items.length;

  const lostItems = items.filter(i => i.type === "lost").length;
  const foundItems = items.filter(i => i.type === "found").length;

  const pendingItems = items.filter(i => i.status === "pending").length;
  const approvedItems = items.filter(i => i.status === "approved").length;

  const totalClaims = claims.reduce(
    (acc, item) => acc + (item.claims?.length || 0),
    0
  );

  /* ================= ACTIONS ================= */

  const approveItem = async (id) => {
    try {

      await api.put(`/items/${id}/approve`);
      toast.success("Item approved");

      loadData();

    } catch {

      toast.error("Approval failed");

    }
  };

  const deleteItem = async (id) => {

    if (!window.confirm("Delete item permanently?")) return;

    try {

      await api.delete(`/items/${id}`);
      toast.success("Item deleted");

      loadData();

    } catch {

      toast.error("Delete failed");

    }

  };

  const approveClaim = async (itemId, claimId) => {

    try {

      await api.put(`/items/${itemId}/claims/${claimId}/approve`);
      toast.success("Claim approved");

      loadData();

    } catch {

      toast.error("Claim approval failed");

    }

  };

  const rejectClaim = async (itemId, claimId) => {

    try {

      await api.put(`/items/${itemId}/claims/${claimId}/reject`);
      toast.success("Claim rejected");

      loadData();

    } catch {

      toast.error("Claim rejection failed");

    }

  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="p-8 text-lg">
        Loading dashboard...
      </div>
    );
  }

  /* ================= UI ================= */

  return (

    <div className="p-6 max-w-7xl mx-auto space-y-10">

      <h1 className="text-4xl font-extrabold">
        Admin Analytics Dashboard
      </h1>

      {/* ===== STATS ===== */}

      <div className="grid md:grid-cols-4 gap-4">

        <StatCard
          title="Total Items"
          value={totalItems}
        />

        <StatCard
          title="Pending Approval"
          value={pendingItems}
        />

        <StatCard
          title="Approved Items"
          value={approvedItems}
        />

        <StatCard
          title="Total Claims"
          value={totalClaims}
        />

      </div>

      {/* ===== LOST VS FOUND ===== */}

      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="text-xl font-bold mb-4">
          Lost vs Found Items
        </h2>

        <div className="flex gap-6 text-lg">

          <div className="text-blue-600 font-semibold">
            Lost: {lostItems}
          </div>

          <div className="text-green-600 font-semibold">
            Found: {foundItems}
          </div>

        </div>

      </div>

      {/* ===== ITEMS ===== */}

      <section>

        <h2 className="text-2xl font-bold mb-4">
          Item Moderation
        </h2>

        <div className="space-y-3">

          {items.map(item => (

            <div
              key={item._id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >

              <div>

                <h3 className="font-bold text-lg">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {item.type?.toUpperCase()} • {item.status?.toUpperCase()}
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

      {/* ===== CLAIM REVIEW ===== */}

      <section>

        <h2 className="text-2xl font-bold mb-4">
          AI Claim Review
        </h2>

        {claims.map(item => (

          <div
            key={item._id}
            className="bg-white p-4 rounded-xl shadow mb-6"
          >

            <h3 className="font-bold text-lg">
              {item.title}
            </h3>

            {Array.isArray(item.claims) && item.claims.map(claim => {

              const confidence = claim.confidence || 0;

              const color =
                confidence > 80
                  ? "text-green-600"
                  : confidence > 50
                  ? "text-yellow-600"
                  : "text-red-600";

              return (

                <div
                  key={claim._id}
                  className="border p-4 rounded mt-4 bg-gray-50"
                >

                  <p className="font-semibold">
                    {claim.userId?.name || "Unknown"} ({claim.userId?.email || "No Email"})
                  </p>

                  <p className={`font-bold ${color}`}>
                    AI Confidence: {confidence}%
                  </p>

                  <ul className="list-disc ml-6 text-sm mt-2">

                    {Array.isArray(claim.answers) &&
                      claim.answers.map((a, i) => (
                        <li key={i}>{String(a)}</li>
                      ))}

                  </ul>

                  {claim.status === "pending" && (

                    <div className="flex gap-3 mt-3">

                      <button
                        onClick={() =>
                          approveClaim(item._id, claim._id)
                        }
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          rejectClaim(item._id, claim._id)
                        }
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Reject
                      </button>

                    </div>

                  )}

                </div>

              );

            })}

          </div>

        ))}

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