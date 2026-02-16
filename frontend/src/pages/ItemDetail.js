import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ItemDetail() {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    const loadItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        setItem(res.data);

        if (res.data.verificationQuestions?.length > 0) {
          setAnswers(res.data.verificationQuestions.map(() => ""));
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
      const res = await api.post(`/items/${id}/claim`, { answers });

      setConfidence(res.data.confidence);
      setSubmitted(true);

      toast.success("Claim submitted successfully");
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

        <div className="mt-4 font-semibold">
          Type: {item.type.toUpperCase()}
        </div>

        {/* ================= CLAIM SECTION ================= */}

        {isLoggedIn &&
          item.verificationQuestions?.length > 0 &&
          !item.claimed &&
          !submitted && (
            <form onSubmit={submitClaim} className="mt-8 border-t pt-6">

              <h2 className="text-xl font-bold mb-4">
                🔐 Verify Ownership
              </h2>

              {item.verificationQuestions.map((q, i) => (
                <div key={i} className="mb-4">
                  <label className="block font-medium mb-1">
                    {q.question}
                  </label>
                  <input
                    value={answers[i]}
                    onChange={(e) => {
                      const copy = [...answers];
                      copy[i] = e.target.value;
                      setAnswers(copy);
                    }}
                    className="border p-2 w-full rounded"
                    placeholder="Your answer..."
                  />
                </div>
              ))}

              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Submit Claim
              </button>
            </form>
          )}

        {/* ================= RESULT ================= */}

        {submitted && (
          <div className="mt-6 p-4 rounded-lg bg-blue-50 border">
            <h3 className="font-bold text-lg">
              AI Confidence Score: {confidence}%
            </h3>

            {confidence >= 80 ? (
              <p className="text-green-600 mt-2">
                High ownership confidence 👍
              </p>
            ) : confidence >= 50 ? (
              <p className="text-yellow-600 mt-2">
                Moderate confidence
              </p>
            ) : (
              <p className="text-red-600 mt-2">
                Low confidence
              </p>
            )}

            <p className="text-sm mt-2 text-gray-500">
              Admin will review your claim.
            </p>
          </div>
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
