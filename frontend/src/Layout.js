import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import PostItem from "./components/PostItem";

export default function Layout() {

  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const [open, setOpen] = useState(false);

  const closeModal = () => {
    setOpen(false);
  };

  return (
    <>

      <Navbar />

      <Outlet />

      {/* FLOATING POST BUTTON */}

      {isLoggedIn && (

        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700
          text-white font-semibold px-5 py-3 rounded-full shadow-lg
          hover:scale-105 active:scale-95 transition flex items-center gap-2"
        >
          + Post Item
        </button>

      )}

      {/* MODAL BACKDROP */}

      {open && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl relative p-6 animate-fadeInUp">

            {/* CLOSE BUTTON */}

            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">
              Post Lost / Found Item
            </h2>

            <PostItem
              onPosted={() => {
                closeModal();
              }}
            />

          </div>

        </div>

      )}

    </>
  );

}