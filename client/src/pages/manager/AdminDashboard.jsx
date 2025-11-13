// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/http.js";
import axios from "axios";
import { ethers } from "ethers";
import Navbar from "../../components/topbar/Navbar.jsx";
import abi from "../../blockchain/contractABI.json";
import { BookOpen, Award } from "lucide-react";
import "./AdminDashboard.css";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDR;
const BACKEND_API = import.meta.env.VITE_API_BASE;

function AdminDashboard() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [issued, setIssued] = useState([]);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUserRole(JSON.parse(storedUser).role);

    API.get("/api/exams")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        setExams(data);
      })
      .catch((err) => {
        console.error("❌ Lỗi tải danh sách kỳ thi:", err);
        setExams([]);
      });
  }, []);

  const fetchResults = async (examId) => {
    if (userRole === "user") {
      alert("🚫 Chức năng này chỉ dành cho quản trị viên!");
      return;
    }

    setSelectedExam(examId);
    try {
      const res = await axios.get(`${BACKEND_API}/api/results/${examId}`);
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Lỗi tải kết quả:", err);
      setResults([]);
    }
  };

  const issueCertificate = async (studentWallet, examId, metadataUri, contentHash) => {
    try {
      if (!window.ethereum) return alert("⚠️ Vui lòng cài MetaMask!");
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      const tx = await contract.issue(studentWallet, metadataUri, contentHash);
      const receipt = await tx.wait();

      setTxHash(receipt.hash);
      setIssued((prev) => [...prev, studentWallet]);

      await axios.post(`${BACKEND_API}/api/certificates`, {
        studentWallet,
        examId,
        txHash: receipt.hash,
        tokenUri: metadataUri,
        contentHash,
      });

      alert(`✅ Cấp chứng chỉ thành công!\nTx: ${receipt.hash}`);
    } catch (err) {
      console.error("❌ Lỗi cấp chứng chỉ:", err);
      alert("❌ Giao dịch thất bại. Kiểm tra console để biết chi tiết.");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="admin-container">
  <Navbar />

  {/* ✅ Chỉ phần box này có animation */}
  <div className="admin-box slide-up">
    <h1 className="admin-title">
      <Award className="icon-yellow" />
      Bảng điều khiển Quản trị viên
    </h1>

    <div className="exam-section fade-in">
      <h2 className="exam-title">
        <BookOpen className="icon-blue" />
        Danh sách kỳ thi
      </h2>

      {exams.length === 0 ? (
        <p className="no-data">Hiện chưa có kỳ thi nào.</p>
      ) : (
        <ul className="exam-list">
          {exams.map((exam) => (
            <li
              key={exam._id}
              onClick={() => fetchResults(exam._id)}
              className={`exam-item ${selectedExam === exam._id ? "active" : ""}`}
            >
              <div className="exam-info">
                <span className="exam-name">{exam.title}</span>
                <span className="exam-count">{exam.totalQuestions} câu hỏi</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
</div> 
  );
}

export default AdminDashboard;
