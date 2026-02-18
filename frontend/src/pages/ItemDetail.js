import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";
import toast from "react-hot-toast";

const socket = io("http://localhost:5000");

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [myClaim, setMyClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  // 💬 Chat state
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

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

  /* ================= SOCKET ================= */

  useEffect(() => {
    if (!isLoggedIn) return;

    socket.emit("join_room", id);

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [id]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const messageData = {
      roomId: id,
      sender: loggedInUserId,
      text: messageInput,
      time: new Date().toLocaleTimeString()
    };

    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setMessageInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= CLAIM SUBMIT ================= */

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

  const isOwner =
    loggedInUserId &&
    (typeof item.userId === "string"
      ? item.userId
      : item.userId._id) === loggedInUserId;

  const canChat =
    isOwner ||
    (myClaim && myClaim.status === "approved");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        <Link to="/dashboard" className="text-blue-600 text-sm">
          ← Back
        </Link>

        {item.image && (
          <img
            src={`http://localhost:5000/${item.image}`}
            alt={item.title}
            className="w-full h-80 object-cover rounded-xl mt-4"
          />
        )}

        <h1 className="text-3xl font-bold mt-6">
          {item.title}
        </h1>

        <p className="mt-4 text-gray-700">
          {item.description}
        </p>

        {/* CLAIM FORM */}
        {isLoggedIn &&
          !isOwner &&
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

              <button className="bg-blue-600 text-white px-6 py-2 rounded">
                Submit Claim
              </button>
            </form>
          )}

        {/* ================= CHAT ================= */}
        {canChat && (
          <div className="mt-10 border-t pt-6">
            <h2 className="text-xl font-bold mb-4">
              💬 Private Chat
            </h2>

            <div className="h-64 overflow-y-auto border rounded p-4 bg-gray-50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-3 ${
                    msg.sender === loggedInUserId
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block px-3 py-2 rounded-lg ${
                      msg.sender === loggedInUserId
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {msg.time}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2 mt-4">
              <input
                value={messageInput}
                onChange={(e) =>
                  setMessageInput(e.target.value)
                }
                className="flex-1 border rounded px-3 py-2"
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
