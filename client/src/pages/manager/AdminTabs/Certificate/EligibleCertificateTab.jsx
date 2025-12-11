import React, { useEffect, useState } from "react";
import API from "../../../../api/http";

import {
  Search,
  Award,
  CheckCircle,
  User as UserIcon,
  BookOpen,
  Wallet,
} from "lucide-react";

import "./EligibleCertificateTab.css";

export default function EligibleCertificateTab() {
  const [pending, setPending] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState({});

  // filters
  const [search, setSearch] = useState("");

  // =========================================================
  // LOAD CERTIFICATES CHƯA MINT
  // =========================================================
  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/certificates/pending");
      const list = res.data?.data || [];

      setPending(list);
      setFiltered(list);
    } catch (err) {
      console.error("Load pending certificates error:", err);
    }
    setLoading(false);
  };

  // =========================================================
  // FILTER BAR
  // =========================================================
  useEffect(() => {
    const text = search.toLowerCase();

    const next = pending.filter((c) => {
      return (
        c.user?.name?.toLowerCase().includes(text) ||
        c.user?.email?.toLowerCase().includes(text) ||
        c.studentWallet?.toLowerCase().includes(text) ||
        c.examId?.title?.toLowerCase().includes(text)
      );
    });

    setFiltered(next);
  }, [search, pending]);

  // =========================================================
  // MINT NFT CERTIFICATE
  // =========================================================
  const mintCertificate = async (cert) => {
    const certId = cert._id;
    setMinting((p) => ({ ...p, [certId]: true }));

    try {
      // =====================================================
      // CALL SMART CONTRACT HERE (BRO WILL FILL)
      // =====================================================
      // const tx = await contract.mintTo(cert.studentWallet, metadataURL);
      // await tx.wait();

      // Sau khi mint thành công → update DB
      await API.put(`/api/certificates/${certId}/mint`, {
        metadataURL: `${import.meta.env.VITE_API_BASE}/metadata/${cert.contentHash}.json`
});


      alert("🎉 Mint & cấp chứng chỉ thành công!");

      // reload danh sách
      loadPending();
    } catch (err) {
      console.error("❌ ISSUE CERT ERROR:", err);
      alert("Mint NFT thất bại!");
    }

    setMinting((p) => ({ ...p, [certId]: false }));
  };

  // =========================================================
  // RENDER UI
  // =========================================================
  return (
    <div className="cert-page">

      {/* HEADER */}
      <div className="cert-header">
        <div>
          <div className="cert-header-title">
            <Award size={26} />
            <h2>Cấp chứng chỉ (Mint NFT)</h2>
          </div>
          <p className="cert-header-sub">
            Đây là danh sách các chứng chỉ đã tạo nhưng chưa mint NFT.
            Admin sẽ cấp NFT bằng ví cấu hình trong hệ thống.
          </p>
        </div>

        <div className="cert-header-stat">
          <span className="stat-label">Chứng chỉ đang chờ mint</span>
          <span className="stat-value">{pending.length}</span>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="cert-toolbar">
        <div className="cert-search">
          <Search size={18} />
          <input
            placeholder="Tìm theo tên, email, bài thi hoặc ví..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-box">Không có chứng chỉ nào đang chờ mint.</div>
      ) : (
        <div className="cert-grid">
          {filtered.map((c) => (
            <div key={c._id} className="cert-card">

              {/* USER */}
              <div className="card-header">
                <div className="card-avatar">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 className="card-name">{c.user?.name}</h3>
                  <p className="card-email">{c.user?.email}</p>
                </div>
              </div>

              {/* EXAM */}
              <div className="card-exam">
                <span className="exam-label">
                  <BookOpen size={14} />
                  {c.examId?.title}
                </span>
              </div>

              {/* WALLET */}
              <div className="card-wallet">
                <span className="wallet-label">Ví nhận NFT:</span>
                <span className="wallet-value">{c.studentWallet}</span>
              </div>

              {/* ACTION BUTTON */}
              <button
                className="btn-mint"
                disabled={minting[c._id]}
                onClick={() => mintCertificate(c)}
              >
                {minting[c._id] ? (
                  "Đang mint..."
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Cấp chứng chỉ
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
