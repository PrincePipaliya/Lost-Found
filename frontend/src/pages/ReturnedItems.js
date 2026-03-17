import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ReturnedItems() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (path) => {
    if (!path) return null;
    return `http://localhost:5000${path}`;
  };

  const loadReturnedItems = async () => {

    try {

      const res = await api.get("/items/returned/all");

      const data =
        Array.isArray(res.data)
          ? res.data
          : res.data.items || [];

      setItems(data);

    } catch (error) {

      console.error(error);
      toast.error("Failed to load returned items");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    loadReturnedItems();
  }, []);

  if (loading) {

    return (
      <div className="p-10 text-center text-lg font-semibold">
        Loading returned items...
      </div>
    );

  }

  const totalReturned = items.length;

  return (

    <div className="p-6 max-w-6xl mx-auto">

      {/* HEADER */}

      <h1 className="text-3xl font-bold mb-2">
        Returned Items
      </h1>

      <p className="text-gray-500 mb-6">
        Items successfully returned to their owners.
      </p>


      {/* STATS */}

      <div className="grid md:grid-cols-3 gap-4 mb-8">

        <StatCard
          title="Total Returned"
          value={totalReturned}
        />

        <StatCard
          title="Success Rate"
          value={`${totalReturned}`}
        />

        <StatCard
          title="Recovered Items"
          value={totalReturned}
        />

      </div>


      {/* EMPTY STATE */}

      {items.length === 0 && (

        <div className="bg-white shadow rounded-xl p-10 text-center text-gray-500">
          No returned items yet.
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

                <div className="flex justify-between items-center mb-2">

                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                    SUCCESS
                  </span>

                  {item.category && (

                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {item.category}
                    </span>

                  )}

                </div>

                <h2 className="font-bold text-lg">
                  {item.title}
                </h2>

                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-4">

                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    RETURNED
                  </span>

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