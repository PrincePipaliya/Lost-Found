import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ItemDetail() {

  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (path) => {
    if (!path) return null;
    return `http://localhost:5000${path}`;
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

  if (loading) {
    return (
      <div className="p-10 text-center text-lg font-semibold">
        Loading item...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-10 text-center text-red-500">
        Item not found
      </div>
    );
  }

  const image =
    item.images?.length > 0
      ? getImageUrl(item.images[0])
      : null;

  return (

    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-6xl mx-auto">

        {/* BACK BUTTON */}

        <Link
          to="/dashboard"
          className="text-blue-600 hover:underline"
        >
          ← Back
        </Link>


        {/* MAIN CARD */}

        <div className="bg-white rounded-xl shadow-lg mt-4 overflow-hidden grid md:grid-cols-2">

          {/* IMAGE */}

          <div className="bg-gray-100 flex items-center justify-center">

            {image ? (

              <img
                src={image}
                alt={item.title}
                className="h-[420px] object-contain p-6 hover:scale-105 transition"
              />

            ) : (

              <div className="text-gray-400">
                No image available
              </div>

            )}

          </div>


          {/* DETAILS */}

          <div className="p-8 flex flex-col justify-between">

            <div>

              {/* TYPE BADGE */}

              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold
                ${
                  item.type === "lost"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {item.type?.toUpperCase()}
              </span>


              {/* TITLE */}

              <h1 className="text-3xl font-bold mt-3">
                {item.title}
              </h1>


              {/* DESCRIPTION */}

              <p className="text-gray-600 mt-3">
                {item.description}
              </p>


              {/* META */}

              <div className="mt-6 space-y-2 text-sm text-gray-600">

                {item.category && (

                  <p>
                    <span className="font-semibold">
                      Category:
                    </span>{" "}
                    {item.category}
                  </p>

                )}

                {item.user?.name && (

                  <p>
                    <span className="font-semibold">
                      Posted by:
                    </span>{" "}
                    {item.user.name}
                  </p>

                )}

              </div>

            </div>


            {/* CONTACT CARD */}

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">

              <p className="text-sm text-gray-600">
                Contact Owner
              </p>

              <p className="text-lg font-semibold text-blue-700">
                {item.contact}
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}