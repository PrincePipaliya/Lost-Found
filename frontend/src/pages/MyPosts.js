import { useEffect, useState } from "react";
import api from "../services/api";

export default function MyPosts() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/items/mine")
      .then(res => setItems(res.data.filter(i => i.mine)))
      .catch(() => {});
  }, []);
<button
  onClick={() => api.delete(`/items/${item._id}/own`)}
  className="px-3 py-1 bg-red-500 text-white rounded"
>
  Delete
</button>

  return (
    <div className="min-h-screen p-6 animate-fadeInUp">
      <h1 className="text-3xl font-bold mb-6">My Posts</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">You haven’t posted anything yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item._id} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
