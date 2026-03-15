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

  return (

    <div className="p-6 max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Returned Items
      </h1>

      {items.length === 0 && (
        <p className="text-gray-500 text-center">
          No returned items yet.
        </p>
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
              className="bg-white rounded-xl shadow p-4"
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

              <p className="text-sm mt-2">
                {item.description}
              </p>

              <div className="mt-4">

                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                  RETURNED
                </span>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

}