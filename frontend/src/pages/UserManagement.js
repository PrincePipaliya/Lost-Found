import { useEffect, useState } from "react";
import api from "../services/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const changeRole = async (id, role) => {
    await api.put(`/users/${id}/role`, { role });
    loadUsers();
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-extrabold mb-6">User Management</h1>

      <div className="bg-white rounded-xl shadow p-4">
        {users.map(user => (
          <div
            key={user._id}
            className="flex justify-between items-center border-b py-3"
          >
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-xs rounded-full
                ${user.role === "admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600"}`}>
                {user.role.toUpperCase()}
              </span>

              {user.role === "admin" ? (
                <button
                  onClick={() => changeRole(user._id, "user")}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Demote
                </button>
              ) : (
                <button
                  onClick={() => changeRole(user._id, "admin")}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  Promote
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
