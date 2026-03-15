import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function PostItem({ onPosted }) {

  const [title,setTitle] = useState("");
  const [description,setDescription] = useState("");
  const [type,setType] = useState("lost");
  const [category,setCategory] = useState("");
  const [contact,setContact] = useState("");

  const [images,setImages] = useState([]);
  const [preview,setPreview] = useState([]);

  const handleImageChange = (e) => {

    const files = Array.from(e.target.files);

    setImages(files);

    const previews = files.map(file =>
      URL.createObjectURL(file)
    );

    setPreview(previews);

  };

  const submit = async (e)=>{

    e.preventDefault();

    const form = new FormData();

    form.append("title",title);
    form.append("description",description);
    form.append("type",type);
    form.append("category",category);
    form.append("contact",contact);

    images.forEach(file => {
      form.append("images",file);
    });

    try{

      await api.post("/items",form);

      toast.success("Item posted");

      setTitle("");
      setDescription("");
      setCategory("");
      setContact("");
      setImages([]);
      setPreview([]);

      if(onPosted) onPosted();

    }catch{

      toast.error("Failed to post item");

    }

  };

  return(

    <form
      onSubmit={submit}
      className="bg-white p-6 rounded-xl shadow space-y-4"
    >

      <h2 className="font-bold text-lg">
        Post Lost / Found Item
      </h2>

      <input
        placeholder="Title"
        value={title}
        onChange={e=>setTitle(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={e=>setDescription(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />

      <select
        value={type}
        onChange={e=>setType(e.target.value)}
        className="border p-2 w-full rounded"
      >
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>

      <input
        placeholder="Category"
        value={category}
        onChange={e=>setCategory(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />

      <input
        placeholder="Contact"
        value={contact}
        onChange={e=>setContact(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />

      <input
        type="file"
        multiple
        onChange={handleImageChange}
      />

      {preview.length > 0 && (

        <div className="grid grid-cols-3 gap-3">

          {preview.map((img,index)=>(
            <img
              key={index}
              src={img}
              alt="preview"
              className="h-24 w-full object-cover rounded"
            />
          ))}

        </div>

      )}

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit Item
      </button>

    </form>

  );

}