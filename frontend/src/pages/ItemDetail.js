import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ItemDetail() {

  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [claimText, setClaimText] = useState("");
  const [showClaim, setShowClaim] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path.startsWith("/") ? "" : "/"}${path}`;
  };

  useEffect(() => {

    const loadItem = async () => {

      try {

        const res = await api.get(`/items/${id}`);

        setItem(res.data);

      } catch {

        toast.error("Failed to load item");

      } finally {

        setLoading(false);

      }

    };

    loadItem();

  }, [id]);

  const submitClaim = async () => {

    if (!claimText) {
      toast.error("Please explain ownership");
      return;
    }

    try {

      await api.post(`/items/${id}/claim`, { message: claimText });

      toast.success("Claim submitted");

      setShowClaim(false);

    } catch {

      toast.error("Claim failed");

    }

  };

  if (loading) return <div className="p-10">Loading...</div>;

  const images = item.images || [];

  return (

    <div className="min-h-screen bg-gray-50 p-8">

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow">

        {images.length > 0 && (

          <img
            src={getImageUrl(images[0])}
            className="w-full h-80 object-cover"
          />

        )}

        <div className="p-6 space-y-4">

          <Link to="/dashboard">← Back</Link>

          <h1 className="text-3xl font-bold">{item.title}</h1>

          <p className="text-gray-600">{item.description}</p>

          <p className="text-sm text-gray-500">
            Category: {item.category}
          </p>

          <p className="text-sm text-gray-500">
            Contact: {item.contact}
          </p>

          {item.type === "found" && user && (

            <div>

              <button
                onClick={() => setShowClaim(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded"
              >
                Claim This Item
              </button>

            </div>

          )}

          {showClaim && (

            <div className="mt-4">

              <textarea
                placeholder="Explain why this item belongs to you..."
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                className="border w-full p-2 rounded"
              />

              <button
                onClick={submitClaim}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
              >
                Submit Claim
              </button>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}