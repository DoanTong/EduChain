import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "../../blockchain/contractABI.json";
import "./Verify.css";
import { toast } from "react-toastify";
import Navbar from "../../components/topbar/Navbar.jsx";


const CONTRACT_ADDR = import.meta.env.VITE_CONTRACT_ADDR;

function Verify() {
  const [tokenId, setTokenId] = useState("");
  const [owner, setOwner] = useState("");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyCert = async () => {
    if (!window.ethereum) {
      toast.error("⚠️ Cần cài MetaMask để tra cứu chứng chỉ!");
      return;
    }

    try {
      setLoading(true);
      setOwner("");
      setHash("");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDR, abi, provider);

      const ownerAddr = await contract.ownerOf(tokenId);
      const contentHash = await contract.contentHash(tokenId);

      setOwner(ownerAddr);
      setHash(contentHash);
      toast.success("✅ Tra cứu thành công! Chứng chỉ hợp lệ.");
    } catch (err) {
      console.error("❌ Lỗi tra cứu:", err);
      toast.error("Không tìm thấy chứng chỉ hợp lệ hoặc tokenId không tồn tại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page">
      <Navbar /> {/* ✅ navbar cố định trên cùng */}

      <div className="verify-container">
        <div className="verify-card">
          <h1 className="verify-title">🔍 Tra cứu chứng chỉ Blockchain</h1>
          <p className="verify-subtitle">
            Nhập mã Token ID để xác minh chứng chỉ trên chuỗi khối
          </p>

          <div className="verify-form">
            <input
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="Nhập tokenId..."
              className="verify-input"
            />
            <button
              onClick={verifyCert}
              className={`verify-btn ${loading ? "loading" : ""}`}
              disabled={loading || !tokenId}
            >
              {loading ? "⏳ Đang tra cứu..." : "Kiểm tra chứng chỉ"}
            </button>
          </div>

          {owner && (
            <div className="verify-result">
              <h3>✅ Chứng chỉ hợp lệ</h3>
              <p><strong>Chủ sở hữu:</strong></p>
              <p className="verify-address">{owner}</p>

              <p><strong>Content Hash:</strong></p>
              <p className="verify-hash">{hash}</p>

              <a
                href={`https://sepolia.etherscan.io/token/${CONTRACT_ADDR}?a=${tokenId}`}
                target="_blank"
                rel="noreferrer"
                className="etherscan-link"
              >
                🔗 Xem trên Etherscan
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Verify;
