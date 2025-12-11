import React, { useEffect, useState } from "react";
import API from "../../api/http";
import { BadgeCheck, ArrowLeft } from "lucide-react";
import "./MyCertificates.css";
import logo from "../../assets/logo-educhain.png";
import { useNavigate } from "react-router-dom";

export default function MyCertificates() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    if (!window.ethereum) return;
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setWallet(accounts[0]);
  };

  useEffect(() => {
    if (wallet) loadCertificates(wallet);
  }, [wallet]);

  const loadCertificates = async () => {
    setLoading(true);

    try {
      const res = await API.get(`/api/certificates/my?wallet=${wallet}`);
      const list = res.data?.data || [];

      const result = [];

      for (let cert of list) {
        const meta = await API.get(cert.metadataUri).then((r) => r.data);

        const attrMap = Object.fromEntries(
          (meta.attributes || []).map((attr) => [attr.trait_type, attr.value])
        );

        const accuracy =
          parseInt(attrMap.Accuracy || 0) ||
          parseInt(attrMap.Score || 0) ||
          0;

        result.push({
          _id: cert._id,
          tokenId: cert.tokenId,
          txHash: cert.txHash,
          createdAt: cert.createdAt,
          meta,
          attr: { ...attrMap, Accuracy: accuracy },
          image: meta.image,
        });
      }

      setCerts(result);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  return (
    <div className="certpage">

      {/* ▼▼ BACK BUTTON ▼▼ */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Quay lại
      </button>

      <div className="certpage-header">
        <BadgeCheck size={32} />
        <span>Bộ Sưu Tập Chứng Chỉ Blockchain</span>
      </div>

      {!wallet && <p className="no-wallet">⚠️ Vui lòng kết nối MetaMask.</p>}
      {loading && <p>⏳ Đang tải chứng chỉ...</p>}

      <div className="cert-list">
        {certs.map((c) => (
          <div key={c._id} className="certificate-card">

            {/* Header */}
            <div className="cert-head">
              <img src={logo} className="cert-logo" />
              <div>
                <h2 className="cert-title">EDUCHAIN CERTIFICATE</h2>
                <p className="cert-sub">Official TOEIC Blockchain Credential</p>
              </div>
            </div>

            <div className="cert-body">

              {/* LEFT */}
              <div className="cert-left">
                <img className="cert-avatar" src={c.attr.Avatar} alt="avatar" />

                <div className="cert-userinfo">
                  <h3 className="cert-name">{c.attr.Student}</h3>
                  <p className="cert-email">{c.attr.Email}</p>

                  <div className="cert-field"><b>Bài thi:</b> {c.attr.Exam}</div>
                  <div className="cert-field"><b>Tổng điểm:</b> {c.attr.Score}</div>

                  <div className="cert-field">
                    <b>Accuracy:</b>{" "}
                    <span className="acc-green">{c.attr.Accuracy}%</span>
                  </div>

                  {/* ▼▼ ETHERSCAN BUTTON ▼▼ */}
                  <a
                    href={`https://sepolia.etherscan.io/tx/${c.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="etherscan-btn"
                  >
                    Xem minh chứng trên Ethereum
                  </a>
                </div>
              </div>

              {/* RIGHT */}
              <div className="cert-right">
                <div className="cert-stamp">
                  <img src="/stamp.png" alt="" />
                </div>

                <div className="cert-verify-block">
                  <span className="verify-title">Blockchain Verify</span>
                  <span className="verify-field">Token #{c.tokenId}</span>
                  <span className="verify-field">
                    Tx: {c.txHash.slice(0, 12)}...
                  </span>

                  <img
                    src={c.attr.QR || "/qr-sample.png"}
                    className="cert-qr"
                  />
                </div>

                <div className="cert-sign">
                  <img src="/signature_admin.png" className="sign-img" />
                  <p>Authorized Signer</p>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
