// src/pages/manager/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/http.js";
import axios from "axios";
import { ethers } from "ethers";

import Navbar from "../../../src/components/layout/topbar/Navbar.jsx";
import Leftbar from "../../../src/components/layout/leftbar/Leftbar.jsx";

import abi from "../../blockchain/contractABI.json";
import { Award } from "lucide-react";

import { toast } from "react-toastify";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

// IMPORT TAB COMPONENTS
import ExamTab from "./AdminTabs/ExamTab.jsx";
import SessionTab from "./AdminTabs/Session/SessionTab.jsx";
import ResultTab from "./AdminTabs/Result/ResultTab.jsx";
import CertificateTab from "./AdminTabs/Certificate/EligibleCertificateTab.jsx";
import SettingsTab from "./AdminTabs/SettingsTab.jsx";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDR;
const BACKEND_API = import.meta.env.VITE_API_BASE;

const TABS = ["exams", "sessions", "results", "certs", "settings"];

function AdminDashboard() {
  const [userRole, setUserRole] = useState(null);

  // DATA STATES
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [results, setResults] = useState([]);
  const [issued, setIssued] = useState([]);
  const [txHash, setTxHash] = useState(null);
  const [loading, setLoading] = useState(false);

  // CREATE EXAM FORM
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newExam, setNewExam] = useState({
    title: "",
    description: "",
    passScore: 0,
  });

  const navigate = useNavigate();
  const { collapsed } = useSidebar();

  // TAB STATE
  const [activeTab, setActiveTab] = useState("exams");



  // ========================= LOAD DATA =========================
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUserRole(JSON.parse(stored).role);
      } catch {}
    }
    fetchExams();
  }, []);

  const fetchExams = () => {
    API.get("/api/exams")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        setExams(data);
      })
      .catch(() => toast.error("Lỗi tải danh sách bài thi"));
  };

  const fetchResults = async (examId) => {
    setSelectedExam(examId);
    setResults([]);
    try {
      const res = await API.get(`/api/results/${examId}`);
      setResults(res.data?.data || []);
    } catch {
      toast.error("Lỗi tải kết quả");
    }
  };

  // ========================= CREATE EXAM =========================
  const handleCreateExam = async () => {
    if (!newExam.title.trim()) {
      return toast.warning("Vui lòng nhập tên bài thi");
    }

    try {
      const payload = {
        partNumber: Number(newExam.partNumber),
        title: newExam.title.trim(),
        description: newExam.description.trim(),
        section: newExam.section || "listening",
        durationMinutes: Number(newExam.durationMinutes) || 0,
        instructions: newExam.instructions || "",
        audioUrl: newExam.audioUrl || "",
        imageUrl: newExam.imageUrl || "",
        totalQuestions: Number(newExam.totalQuestions) || 0,
        type: "practice",
        questions: [],
      };


      const res = await API.post("/api/exams", payload);
      const created = res.data?.data;

      if (created) setExams((prev) => [...prev, created]);
      else fetchExams();

      toast.success("Tạo bài thi thành công");
      setShowCreateForm(false);
      setNewExam({ title: "", description: "", passScore: 0 });
    } catch {
      toast.error("Tạo bài thi thất bại");
    }
  };

  // ========================= DELETE EXAM =========================
  const handleDeleteExam = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài thi này?")) return;

    try {
      await API.delete(`/api/exams/${id}`);

      setExams((prev) => prev.filter((e) => e._id !== id));
      if (selectedExam === id) {
        setSelectedExam(null);
        setResults([]);
      }

      toast.success("Đã xoá bài thi");
    } catch {
      toast.error("Lỗi khi xoá bài thi");
    }
  };
// ========================= ISSUE CERTIFICATE =========================
const issueCertificate = async (wallet, examId, metadataUri, contentHash) => {
  try {
    console.log("🚀 issueCertificate params:", {
      wallet,
      examId,
      metadataUri,
      contentHash,
    });

    if (!wallet || typeof wallet !== "string" || !wallet.startsWith("0x")) {
      toast.error("Wallet học viên không hợp lệ.");
      return;
    }

    if (!window.ethereum) {
      toast.warn("Vui lòng cài MetaMask");
      return;
    }

    setLoading(true);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);

    // ⭐ Contract chỉ nhận 3 params
    const tx = await contract.issue(wallet, metadataUri, contentHash);

    await provider.waitForTransaction(tx.hash);

    setTxHash(tx.hash);

    // ⭐ Lưu trạng thái đã cấp theo (wallet + examId)
    const key = `${wallet.toLowerCase()}_${examId}`;
    setIssued((prev) => ({
      ...prev,
      [key]: true,
    }));

    // ⭐ Backend vẫn nhận đủ 4 params
    await axios.post(`${BACKEND_API}/api/certificates`, {
      studentWallet: wallet,
      examId,
      txHash: tx.hash,
      tokenUri: metadataUri,
      contentHash,
    });

    toast.success("Cấp chứng chỉ thành công");
  } catch (err) {
    console.error("❌ ISSUE CERT ERROR:", err);
    toast.error("Cấp chứng chỉ thất bại");
  } finally {
    setLoading(false);
  }
};



  // =====================================================================

  return (
    <>
      <Leftbar />

      <div
        className={`transition-all duration-300 ${
          collapsed ? "ml-[80px]" : "ml-[250px]"
        }`}
      >
        <Navbar />

        <div className="adm-container pt-[88px]">
          <div className="adm-box">

            {/* TITLE */}
            <h1 className="adm-title">
              <Award className="adm-icon-yellow" />
              Bảng điều khiển Quản trị viên
            </h1>

            {/* ================= TABS MENU ================= */}
            
            <div className="adm-content-menu">
              <div className="tab-wrapper">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    className={`adm-tab ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {{
                      exams: "Bài thi",
                      sessions: "Kỳ thi",
                      results: "Kết quả",
                      certs: "Chứng chỉ",
                      settings: "Cài đặt",
                    }[tab]}
                  </button>
                ))}

                {/* TAB SLIDER */}
                <div
                  className="tab-indicator"
                  style={{
                    transform: `translateX(${TABS.indexOf(activeTab) * 120}px)`,
                  }}
                />
              </div>
            </div>


            {/* ===================== TAB CONTENT ===================== */}
            <div>
              {activeTab === "exams" && (
                <ExamTab
                  userRole={userRole}
                  exams={exams}
                  showCreateForm={showCreateForm}
                  setShowCreateForm={setShowCreateForm}
                  newExam={newExam}
                  setNewExam={setNewExam}
                  handleCreateExam={handleCreateExam}
                  selectedExam={selectedExam}
                  fetchResults={fetchResults}
                  navigate={navigate}
                  handleDeleteExam={handleDeleteExam}
                  results={results}
                  issued={issued}
                  loading={loading}
                  issueCertificate={issueCertificate}
                  txHash={txHash}
                />
              )}

              {activeTab === "sessions" && (
                <SessionTab
                  exams={exams} // dùng list bài thi đã có để ghép part
                />
              )}
              {activeTab === "results" && <ResultTab />}
              {activeTab === "certs" && (
                <CertificateTab 
                    issueCertificate={issueCertificate}
                    issued={issued}
                />

              )}
              {activeTab === "settings" && <SettingsTab />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
