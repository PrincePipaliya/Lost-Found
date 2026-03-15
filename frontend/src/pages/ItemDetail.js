import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ItemDetail() {

  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {

    const loadItem = async () => {

      try {

        const res = await api.get(`/items/${id}`);
        setItem(res.data);

      } catch {

        toast.error("Failed to load item");

      }

    };

    loadItem();

  }, [id]);

  if (!item) return <div className="p-10">Loading...</div>;

  const image =
    item.images?.length > 0
      ? `http://localhost:5000${item.images[0]}`
      : null;

  return (

    <div className="p-8 max-w-3xl mx-auto">

      <Link to="/dashboard">← Back</Link>

      {image && (
        <img
          src={image}
          className="w-full h-80 object-cover rounded mb-4"
        />
      )}

      <h1 className="text-3xl font-bold">
        {item.title}
      </h1>

      <p className="mt-2">
        {item.description}
      </p>

      <p className="text-sm text-gray-500 mt-3">
        Category: {item.category}
      </p>

      <p className="text-sm text-gray-500">
        Contact: {item.contact}
      </p>

    </div>

  );

}