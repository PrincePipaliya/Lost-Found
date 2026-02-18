import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [myClaim, setMyClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  // 🔐 Decode logged-in user ID safely
  let loggedInUserId = null;
  if (token) {
    try {
      loggedInUserId = JSON.parse(
        atob(token.split(".")[1])
      ).id;
    } catch {
      loggedInUserId = null;
    }
  }

  useEffect(() => {
    const loadItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        setItem(res.data);

        if (res.data.verificationQuestions?.length > 0) {
          setAnswers(res.data.verificationQuestions.map(() => ""));
        }

        // 🔎 Detect if user already submitted claim
        if (isLoggedIn && res.data.claims) {
          const existingClaim = res.data.claims.find(
            (c) =>
              (typeof c.userId === "string"
                ? c.userId
                : c.userId?._id) === loggedInUserId
          );

          if (existingClaim) {
            setMyClaim(existingClaim);
          }
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

    if (answers.some((a) => !a.trim())) {
      toast.error("Please answer all questions");
      return;
    }

    try {
      const res = await api.post(`/items/${id}/claim`, {
        answers,
      });

      toast.success(
        `Claim submitted! AI Confidence: ${res.data.confidence}%`
      );

      window.location.reload();

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit claim"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading item...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Item not found
      </div>
    );
  }

  // 🔐 Detect if logged-in user is item owner
  const isOwner =
    loggedInUserId &&
    item.userId &&
    (typeof item.userId === "string"
      ? item.userId
      : item.userId._id) === loggedInUserId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg animate-fadeInUp">

        <Link to="/dashboard" className="text-blue-600 text-sm">
          ← Back
        </Link>

        {/* IMAGE */}
        {item.image && (
          <img
            src={`http://localhost:5000/${item.image}`}
            alt={item.title}
            className="w-full h-80 object-cover rounded-xl mt-4"
          />
        )}

        {/* TITLE */}
        <h1 className="text-3xl font-bold mt-6">
          {item.title}
        </h1>

        <p className="mt-4 text-gray-700">
          {item.description}
        </p>

        {/* BADGES */}
        <div className="mt-4 flex gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-bold
            ${item.type === "lost"
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
            }`}>
            {item.type.toUpperCase()}
          </span>

          {item.claimed && (
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
              CLAIMED
            </span>
          )}
        </div>

        {/* CONTACT (only shown if backend allows) */}
        {item.contact && (
          <div className="mt-6 border-t pt-4">
            <p className="text-sm text-gray-500">
              Contact Information
            </p>
            <p className="text-lg font-semibold">
              {item.contact}
            </p>
          </div>
        )}

        {/* ================= CLAIM FORM ================= */}
        {isLoggedIn &&
          !isOwner &&           // ❌ OWNER CANNOT CLAIM
          !item.claimed &&
          item.verificationQuestions?.length > 0 &&
          !myClaim && (
            <form
              onSubmit={submitClaim}
              className="mt-10 border-t pt-6"
            >
              <h2 className="text-xl font-bold mb-4">
                🔐 AI Ownership Verification
              </h2>

              {item.verificationQuestions.map((q, i) => (
                <div key={i} className="mb-4">
                  <label className="block mb-1 font-medium">
                    {q.question}
                  </label>
                  <input
                    value={answers[i]}
                    onChange={(e) => {
                      const copy = [...answers];
                      copy[i] = e.target.value;
                      setAnswers(copy);
                    }}
                    className="w-full border p-2 rounded"
                  />
                </div>
              ))}

              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                Submit Claim
              </button>
            </form>
          )}

        {/* ================= OWNER MESSAGE ================= */}
        {isOwner && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-700">
              You posted this item.
            </p>
          </div>
        )}

        {/* ================= CLAIM STATUS ================= */}
        {myClaim && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-2">
              Your Claim Status
            </h3>

            <p>
              AI Confidence:{" "}
              <span className="font-semibold">
                {myClaim.confidence}%
              </span>
            </p>

            <p className="mt-2">
              Status:{" "}
              <span className={`font-semibold
                ${myClaim.status === "approved"
                  ? "text-green-600"
                  : myClaim.status === "rejected"
                  ? "text-red-600"
                  : "text-yellow-600"
                }`}>
                {myClaim.status.toUpperCase()}
              </span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
