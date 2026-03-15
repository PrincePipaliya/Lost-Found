import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function MyPosts() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (path) => {
    if (!path) return null;
    return `http://localhost:5000${path}`;
  };

  /* LOAD POSTS */

  const loadPosts = async () => {

    try {

      setLoading(true);

      const res = await api.get("/items/mine/list");

      const data =
        Array.isArray(res.data)
          ? res.data
          : res.data.items || [];

      setItems(data);

    } catch (error) {

      console.error(error);
      toast.error("Failed to load posts");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    loadPosts();
  }, []);

  /* MARK RETURNED */

  const markReturned = async (id) => {

    if (!window.confirm("Mark this item as returned to owner?")) return;

    try {

      await api.put(`/items/${id}/returned`);

      toast.success("Item marked as returned");

      loadPosts();

    } catch (error) {

      console.error(error);
      toast.error("Update failed");

    }

  };

  /* DELETE POST */

  const deletePost = async (id) => {

    if (!window.confirm("Delete this post permanently?")) return;

    try {

      await api.delete(`/items/${id}`);

      toast.success("Post deleted");

      loadPosts();

    } catch (error) {

      console.error(error);
      toast.error("Delete failed");

    }

  };

  if (loading) {

    return (
      <div className="p-10 text-center text-lg font-semibold">
        Loading your posts...
      </div>
    );

  }

  return (

    <div className="p-6 max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        My Posts
      </h1>

      {items.length === 0 && (

        <div className="text-center text-gray-500 mt-10">
          You haven't posted any items yet.
        </div>

      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {items.map(item => {

          const image =
            item.images?.length > 0
              ? getImageUrl(item.images[0])
              : null;

          return (

            <div
              key={item._id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-4"
            >

              {image && (

                <img
                  src={image}
                  alt={item.title}
                  className="h-40 w-full object-cover rounded mb-3"
                />

              )}

              <h2 className="font-bold text-lg">
                {item.title}
              </h2>

              <p className="text-sm text-gray-500">
                {item.category}
              </p>

              <p className="text-sm mt-2 text-gray-700">
                {item.description}
              </p>

              <div className="flex items-center justify-between mt-4">

                <span
                  className={`text-xs px-2 py-1 rounded
                  ${
                    item.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : item.status === "returned"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.status?.toUpperCase()}
                </span>

                <div>

                  {item.status !== "returned" && (
                    <button
                      onClick={() => markReturned(item._id)}
                      className="text-green-600 text-sm hover:underline mr-4"
                    >
                      Mark Returned
                    </button>
                  )}

                  <button
                    onClick={() => deletePost(item._id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

}