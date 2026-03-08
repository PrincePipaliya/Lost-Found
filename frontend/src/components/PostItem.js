import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function PostItem({ onPosted }) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("lost");
  const [contact, setContact] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const isValidMobile = (number) => {
    return /^[0-9]{10}$/.test(number);
  };

  const submit = async (e) => {

    e.preventDefault();

    if (!title || !description || !contact) {
      toast.error("All fields are required");
      return;
    }

    if (!isValidMobile(contact)) {
      toast.error("Enter valid 10 digit mobile number");
      return;
    }

    setLoading(true);

    const form = new FormData();

    form.append("title", title);
    form.append("description", description);
    form.append("type", type);
    form.append("contact", contact);

    /* IMPORTANT FIX */
    if (image) {
      form.append("images", image); // must match backend multer
    }

    try {

      await api.post("/items", form);

      toast.success("Item submitted for approval");

      setTitle("");
      setDescription("");
      setContact("");
      setImage(null);

      if (onPosted) onPosted();

    } catch (err) {

      toast.error("Failed to submit item");

    } finally {

      setLoading(false);

    }

  };

  return (

    <form
      onSubmit={submit}
      className="bg-white p-5 rounded-xl shadow mb-6"
    >

      <h2 className="font-bold text-lg mb-3">
        Post Lost / Found Item
      </h2>

      <input
        className="border p-2 w-full mb-2 rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-2 rounded"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <select
        className="border p-2 w-full mb-2 rounded"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>

      <input
        type="file"
        className="mb-3"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <input
        type="tel"
        maxLength="10"
        className="border p-2 w-full mb-3 rounded"
        placeholder="Mobile number"
        value={contact}
        onChange={(e) =>
          setContact(e.target.value.replace(/\D/g, ""))
        }
      />

      <button
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >

        {loading ? "Submitting..." : "Submit"}

      </button>

    </form>

  );

}