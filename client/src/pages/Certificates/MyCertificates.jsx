// import React, { useEffect, useState } from "react";
// import API from "../../api/http";
// import { BadgeCheck, ArrowLeft } from "lucide-react";
// import "./MyCertificates.css";
// import logo from "../../assets/logo-educhain.png";
// import { useNavigate } from "react-router-dom";

// export default function MyCertificates() {
//   const navigate = useNavigate();

//   const [wallet, setWallet] = useState(null);
//   const [certs, setCerts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     loadWallet();
//   }, []);

//   const loadWallet = async () => {
//     if (!window.ethereum) return;
//     const accounts = await window.ethereum.request({
//       method: "eth_requestAccounts",
//     });
//     setWallet(accounts[0]);
//   };

//   useEffect(() => {
//     if (wallet) loadCertificates(wallet);
//   }, [wallet]);

//   const loadCertificates = async () => {
//     setLoading(true);

//     try {
//       const res = await API.get(`/api/certificates/my?wallet=${wallet}`);
//       const list = res.data?.data || [];

//       const result = [];

//       for (let cert of list) {
//         const meta = await API.get(cert.metadataUri).then((r) => r.data);

//         const attrMap = Object.fromEntries(
//           (meta.attributes || []).map((attr) => [attr.trait_type, attr.value])
//         );

//         const accuracy =
//           parseInt(attrMap.Accuracy || 0) ||
//           parseInt(attrMap.Score || 0) ||
//           0;

//         result.push({
//           _id: cert._id,
//           tokenId: cert.tokenId,
//           txHash: cert.txHash,
//           createdAt: cert.createdAt,
//           meta,
//           attr: { ...attrMap, Accuracy: accuracy },
//           image: meta.image,
//         });
//       }

//       setCerts(result);
//     } catch (e) {
//       console.error(e);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="certpage">

//       {/* ▼▼ BACK BUTTON ▼▼ */}
//       <button className="back-btn" onClick={() => navigate(-1)}>
//         <ArrowLeft size={20} /> Quay lại
//       </button>

//       <div className="certpage-header">
//         <BadgeCheck size={32} />
//         <span>Bộ Sưu Tập Chứng Chỉ Blockchain</span>
//       </div>

//       {!wallet && <p className="no-wallet">⚠️ Vui lòng kết nối MetaMask.</p>}
//       {loading && <p>⏳ Đang tải chứng chỉ...</p>}

//       <div className="cert-list">
//         {certs.map((c) => (
//           <div key={c._id} className="certificate-card">

//             {/* Header */}
//             <div className="cert-head">
//               <img src={logo} className="cert-logo" />
//               <div>
//                 <h2 className="cert-title">EDUCHAIN CERTIFICATE</h2>
//                 <p className="cert-sub">Official TOEIC Blockchain Credential</p>
//               </div>
//             </div>

//             <div className="cert-body">

//               {/* LEFT */}
//               <div className="cert-left">
//                 <img className="cert-avatar" src={c.attr.Avatar} alt="avatar" />

//                 <div className="cert-userinfo">
//                   <h3 className="cert-name">{c.attr.Student}</h3>
//                   <p className="cert-email">{c.attr.Email}</p>

//                   <div className="cert-field"><b>Bài thi:</b> {c.attr.Exam}</div>
//                   <div className="cert-field"><b>Tổng điểm:</b> {c.attr.Score}</div>

//                   <div className="cert-field">
//                     <b>Accuracy:</b>{" "}
//                     <span className="acc-green">{c.attr.Accuracy}%</span>
//                   </div>

//                   {/* ▼▼ ETHERSCAN BUTTON ▼▼ */}
//                   <a
//                     href={`https://sepolia.etherscan.io/tx/${c.txHash}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="etherscan-btn"
//                   >
//                     Xem minh chứng trên Ethereum
//                   </a>
//                 </div>
//               </div>

//               {/* RIGHT */}
//               <div className="cert-right">
//                 <div className="cert-stamp">
//                   <img src="/stamp.png" alt="" />
//                 </div>

//                 <div className="cert-verify-block">
//                   <span className="verify-title">Blockchain Verify</span>
//                   <span className="verify-field">Token #{c.tokenId}</span>
//                   <span className="verify-field">
//                     Tx: {c.txHash.slice(0, 12)}...
//                   </span>

