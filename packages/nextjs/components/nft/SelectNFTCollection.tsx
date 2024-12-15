"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { getPublicClient } from "wagmi/actions";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { BrowserProvider, ethers } from "ethers";
import deployedContracts from "~~/contracts/deployedContracts";

interface SelectNFTCollectionProps {
  onCollectionSelected: (collectionInfo: { address: string; name: string }) => void;
}

const MyNFTCollectionABI = deployedContracts[11155111].MyNFTCollection.abi;

const SelectNFTCollection = ({ onCollectionSelected }: SelectNFTCollectionProps) => {
  const [existingAddress, setExistingAddress] = useState("");
  const [newName, setNewName] = useState("");
  const [newSymbol, setNewSymbol] = useState("");

  const { writeContractAsync: createCollection } = useScaffoldWriteContract("MyNFTCollectionFactory");

  const handleSelectExisting = async () => {
    if (existingAddress) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(existingAddress, MyNFTCollectionABI, provider);
        const collectionName = await contract.name();
        onCollectionSelected({ address: existingAddress, name: collectionName });
      } catch (error) {
        console.error("Error fetching collection name:", error);
      }
    }
  };

  const handleCreateNew = async () => {
    try {
      const txHash = await createCollection({
        functionName: "createMyNFTCollection",
        args: [newName, newSymbol],
      });

      if (!txHash) {
        console.error("Transaction failed or was rejected.");
        return;
      }

      const publicClient = getPublicClient(wagmiConfig);

      if (!publicClient) {
        console.error("Failed to get public client.");
        return;
      }

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("Transaction confirmed:", receipt);

      const newContractAddress = receipt.logs[0]?.address;
      if (newContractAddress) {
        onCollectionSelected({ address: newContractAddress, name: newName });
      } else {
        console.error("Failed to retrieve the new contract address from logs.");
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  return (
    <div className="p-4 border mb-4">
      <h3 className="text-xl mb-2">Select or Create NFT Collection</h3>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Existing Collection Address"
          value={existingAddress}
          onChange={(e) => setExistingAddress(e.target.value)}
          className="input input-bordered w-full mb-2"
        />
        <button onClick={handleSelectExisting} className="btn btn-primary">
          Use Existing Collection
        </button>
      </div>

      <div className="border-t pt-4">
        <input
          type="text"
          placeholder="New Collection Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="input input-bordered w-full mb-2"
        />
        <input
          type="text"
          placeholder="New Collection Symbol"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          className="input input-bordered w-full mb-2"
        />
        <button onClick={handleCreateNew} className="btn btn-secondary">
          Create New Collection
        </button>
      </div>
    </div>
  );
};

export default SelectNFTCollection;
