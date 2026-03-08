import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ClaimItem() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, []);

  const loadItem = async () => {
    try {

      const res = await api.get(`/items/${id}`);

      const qs = res.data.verificationQuestions || [];

      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(""));

    } catch (err) {

      toast.error("Failed to load verification questions");

    } finally {

      setLoading(false);

    }
  };

  const handleChange = (index, value) => {

    const newAnswers = [...answers];
    newAnswers[index] = value;

    setAnswers(newAnswers);

  };

  const submitClaim = async () => {

    try {

      await api.post(`/items/${id}/claim`, {
        answers
      });

      toast.success("Claim submitted for review");

      navigate("/dashboard");

    } catch (err) {

      toast.error(
        err.response?.data?.message || "Claim submission failed"
      );

    }

  };

  if (loading)
    return <div className="p-6">Loading questions...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">

      <h1 className="text-3xl font-bold">
        Claim This Item
      </h1>

      {questions.length === 0 ? (
        <p>No verification questions available.</p>
      ) : (
        <>
          {questions.map((q, i) => (
            <div key={i} className="space-y-2">

              <label className="font-semibold">
                {q.question}
              </label>

              <input
                type="text"
                value={answers[i]}
                onChange={(e) =>
                  handleChange(i, e.target.value)
                }
                className="w-full border p-2 rounded"
              />

            </div>
          ))}

          <button
            onClick={submitClaim}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit Claim
          </button>
        </>
      )}

    </div>
  );
}