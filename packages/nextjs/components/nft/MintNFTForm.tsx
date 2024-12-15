"use client";

import { useState } from "react";
import { uploadToIPFS } from "~~/services/uploadToIPFS";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { useAccount } from "wagmi";

interface MintNFTFormProps {
  collectionAddress: string;
}

const MintNFTForm = ({ collectionAddress }: MintNFTFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [manualIpfsUrl, setManualIpfsUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const { address: userAddress } = useAccount();
  const { writeContractAsync: mintNFT } = useScaffoldWriteContract(collectionAddress);

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
      console.error("Failed to upload to IPFS:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    const finalIpfsUrl = manualIpfsUrl || ipfsUrl;

    if (!finalIpfsUrl) {
      alert("Please upload an image or enter an IPFS URL first!");
      return;
    }

    if (!userAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      await mintNFT({
        functionName: "mintNFT",
        args: [userAddress, finalIpfsUrl],
      });
      alert("NFT Minted Successfully!");
    } catch (error) {
      console.error("Minting failed:", error);
    }
  };

  return (
    <div className="p-4 border">
      <h3 className="text-xl mb-2">Mint New NFT</h3>
      <input type="file" onChange={handleFileChange} className="mb-2" />
      <button onClick={handleUpload} className="btn mb-2" disabled={loading}>
        {loading ? "Uploading..." : "Upload to IPFS"}
      </button>
      <input
        type="text"
        placeholder="Or enter IPFS URL directly"
        value={manualIpfsUrl}
        onChange={(e) => setManualIpfsUrl(e.target.value)}
        className="input input-bordered w-full mb-2"
      />
      {ipfsUrl && <p className="text-gray-600 mb-2">Uploaded IPFS URL: {ipfsUrl}</p>}
      <button onClick={handleMint} className="btn btn-primary">
        Mint NFT
      </button>
    </div>
  );
};

export default MintNFTForm;
