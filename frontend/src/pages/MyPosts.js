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

  /* STATS */

  const total = items.length;
  const returned = items.filter(i => i.status === "returned").length;
  const active = items.filter(i => i.status !== "returned").length;

  if (loading) {

    return (
      <div className="p-10 text-center text-lg font-semibold">
        Loading your posts...
      </div>
    );

  }

  return (

    <div className="p-6 max-w-6xl mx-auto">

      {/* HEADER */}

      <h1 className="text-3xl font-bold mb-6">
        My Posts
      </h1>


      {/* STATS */}

      <div className="grid md:grid-cols-3 gap-4 mb-8">

        <StatCard title="Total Posts" value={total} />
        <StatCard title="Active Items" value={active} />
        <StatCard title="Returned Items" value={returned} />

      </div>


      {/* EMPTY STATE */}

      {items.length === 0 && (

        <div className="bg-white shadow rounded-xl p-10 text-center text-gray-500">
          You haven't posted any items yet.
        </div>

      )}


      {/* POSTS GRID */}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {items.map(item => {

          const image =
            item.images?.length > 0
              ? getImageUrl(item.images[0])
              : null;

          return (

            <div
              key={item._id}
              className="bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition overflow-hidden"
            >

              {image && (

                <img
                  src={image}
                  alt={item.title}
                  className="h-44 w-full object-cover"
                />

              )}

              <div className="p-4">

                {/* TYPE BADGE */}

                <div className="flex justify-between items-center mb-2">

                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold
                    ${
                      item.type === "lost"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.type?.toUpperCase()}
                  </span>

                  {item.category && (

                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {item.category}
                    </span>

                  )}

                </div>


                {/* TITLE */}

                <h2 className="font-bold text-lg">
                  {item.title}
                </h2>

                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {item.description}
                </p>


                {/* STATUS */}

                <div className="flex items-center justify-between mt-4">

                  <span
                    className={`text-xs px-2 py-1 rounded-full
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


                  {/* ACTIONS */}

                  <div className="flex gap-2">

                    {item.status !== "returned" && (

                      <button
                        onClick={() => markReturned(item._id)}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Returned
                      </button>

                    )}

                    <button
                      onClick={() => deletePost(item._id)}
                      className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

}


/* STAT CARD */

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