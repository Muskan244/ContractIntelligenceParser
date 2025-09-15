import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import axios from "axios";

export default function UploadDropzone({ onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/contracts/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      onUploaded(res.data.contract_id);
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      alert("Upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer ${
        isDragActive ? "bg-gray-200" : "bg-gray-100"
      }`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <p>Uploading...</p>
      ) : (
        <p>Drag & drop a PDF here, or click to select</p>
      )}
    </div>
  );
}
