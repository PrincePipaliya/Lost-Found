import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    const loadItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        setItem(res.data);

        if (res.data.verificationQuestions) {
          setAnswers(
            res.data.verificationQuestions.map(() => "")
          );
        }
      } catch {
        toast.error("Item not found");
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id]);

  const submitClaim = async (e) => {
    e.preventDefault();

    if (answers.some(a => !a.trim())) {
      toast.error("Please answer all questions");
      return;
    }

    try {
      await api.post(`/items/${id}/claim`, { answers });
      toast.success("Claim submitted for review ✅");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit claim"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Item not found</p>
        <Link to="/dashboard" className="text-blue-600 mt-3">
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow animate-fadeInUp">

        <Link to="/dashboard" className="text-blue-600 text-sm">
          ← Back
        </Link>

        {item.image && (
          <img
            src={`http://localhost:5000/${item.image}`}
            alt={item.title}
            className="w-full h-80 object-cover rounded-lg mt-4"
          />
        )}

        <h1 className="text-3xl font-bold mt-4">{item.title}</h1>

        <p className="mt-4 text-gray-700">{item.description}</p>

        <div className="mt-6">
          <span className="font-semibold">Type:</span>{" "}
          {item.type.toUpperCase()}
        </div>

        {/* 🔐 CLAIM FORM */}
        {isLoggedIn &&
          item.verificationQuestions?.length > 0 &&
          !item.claimed && (
            <form
              onSubmit={submitClaim}
              className="mt-8 border-t pt-6"
            >
              <h2 className="text-xl font-bold mb-4">
                Verify Ownership
              </h2>

              {item.verificationQuestions.map((q, i) => (
                <input
                  key={i}
                  value={answers[i]}
                  onChange={(e) => {
                    const copy = [...answers];
                    copy[i] = e.target.value;
                    setAnswers(copy);
                  }}
                  placeholder={q.question}
                  className="border p-2 w-full mb-3 rounded"
                />
              ))}

              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Submit Claim
              </button>
            </form>
          )}

        {item.claimed && (
          <p className="mt-6 text-green-600 font-semibold">
            ✔ This item has been claimed
          </p>
        )}
      </div>
    </div>
  );
}
