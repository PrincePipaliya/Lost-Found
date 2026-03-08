import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ItemDetail() {

  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const accessToken = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const loggedInUserId = user?._id || null;

  useEffect(() => {

    const loadItem = async () => {

      try {

        const res = await api.get(`/items/${id}`);

        setItem(res.data);

      } catch {

        toast.error("Failed to load item");

      } finally {

        setLoading(false);

      }

    };

    loadItem();

  }, [id]);

  useEffect(() => {

    if (!accessToken) return;

    socketRef.current = io("http://localhost:5000", {
      auth: { token: accessToken }
    });

    const socket = socketRef.current;

    socket.emit("join_room", id);

    api.get(`/items/${id}/chat`)
      .then(res => setMessages(res.data))
      .catch(() => {});

    socket.on("receive_message", msg => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.disconnect();

  }, [id, accessToken]);

  const sendMessage = () => {

    if (!messageInput.trim()) return;

    socketRef.current.emit("send_message", {
      roomId: id,
      text: messageInput
    });

    setMessageInput("");

  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    (typeof item.user === "string"
      ? item.user
      : item.user?._id) === loggedInUserId;

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-8">

      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">

        {item.images?.length > 0 && (

          <img
            src={`http://localhost:5000${item.images[0]}`}
            alt={item.title}
            className="w-full h-96 object-cover"
          />

        )}

        <div className="p-8 space-y-6">

          <Link to="/dashboard" className="text-blue-600 text-sm">
            ← Back to Dashboard
          </Link>

          <h1 className="text-4xl font-bold">
            {item.title}
          </h1>

          <p className="text-gray-600">
            {item.description}
          </p>

          {isOwner && (

            <div className="bg-indigo-50 p-5 rounded-xl">

              <h2 className="font-bold text-lg">
                Owner Dashboard
              </h2>

              <p>Status: {item.status}</p>

              <p>Claims: {item.claims?.length || 0}</p>

            </div>

          )}

          {item.contact && (

            <div className="bg-green-50 p-4 rounded-xl">

              <p className="text-sm text-gray-500">
                Contact
              </p>

              <p className="font-bold text-green-700">
                {item.contact}
              </p>

            </div>

          )}

          <div className="border-t pt-6">

            <h2 className="text-xl font-bold mb-4">
              Chat
            </h2>

            <div className="h-80 overflow-y-auto bg-gray-50 p-4 rounded-xl">

              {messages.map((msg) => (

                <div
                  key={msg._id}
                  className={`flex ${
                    msg.senderId === loggedInUserId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`px-4 py-2 rounded-xl ${
                      msg.senderId === loggedInUserId
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >

                    {msg.message}

                    <div className="text-xs opacity-60">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>

                  </div>

                </div>

              ))}

              <div ref={messagesEndRef} />

            </div>

            <div className="flex gap-2 mt-3">

              <input
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                className="flex-1 border rounded-xl px-3 py-2"
              />

              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 rounded-xl"
              >
                Send
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}