//                   <img
//                     src={c.attr.QR || "/qr-sample.png"}
//                     className="cert-qr"
//                   />
//                 </div>

//                 <div className="cert-sign">
//                   <img src="/signature_admin.png" className="sign-img" />
//                   <p>Authorized Signer</p>
//                 </div>
//               </div>

//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { BadgeCheck, ArrowLeft } from "lucide-react";
import "./MyCertificates.css";
import logo from "../../assets/logo-educhain.png";
import { useNavigate } from "react-router-dom";

export default function MyCertificates() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ ENV Railway (giữ nguyên như bạn muốn)
  const RAILWAY_BASE = import.meta.env.VITE_API_BASE;

  // ✅ Local base: khi chạy FE ở localhost => ép local = http://localhost:4000
  // (và vẫn có đúng style: VITE_API_BASE || "http://localhost:4000")
  const LOCAL_BASE =
    (window.location.hostname === "localhost"
      ? "http://localhost:4000"
      : import.meta.env.VITE_API_BASE || "http://localhost:4000") ||
    "http://localhost:4000";

  const LOG = (...args) =>
    console.log("%c[MyCert]", "color:#7c3aed;font-weight:700", ...args);
  const WARN = (...args) =>
    console.warn("%c[MyCert]", "color:#f59e0b;font-weight:700", ...args);
  const ERR = (...args) =>
    console.error("%c[MyCert]", "color:#ef4444;font-weight:700", ...args);

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
    if (wallet) loadCertificates();
  }, [wallet]);

  const normBase = (base) => String(base || "").replace(/\/$/, "");

  // ✅ fetch JSON with timeout
  const fetchJson = async (url, timeoutMs = 6000) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  };

  // ✅ quick health check
  const healthCheck = async (base, name) => {
    if (!base) {
      WARN(`${name}: base URL missing`);
      return { ok: false, reason: "missing_base" };
    }
    try {
      const url = `${normBase(base)}/`;
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
      clearTimeout(t);
      if (res.ok) {
        LOG(`${name}: hoạt động ✅ (${url})`);
        return { ok: true };
      }
      WARN(`${name}: phản hồi nhưng không OK ⚠️ (${res.status}) (${url})`);
      return { ok: false, reason: `status_${res.status}` };
    } catch (e) {
      WARN(`${name}: chết/không truy cập được ❌`, e?.message || e);
      return { ok: false, reason: e?.name || "network_error" };
    }
  };

  // ✅ 1) Fetch LIST: Railway first -> Local fallback
  const fetchCertListRailwayThenLocal = async () => {
    const railwayListUrl = `${normBase(RAILWAY_BASE)}/api/certificates/my?wallet=${wallet}`;
    const localListUrl = `${normBase(LOCAL_BASE)}/api/certificates/my?wallet=${wallet}`;

    // try railway
    try {
      LOG("LIST: try Railway =>", railwayListUrl);
      const data = await fetchJson(railwayListUrl, 6000);
      LOG("LIST: ✅ Railway OK");
      return data?.data || [];
    } catch (e) {
      WARN("LIST: ❌ Railway fail -> fallback Local", e?.message || e);
    }

    // try local
    try {
      LOG("LIST: try Local =>", localListUrl);
      const data2 = await fetchJson(localListUrl, 6000);
      LOG("LIST: ✅ Local OK");
      return data2?.data || [];
    } catch (e) {
      ERR("LIST: ❌ Local fail (local chết hoặc local không có dữ liệu)", e?.message || e);
      throw e;
    }
  };

  // ✅ 2) Fetch METADATA: Railway first -> Local fallback
  const fetchMetadataRailwayThenLocal = async (cert, index) => {
    // metadataUri thường là full railway url
    const railwayMetaUrl = cert?.metadataUri;

    // local meta cần contentHash: /metadata/result-xxx.json
    const contentHash = cert?.contentHash;
    const localMetaUrl = contentHash
      ? `${normBase(LOCAL_BASE)}/metadata/${contentHash}.json`
      : null;

    LOG(`CERT[${index}] token#${cert?.tokenId || "?"}: start metadata`);
    LOG(`CERT[${index}] Railway URL:`, railwayMetaUrl || "(missing)");
    LOG(`CERT[${index}] Local URL:`, localMetaUrl || "(missing contentHash)");

    // try railway metadata
    if (railwayMetaUrl) {
      try {
        const meta = await fetchJson(railwayMetaUrl, 6000);
        LOG(`CERT[${index}] ✅ Railway: metadata OK`);
        return meta;
      } catch (e) {
        WARN(`CERT[${index}] ❌ Railway metadata fail -> fallback Local`, e?.message || e);
      }
    }

    // try local metadata
    if (!localMetaUrl) {
      ERR(`CERT[${index}] ❌ Không fallback Local được: thiếu contentHash trong cert`);
      throw new Error("Missing contentHash for local metadata");
    }

    try {
      const meta = await fetchJson(localMetaUrl, 6000);
      LOG(`CERT[${index}] ✅ Local: metadata OK`);
      return meta;
    } catch (e) {
      ERR(`CERT[${index}] ❌ Local metadata fail (local chết hoặc local chưa có json)`, e?.message || e);
      throw e;
    }
  };

  const loadCertificates = async () => {
    setLoading(true);

    LOG("==============================================");
    LOG("TEST FLOW: LIST + METADATA | Railway trước, fail thì Local");
    LOG("RAILWAY_BASE =", RAILWAY_BASE);
    LOG("LOCAL_BASE   =", LOCAL_BASE);
    LOG("==============================================");

    // ping tổng quan
    await healthCheck(RAILWAY_BASE, "Railway");
    await healthCheck(LOCAL_BASE, "Local");

    try {
      const list = await fetchCertListRailwayThenLocal();
      LOG(`LIST: received ${list.length} item(s)`);

      if (!list.length) WARN("Danh sách chứng chỉ rỗng (local/railway DB chưa có hoặc wallet sai).");

      const result = [];

      for (let i = 0; i < list.length; i++) {
        const cert = list[i];
        try {
          const meta = await fetchMetadataRailwayThenLocal(cert, i);

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

          LOG(`CERT[${i}] ✅ Render-ready`);
        } catch (e) {
          ERR(`CERT[${i}] ❌ Bỏ qua cert này vì không lấy được metadata`, e?.message || e);
        }
      }

      setCerts(result);
      LOG(`DONE: render list = ${result.length} / ${list.length}`);
    } catch (e) {
      ERR("❌ Load certificates failed:", e?.message || e);
      setCerts([]);
    }

    setLoading(false);
  };

  return (
    <div className="certpage">
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
            <div className="cert-head">
              <img src={logo} className="cert-logo" alt="logo" />
              <div>
                <h2 className="cert-title">EDUCHAIN CERTIFICATE</h2>
                <p className="cert-sub">Official TOEIC Blockchain Credential</p>
              </div>
            </div>

            <div className="cert-body">
              <div className="cert-left">
                <img className="cert-avatar" src={c.attr.Avatar} alt="avatar" />

                <div className="cert-userinfo">
                  <h3 className="cert-name">{c.attr.Student}</h3>
                  <p className="cert-email">{c.attr.Email}</p>

                  <div className="cert-field">
                    <b>Bài thi:</b> {c.attr.Exam}
                  </div>
                  <div className="cert-field">
                    <b>Tổng điểm:</b> {c.attr.Score}
                  </div>

                  <div className="cert-field">
                    <b>Accuracy:</b>{" "}
                    <span className="acc-green">{c.attr.Accuracy}%</span>
                  </div>

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

              <div className="cert-right">
                <div className="cert-stamp">
                  <img src="/stamp.png" alt="" />
                </div>

                <div className="cert-verify-block">
                  <span className="verify-title">Blockchain Verify</span>
                  <span className="verify-field">Token #{c.tokenId}</span>
                  <span className="verify-field">Tx: {c.txHash.slice(0, 12)}...</span>

                  <img
                    src={c.attr.QR || "/qr-sample.png"}
                    className="cert-qr"
                    alt="qr"
                  />
                </div>

                <div className="cert-sign">
                  <img src="/signature_admin.png" className="sign-img" alt="sign" />
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
 