
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "lost",
    location: ""
  });

  useEffect(() => {
    axios.get("http://localhost:5000/api/items")
      .then(res => setItems(res.data));
  }, []);

  const submitItem = async () => {
    await axios.post("http://localhost:5000/api/items", form);
    window.location.reload();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Lost & Found</h1>

      <input placeholder="Title" onChange={e => setForm({ ...form, title: e.target.value })} />
      <input placeholder="Location" onChange={e => setForm({ ...form, location: e.target.value })} />
      <textarea placeholder="Description" onChange={e => setForm({ ...form, description: e.target.value })} />
      
      <select onChange={e => setForm({ ...form, type: e.target.value })}>
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>

      <button onClick={submitItem}>Submit</button>

      <hr />

      {items.map(item => (
        <div key={item._id}>
          <h3>{item.title} ({item.type})</h3>
          <p>{item.description}</p>
          <small>{item.location}</small>
        </div>
      ))}
    </div>
  );
}
