// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import API from "../api/http.js";
import Navbar from "../components/topbar/Navbar.jsx";
import { BookOpen, Trophy, Play } from "lucide-react"; // icon gọn đẹp

function Home() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    API.get("/api/exams")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        setExams(data);
      })
      .catch((err) => console.error("❌ Lỗi tải kỳ thi:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Danh sách kỳ thi
          </h1>
          <p className="text-slate-500 mt-2">
            Hãy chọn kỳ thi bạn muốn tham gia để bắt đầu luyện tập.
          </p>
        </div>

        {exams.length === 0 ? (
          <div className="text-center text-slate-500 text-lg">
            Hiện chưa có kỳ thi nào được tạo.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 p-6 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">
                    {exam.title}
                  </h2>
                  <p className="text-slate-600 text-sm mb-1">
                    Tổng số câu hỏi:{" "}
                    <span className="font-medium text-blue-600">
                      {exam.totalQuestions}
                    </span>
                  </p>
                  <p className="text-slate-600 text-sm">
                    Điểm đạt:{" "}
                    <span className="font-medium text-green-600">
                      {exam.passScore}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => alert("Trang luyện thi đang phát triển 😅")}
                  className="mt-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-all duration-200"
                >
                  <Play size={18} />
                  Bắt đầu thi
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="text-center text-slate-400 text-sm py-6">
        © 2025 EduChain — Nền tảng luyện thi & chứng chỉ blockchain
      </footer>
    </div>
  );
}

export default Home;
