import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/http";
import "./Verify.css";
import logo from "../../assets/logo-educhain.png";

export default function Verify() {
  const { contentHash } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentHash]);

  const loadCertificate = async () => {
    try {
      const res = await API.get(`/api/certificates/verify/${contentHash}`);
      setCert(res.data.data);
    } catch (err) {
      console.error("Verify error:", err);
      setCert(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="vf-loading">Đang tải chứng chỉ…</div>;
  if (!cert) return <div className="vf-error">❌ Không tìm thấy chứng chỉ!</div>;

  return (
    <div className="vf-wrapper">
      <div className="vf-card">
        {/* HEADER */}
        <div className="vf-header">
          <img src={logo} className="vf-logo" alt="EduChain" />
          <div>
            <h1>EDUCHAIN CERTIFICATE</h1>
            <p className="vf-sub">Official TOEIC Blockchain Credential</p>
          </div>
        </div>

        <div className="vf-body">
          {/* LEFT */}
          <div className="vf-left">
            <img src={cert.avatar} className="vf-avatar" alt="avatar" />

            <h2 className="vf-name">{cert.studentName}</h2>
            <p className="vf-email">{cert.email}</p>

            <div className="vf-info">
              <p><strong>Bài thi:</strong> {cert.examTitle}</p>
              <p><strong>Tổng điểm:</strong> {cert.accuracy ?? "N/A"}</p>
              <p>
                <strong>Accuracy:</strong>
                <span className="vf-green"> {cert.accuracy ?? 0}%</span>
              </p>
            </div>

            <a
              href={`https://sepolia.etherscan.io/tx/${cert.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="vf-eth-btn"
            >
              Xem giao dịch trên Ethereum
            </a>
          </div>

          {/* RIGHT */}
          <div className="vf-right">
            <h3>Blockchain Verification</h3>

            <div className="vf-info-line">
              <span className="vf-info-label">Network</span>
              <span className="vf-info-value">Ethereum Sepolia</span>
            </div>

            {/* ✅ FIX: có label Contract */}
            <div className="vf-info-line">
              <span className="vf-info-label">Contract</span>
              <span className="vf-info-value">
                {cert.contract ? `${cert.contract.slice(0, 12)}...` : "N/A"}
              </span>
            </div>

            <div className="vf-info-line">
              <span className="vf-info-label">Owner</span>
              <span className="vf-info-value">
                {cert.studentWallet ? `${cert.studentWallet.slice(0, 10)}...` : "N/A"}
              </span>
            </div>

            <div className="vf-info-line">
              <span className="vf-info-label">Token ID</span>
              <span className="vf-info-value">#{cert.tokenId}</span>
            </div>

            <div className="vf-info-line">
              <span className="vf-info-label">Content Hash</span>
              <span className="vf-info-value">{cert.contentHash}</span>
            </div>

            <div className="vf-info-line">
              <span className="vf-info-label">Tx Hash</span>
              <span className="vf-info-value">{cert.txHash?.slice(0, 12)}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
