// src/components/WalletConnect.js
import React, { useState } from "react";
import { ethers } from "ethers";

function WalletConnect({ onConnected }) {
  const [address, setAddress] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("⚠️ Vui lòng cài MetaMask!");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const selected = accounts[0];
      setAddress(selected);
      onConnected && onConnected(selected);
    } catch (err) {
      console.error("❌ Lỗi kết nối ví:", err);
    }
  };

  return (
    <div className="p-3 bg-white rounded-md shadow flex items-center justify-between">
      {address ? (
        <p className="text-gray-700 text-sm">
          🦊 Ví: <span className="font-mono text-blue-600">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </p>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Kết nối ví MetaMask
        </button>
      )}
    </div>
  );
}

export default WalletConnect;
