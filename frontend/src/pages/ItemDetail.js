import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        setItem(res.data);
      } catch (err) {
        toast.error("Item not found");
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg animate-pulse">
          Loading item details...
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl font-semibold text-gray-600">
          Item not found
        </p>
        <Link
          to="/dashboard"
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 animate-fadeInUp">

        {/* BACK */}
        <Link
          to="/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back
        </Link>

        {/* IMAGE */}
        {item.image && (
          <img
            src={`http://localhost:5000/${item.image}`}
            alt={item.title}
            className="w-full h-80 object-cover rounded-lg mt-4 mb-6"
          />
        )}

        {/* TITLE */}
        <h1 className="text-3xl font-extrabold text-gray-800">
          {item.title}
        </h1>

        {/* TYPE + STATUS */}
        <div className="flex items-center gap-3 mt-3">
          <span
            className={`px-3 py-1 text-sm font-bold rounded-full
              ${
                item.type === "lost"
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
          >
            {item.type.toUpperCase()}
          </span>

          <span
            className={`px-3 py-1 text-sm font-bold rounded-full
              ${
                item.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
          >
            {item.status.toUpperCase()}
          </span>
        </div>

        {/* DESCRIPTION */}
        <p className="text-gray-700 mt-6 leading-relaxed">
          {item.description}
        </p>

        {/* CONTACT */}
        <div className="mt-6 border-t pt-4">
          <p className="text-sm text-gray-500">Contact Information</p>
          <p className="text-lg font-semibold text-gray-800 mt-1">
            {item.contact}
          </p>
        </div>
      </div>
    </div>
  );
}
