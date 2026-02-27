import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";
import toast from "react-hot-toast";

const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("token")
  }
});

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [myClaim, setMyClaim] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  let loggedInUserId = null;
  if (token) {
    try {
      loggedInUserId = JSON.parse(atob(token.split(".")[1])).id;
    } catch {}
  }

  /* ================= LOAD ITEM ================= */

  useEffect(() => {
    const loadItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        setItem(res.data);

        setAnswers(
          res.data.verificationQuestions?.map(() => "") || []
        );

        if (res.data.claims && loggedInUserId) {
          const claim = res.data.claims.find(
            c =>
              (typeof c.userId === "string"
                ? c.userId
                : c.userId?._id) === loggedInUserId
          );
          if (claim) setMyClaim(claim);
        }

      } catch {
        toast.error("Failed to load item");
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id]);

  /* ================= CHAT ================= */

  useEffect(() => {
    if (!isLoggedIn) return;

    socket.emit("join_room", id);

    api.get(`/items/${id}/chat`)
      .then(res => setMessages(res.data))
      .catch(() => {});

    socket.on("receive_message", data => {
      setMessages(prev => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, [id]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    socket.emit("send_message", {
      roomId: id,
      text: messageInput
    });

    setMessageInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= CLAIM ================= */

  const submitClaim = async e => {
    e.preventDefault();

    if (answers.some(a => !a.trim())) {
      toast.error("Please answer all questions");
      return;
    }

    try {
      const res = await api.post(`/items/${id}/claim`, { answers });
      toast.success(`Confidence: ${res.data.confidence}%`);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Claim failed");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="h-screen flex items-center justify-center">
        Item not found
      </div>
    );
  }

  const isOwner =
    loggedInUserId &&
    (typeof item.userId === "string"
      ? item.userId
      : item.userId._id) === loggedInUserId;

  const canChat =
    isOwner ||
    (myClaim && myClaim.status === "approved");

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* IMAGE */}
        {item.image && (
          <div className="relative">
            <img
              src={`http://localhost:5000/${item.image}`}
              alt={item.title}
              className="w-full h-96 object-cover"
            />
            <span className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold shadow
              ${item.type === "lost"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"}`}>
              {item.type.toUpperCase()}
            </span>
          </div>
        )}

        <div className="p-8 space-y-6">

          <Link to="/dashboard" className="text-blue-600 text-sm">
            ← Back to Dashboard
          </Link>

          <h1 className="text-4xl font-bold text-gray-800">
            {item.title}
          </h1>

          <p className="text-gray-600 text-lg">
            {item.description}
          </p>

          {/* CONTACT */}
          {item.contact && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
              <p className="text-sm text-gray-500">
                Contact Information
              </p>
              <p className="text-xl font-semibold text-green-700">
                {item.contact}
              </p>
            </div>
          )}

          {/* CLAIM STATUS */}
          {myClaim && (
            <div className="bg-blue-50 border p-4 rounded-xl">
              <p className="font-bold">
                Claim Status:{" "}
                <span className={
                  myClaim.status === "approved"
                    ? "text-green-600"
                    : myClaim.status === "rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }>
                  {myClaim.status.toUpperCase()}
                </span>
              </p>
              <p>AI Confidence: {myClaim.confidence}%</p>
            </div>
          )}

          {/* CLAIM FORM */}
          {isLoggedIn &&
            !isOwner &&
            !item.claimed &&
            !myClaim &&
            item.verificationQuestions?.length > 0 && (

              <form
                onSubmit={submitClaim}
                className="bg-gray-50 p-6 rounded-xl space-y-4"
              >
                <h2 className="text-2xl font-bold">
                  Ownership Verification
                </h2>

                {item.verificationQuestions.map((q, i) => (
                  <div key={i}>
                    <label className="block mb-1 font-medium">
                      {q.question}
                    </label>
                    <input
                      value={answers[i]}
                      onChange={e => {
                        const copy = [...answers];
                        copy[i] = e.target.value;
                        setAnswers(copy);
                      }}
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                ))}

                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition">
                  Submit Claim
                </button>
              </form>
          )}

          {/* CHAT */}
          {canChat && (
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold mb-4">
                Private Chat
              </h2>

              <div className="h-80 overflow-y-auto bg-gray-50 p-4 rounded-xl space-y-3">
                {messages.length === 0 && (
                  <p className="text-gray-400 text-center">
                    No messages yet.
                  </p>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.sender === loggedInUserId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-xs ${
                        msg.sender === loggedInUserId
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {msg.text}
                      <div className="text-xs opacity-60 mt-1">
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-3 mt-4">
                <input
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-xl px-4 py-2"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-6 rounded-xl"
                >
                  Send
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
