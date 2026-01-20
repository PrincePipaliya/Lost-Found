import { useState } from "react";
import api from "../services/api";

export default function PostItem({ onPosted }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("lost");
  const [contact, setContact] = useState("");
  const [image, setImage] = useState(null);

  const submit = async (e) => {
    e.preventDefault();

    if (!title || !description || !contact) {
      alert("All fields required");
      return;
    }

    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("type", type);
    form.append("contact", contact);
    if (image) form.append("image", image);

    try {
      await api.post("/items", form);
      alert("Item posted");
      setTitle("");
      setDescription("");
      setContact("");
      setImage(null);
      onPosted();
    } catch {
      alert("Post failed");
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white p-4 rounded shadow mb-6"
    >
      <h2 className="font-bold mb-3">Post Lost / Found Item</h2>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-2"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <select
        className="border p-2 w-full mb-2"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>

      <input
        type="file"
        className="mb-2"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <input
        className="border p-2 w-full mb-3"
        placeholder="Contact info"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
}
