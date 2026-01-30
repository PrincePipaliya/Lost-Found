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
  const [questions, setQuestions] = useState([""]);
  <h3 className="font-semibold mt-4">Verification Questions</h3>

{questions.map((q, i) => (
  <input
    key={i}
    value={q}
    onChange={(e) => {
      const copy = [...questions];
      copy[i] = e.target.value;
      setQuestions(copy);
    }}
    placeholder={`Question ${i + 1}`}
    className="border p-2 w-full mb-2"
  />
))}

<button
  type="button"
  onClick={() => setQuestions([...questions, ""])}
  className="text-blue-600 text-sm"
>
  + Add question
</button>


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
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("type", type);
    form.append("contact", contact);
    if (image) form.append("image", image);

    try {
      await api.post("/items", form);
      toast.success("Item submitted for approval 🕒");

      // reset
      setTitle("");
      setDescription("");
      setContact("");
      setImage(null);

      if (onPosted) onPosted();

      // refresh page after submit
      setTimeout(() => {
        window.location.reload();
      }, 800);

    } catch {
      toast.error("Failed to submit item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white p-4 rounded shadow mb-6 animate-fadeInUp"
    >
      <h2 className="font-bold mb-3">Post Lost / Found Item</h2>

      <input
        className="border p-2 w-full mb-2 rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="border p-2 w-full mb-2 rounded"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
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
        className="mb-2"
        onChange={(e) => setImage(e.target.files[0])}
      />

      {/* 📱 MOBILE NUMBER FIELD */}
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]{10}"
        maxLength="10"
        className="border p-2 w-full mb-3 rounded"
        placeholder="Mobile number (10 digits)"
        value={contact}
        onChange={(e) =>
          setContact(e.target.value.replace(/\D/g, ""))
        }
        required
      />

      <button
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded
          hover:bg-blue-700 active:scale-95 transition
          disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
