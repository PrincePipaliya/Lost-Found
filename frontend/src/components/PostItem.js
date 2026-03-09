import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import LocationPicker from "./LocationPicker";

export default function PostItem({ onPosted }) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("lost");
  const [category, setCategory] = useState("");
  const [contact, setContact] = useState("");
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const isValidMobile = (number) => {
    return /^[0-9]{10}$/.test(number);
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const submit = async (e) => {

    e.preventDefault();

    if (!title || !description || !contact || !category) {
      toast.error("All fields are required");
      return;
    }

    if (!isValidMobile(contact)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    if (!location) {
      toast.error("Please select item location on map");
      return;
    }

    setLoading(true);

    const form = new FormData();

    form.append("title", title);
    form.append("description", description);
    form.append("type", type);
    form.append("category", category);
    form.append("contact", contact);

    form.append("lat", location.lat);
    form.append("lng", location.lng);

    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        form.append("images", images[i]);
      }
    }

    try {

      await api.post("/items", form);

      toast.success("Item submitted for approval 🕒");

      setTitle("");
      setDescription("");
      setCategory("");
      setContact("");
      setImages([]);
      setLocation(null);

      if (onPosted) onPosted();

    } catch (err) {

      console.error(err);
      toast.error("Failed to submit item");

    } finally {

      setLoading(false);

    }

  };

  return (

    <form
      onSubmit={submit}
      className="bg-white p-6 rounded-xl shadow mb-8 space-y-4"
    >

      <h2 className="font-bold text-lg">
        Post Lost / Found Item
      </h2>

      <input
        className="border p-2 w-full rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="border p-2 w-full rounded"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <select
        className="border p-2 w-full rounded"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>

      {/* CATEGORY */}

      <select
        className="border p-2 w-full rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      >
        <option value="">Select Category</option>
        <option value="electronics">Electronics</option>
        <option value="wallet">Wallet</option>
        <option value="documents">Documents</option>
        <option value="keys">Keys</option>
        <option value="bags">Bags</option>
        <option value="clothing">Clothing</option>
        <option value="pets">Pets</option>
        <option value="jewelry">Jewelry</option>
        <option value="other">Other</option>
      </select>

      <input
        type="file"
        multiple
        onChange={handleImageChange}
        className="w-full"
      />

      {images.length > 0 && (

        <div className="flex gap-2 flex-wrap">

          {Array.from(images).map((img, i) => (

            <img
              key={i}
              src={URL.createObjectURL(img)}
              alt="preview"
              className="h-20 w-20 object-cover rounded"
            />

          ))}

        </div>

      )}

      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]{10}"
        maxLength="10"
        className="border p-2 w-full rounded"
        placeholder="Mobile number (10 digits)"
        value={contact}
        onChange={(e) =>
          setContact(e.target.value.replace(/\D/g, ""))
        }
        required
      />

      <div>

        <h3 className="font-semibold mb-2">
          Select Item Location
        </h3>

        <LocationPicker
          onLocationSelect={(loc) => setLocation(loc)}
        />

      </div>

      <button
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit Item"}
      </button>

    </form>

  );

}