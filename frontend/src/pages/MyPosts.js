import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function MyPosts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/items/mine"); // ✅ USER'S OWN POSTS
      setItems(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
      } else {
        toast.error("Failed to load your posts");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyPosts();
  }, []);

  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await api.delete(`/items/${id}/own`);
      toast.success("Post deleted");
      loadMyPosts();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-6 animate-fadeInUp">
        My Posts
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading your posts...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">
          You haven’t posted anything yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item, i) => (
            <div
              key={item._id}
              style={{ animationDelay: `${i * 60}ms` }}
              className="border rounded-xl p-4 bg-white shadow
                hover:shadow-lg transition animate-cardFade"
            >
              {/* PUBLIC ITEM DETAIL LINK */}
              <Link
                to={`/items/${item._id}`}
                className="font-bold text-lg text-blue-600 hover:underline"
              >
                {item.title}
              </Link>

              <p className="text-sm text-gray-600 mt-1">
                {item.description}
              </p>

              <div className="flex justify-between items-center mt-4">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full
                    ${
                      item.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {item.status.toUpperCase()}
                </span>

                <button
                  onClick={() => deletePost(item._id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
