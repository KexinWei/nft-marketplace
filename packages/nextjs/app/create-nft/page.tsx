// app/create-nft/page.tsx
"use client";

import { useState } from "react";
import SelectNFTCollection from "~~/components/nft/SelectNFTCollection";
import MintNFTForm from "~~/components/nft/MintNFTForm";

const CreateNFTPage = () => {
  const [selectedCollection, setSelectedCollection] = useState<{ address: string; name: string } | null>(null);
  const [showSelectCollection, setShowSelectCollection] = useState(true);

  const handleCollectionSelected = (collectionInfo: { address: string; name: string }) => {
    setSelectedCollection(collectionInfo);
    setShowSelectCollection(false);
  };

  const handleChangeCollection = () => {
    setSelectedCollection(null);
    setShowSelectCollection(true);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Create and Mint NFT</h1>

      {showSelectCollection ? (
        <SelectNFTCollection onCollectionSelected={handleCollectionSelected} />
      ) : (
        <div className="p-4 border mb-4">
          <h3 className="text-xl mb-2">Current Collection:</h3>
          <p className="text-lg font-semibold">{selectedCollection?.name}</p>
          <p className="text-gray-500 mb-4">{selectedCollection?.address}</p>
          <button onClick={handleChangeCollection} className="btn btn-secondary">
            Change Collection
          </button>
        </div>
      )}

      {selectedCollection && <MintNFTForm collectionAddress={selectedCollection.address} />}
    </div>
  );
};

export default CreateNFTPage;
