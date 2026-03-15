import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PostItem from "../components/PostItem";
import toast from "react-hot-toast";

export default function Dashboard() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);

  const loadItems = async () => {

    try {

      const res = await api.get("/items");
      setItems(res.data);

    } catch {

      toast.error("Failed to load items");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    loadItems();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return null;
    return `http://localhost:5000${path}`;
  };

  if (loading) {

    return (
      <div className="p-10 text-center text-lg font-semibold">
        Loading items...
      </div>
    );

  }

  return (

    <div className="min-h-screen p-6 bg-gray-50">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-3xl font-bold">
          Lost & Found Dashboard
        </h1>

        <button
          onClick={() => setShowPost(!showPost)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showPost ? "Close Post Form" : "Post New Item"}
        </button>

      </div>


      {/* POST FORM */}

      {showPost && (

        <div className="bg-white rounded-xl shadow p-6 mb-8 animate-fadeIn">

          <PostItem onPosted={() => {
            setShowPost(false);
            loadItems();
          }} />

        </div>

      )}


      {/* EMPTY STATE */}

      {items.length === 0 && (

        <div className="text-center text-gray-500 mt-20">
          No items posted yet.
        </div>

      )}


      {/* ITEMS GRID */}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {items.map(item => {

          const image =
            item.images?.length > 0
              ? getImageUrl(item.images[0])
              : null;

          return (

            <div
              key={item._id}
              className="bg-white rounded-xl shadow hover:shadow-lg hover:-translate-y-1 transition overflow-hidden"
            >

              {image && (

                <img
                  src={image}
                  alt={item.title}
                  className="h-48 w-full object-cover"
                />

              )}

              <div className="p-4">

                {/* TYPE BADGE */}

                <div className="flex items-center justify-between mb-2">

                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold
                    ${
                      item.type === "lost"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.type.toUpperCase()}
                  </span>

                  {item.category && (

                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {item.category}
                    </span>

                  )}

                </div>

                <h2 className="font-bold text-lg mb-1">
                  {item.title}
                </h2>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </p>

                <Link
                  to={`/items/${item._id}`}
                  className="block mt-4 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
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