import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/admin/logs").then(res => setLogs(res.data));
  }, []);

  return (
    <div className="p-6 animate-fadeInUp">
      <h1 className="text-3xl font-bold mb-6">Admin Activity Logs</h1>

      <div className="space-y-3">
        {logs.map(log => (
          <div key={log._id} className="bg-white p-4 rounded shadow">
            <p className="font-semibold">{log.action}</p>
            <p className="text-sm text-gray-500">
              {new Date(log.date).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
