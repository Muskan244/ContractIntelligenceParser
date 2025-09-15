import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function ContractsList() {
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/contracts").then((res) => {
      setContracts(res.data.contracts || []);
    });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Contracts</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contracts.map((c) => (
          <Link
            key={c.contract_id}
            href={`/contracts/${c.contract_id}`}
            className="block bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold text-gray-800">
              Contract {c.contract_id.slice(0, 8)}...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Uploaded: {new Date(c.uploaded_ts).toLocaleDateString()}
            </p>
            <span
              className={`inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                c.status
              )}`}
            >
              {c.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
