import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PostItem from "../components/PostItem";
import toast from "react-hot-toast";

export default function Dashboard() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const loadItems = async () => {

    try {

      const res = await api.get("/items");
      setItems(res.data);

    } catch {

      toast.error("Failed to load items");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    loadItems();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return null;
    return `http://localhost:5000${path}`;
  };

  /* FILTER */

  const filteredItems = items.filter(item => {

    const matchSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase());

    const matchType =
      filterType === "all" ||
      item.type === filterType;

    return matchSearch && matchType;

  });

  /* STATS */

  const totalItems = items.length;
  const lostItems = items.filter(i => i.type === "lost").length;
  const foundItems = items.filter(i => i.type === "found").length;
  const returnedItems = items.filter(i => i.status === "returned").length;

  if (loading) {
    return <div className="p-10 text-center text-lg font-semibold">Loading dashboard...</div>;
  }

  return (

    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-3xl font-bold">
          Lost & Found
        </h1>

        <button
          onClick={() => setShowPost(!showPost)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showPost ? "Close Post Form" : "Post Item"}
        </button>

      </div>


      {/* STATS */}

      <div className="grid md:grid-cols-4 gap-4 mb-8">

        <StatCard title="Total Items" value={totalItems} />
        <StatCard title="Lost" value={lostItems} />
        <StatCard title="Found" value={foundItems} />
        <StatCard title="Returned" value={returnedItems} />

      </div>


      {/* POST FORM */}

      {showPost && (

        <div className="bg-white rounded-xl shadow p-6 mb-8 animate-fadeIn">

          <PostItem onPosted={() => {
            setShowPost(false);
            loadItems();
          }} />

        </div>

      )}


      {/* SEARCH */}

      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col md:flex-row gap-4 md:items-center">

        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="border p-2 rounded-lg w-full md:w-72"
        />

        <div className="flex gap-2">

          <FilterButton
            active={filterType === "all"}
            onClick={()=>setFilterType("all")}
          >
            All
          </FilterButton>

          <FilterButton
            active={filterType === "lost"}
            onClick={()=>setFilterType("lost")}
          >
            Lost
          </FilterButton>

          <FilterButton
            active={filterType === "found"}
            onClick={()=>setFilterType("found")}
          >
            Found
          </FilterButton>

        </div>

      </div>


      {/* EMPTY */}

      {filteredItems.length === 0 && (

        <div className="text-center text-gray-500 mt-20">
          No items found
        </div>

      )}


      {/* ITEMS */}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {filteredItems.map(item => {

          const image =
            item.images?.length > 0
              ? getImageUrl(item.images[0])
              : null;

          return (

            <div
              key={item._id}
              className="bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition overflow-hidden"
            >

              {image && (

                <img
                  src={image}
                  alt={item.title}
                  className="h-44 w-full object-cover"
                />

              )}

              <div className="p-4">

                <div className="flex justify-between items-center mb-2">

                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold
                    ${
                      item.type === "lost"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.type.toUpperCase()}
                  </span>

                  {item.category && (

                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {item.category}
                    </span>

                  )}

                </div>

                <h2 className="font-bold text-lg mb-1">
                  {item.title}
                </h2>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </p>

                <Link
                  to={`/items/${item._id}`}
                  className="block mt-4 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  View Details
                </Link>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

}

/* STAT CARD */

function StatCard({ title, value }) {

  return (

    <div className="bg-white p-5 rounded-xl shadow text-center">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <p className="text-3xl font-bold mt-1">
        {value}
      </p>

    </div>

  );

}

/* FILTER BUTTON */

function FilterButton({ children, active, onClick }) {

  return (

    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-semibold transition
      ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >

      {children}

    </button>

  );

}