"use client";

import { useState } from "react";
import { uploadToIPFS } from "../../services/uploadToIPFS";

const TestUploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);
    try {
      const url = await uploadToIPFS(file);
      setIpfsUrl(url);
    } catch (error) {
      alert("Failed to upload to IPFS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Upload Image to IPFS</h2>
      <input type="file" onChange={handleFileChange} className="mb-4" />
      <button onClick={handleUpload} className="btn" disabled={loading}>
        {loading ? "Uploading..." : "Upload to IPFS"}
      </button>

      {ipfsUrl && (
        <div className="mt-4">
          <p>Uploaded to IPFS:</p>
          <a href={ipfsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            {ipfsUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default TestUploadPage;
