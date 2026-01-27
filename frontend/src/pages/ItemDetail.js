import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    api.get(`/items/public/${id}`).then(res => setItem(res.data));
  }, [id]);

  if (!item) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{item.title}</h1>
      <p className="mt-2">{item.description}</p>
      <p className="mt-4 font-semibold">Contact: {item.contact}</p>
    </div>
  );
}
