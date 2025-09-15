import { useState } from "react";
import UploadDropzone from "../components/UploadDropzone";
import axios from "axios";
import { useRouter } from "next/router";

export default function Home() {
  const [contractId, setContractId] = useState(null);
  const [status, setStatus] = useState(null);
  const router = useRouter();

  const pollStatus = async (id) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/contracts/${id}/status`
        );
        setStatus(res.data);
        if (res.data.state === "completed") {
          clearInterval(interval);
          router.push(`/contracts/${id}`);
        } else if (res.data.state === "failed") {
          clearInterval(interval);
          alert("Processing failed: " + res.data.error);
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
      }
    }, 2000);
  };

  const handleUploaded = (id) => {
    setContractId(id);
    pollStatus(id);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
      <h1 className="text-4xl font-bold mb-6">Upload Contract</h1>
      <UploadDropzone onUploaded={handleUploaded} />
      {contractId && (
        <div className="mt-6">
          <p>Tracking contract: {contractId}</p>
          <p>Status: {status?.state || "waiting..."}</p>
        </div>
      )}
    </div>
  );
}
