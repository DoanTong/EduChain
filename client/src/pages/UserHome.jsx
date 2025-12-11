// // src/pages/Home.jsx
// import React, { useEffect, useState } from "react";
// import API from "../api/http.js";

// import Navbar from "../components/layout/topbar/Navbar.jsx";
// import Leftbar from "../components/layout/leftbar/Leftbar.jsx";

// import {
//   BookOpen,
//   Play,
//   BadgeCheck,
//   ShieldCheck,
//   Sparkles,
//   Layers,
//   Blocks,
// } from "lucide-react";

// import { useNavigate } from "react-router-dom";
// import { useSidebar } from "../context/SidebarContext";
// import { useSearch } from "../context/SearchContext";

// function Home() {
//   const [sessions, setSessions] = useState([]);          // <-- đổi từ exams → sessions
//   const [filterStatus, setFilterStatus] = useState("all"); // <-- enum filter

//   const navigate = useNavigate();
//   const { collapsed } = useSidebar();
//   const { keyword } = useSearch();

//   const [leaderboard, setLeaderboard] = useState([]);

//   // ================================
//   // LOAD EXAMSESSIONS
//   // ================================
//   useEffect(() => {
//     API.get("/api/examsessions")
//       .then((res) => {
//         const data = Array.isArray(res.data)
//           ? res.data
//           : res.data?.data || [];
//         setSessions(data);

//         localStorage.setItem("allExamSessions", JSON.stringify(data));
//       })
//       .catch((err) => console.error("❌ Lỗi tải session:", err));
//   }, []);

//   // ================================
//   // LOAD LEADERBOARD
//   // ================================
//   useEffect(() => {
//     API.get("/api/session-results/leaderboard")
//       .then((res) => setLeaderboard(res.data?.data || []))
//       .catch(() => console.error("❌ Lỗi tải leaderboard"));
//   }, []);

//   // ================================
//   // FILTER SESSION
//   // ================================
//   const filteredSessions = sessions.filter((s) => {
//     const matchKeyword = s.title?.toLowerCase().includes(keyword.toLowerCase());
//     const matchStatus =
//       filterStatus === "all" ? true : s.status === filterStatus;
//     return matchKeyword && matchStatus;
//   });

//   return (
//     <>
//       <Leftbar />
//       <Navbar />

//       <div
//         className={`page-content transition-all duration-300 ${
//           collapsed ? "ml-[80px]" : "ml-[250px]"
//         }`}
//       >
//         {/* ===================== HERO SECTION ===================== */}
//         <div className="pt-[88px] px-6 max-w-6xl mx-auto">
//           <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white rounded-3xl p-10 shadow-lg relative overflow-hidden">
//             <BadgeCheck className="absolute top-6 right-8 w-10 h-10 opacity-20" />

//             <h1 className="text-4xl font-bold mb-4 drop-shadow">
//               EduChain – Nền tảng luyện thi hiện đại
//             </h1>
//             <p className="text-lg text-blue-100 max-w-2xl">
//               Luyện thi hiệu quả, minh bạch và an toàn.  
//               Chứng chỉ của bạn được lưu trữ trên Blockchain –  
//               chống giả mạo, xác minh chỉ trong 1 giây.
//             </p>

//             <button
//               onClick={() => navigate("/exam")}
//               className="mt-6 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl shadow hover:bg-slate-100 transition flex items-center gap-2"
//             >
//               <BadgeCheck size={18} /> Bắt đầu ngay
//             </button>
//           </div>

//           {/* ===================== STATISTICS SECTION ===================== */}
//           <div className="grid sm:grid-cols-3 gap-6 mt-10">
//             <div className="bg-white shadow-md p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
//               <BookOpen className="text-blue-600 w-10 h-10" />
//               <div>
//                 <p className="text-slate-500">Bài thi hiện có</p>
//                 <h3 className="text-2xl font-bold">{sessions.length}</h3>
//               </div>
//             </div>

//             <div className="bg-white shadow-md p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
//               <ShieldCheck className="text-green-600 w-10 h-10" />
//               <div>
//                 <p className="text-slate-500">Chứng chỉ Blockchain</p>
//                 <h3 className="text-2xl font-bold">∞</h3>
//               </div>
//             </div>

//             <div className="bg-white shadow-md p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
//               <Blocks className="text-purple-600 w-10 h-10" />
//               <div>
//                 <p className="text-slate-500">Minh bạch tuyệt đối</p>
//                 <h3 className="text-2xl font-bold">100%</h3>
//               </div>
//             </div>
//           </div>

//           {/* ===================== FILTER SECTION (status enum) ===================== */}
//           <div className="mt-14 mb-4">
//             <h2 className="text-2xl font-semibold text-slate-800 mb-4">
//               Lọc bài thi theo trạng thái
//             </h2>

//             <div className="flex gap-4 flex-wrap">
//               {[
//                 { label: "Tất cả", value: "all" },
//                 { label: "Practice", value: "practice" },
//                 { label: "Published", value: "published" },
//               ].map((item) => (
//                 <button
//                   key={item.value}
//                   onClick={() => setFilterStatus(item.value)}
//                   className={`
//                     px-5 py-2 rounded-xl border shadow-sm transition
//                     ${
//                       filterStatus === item.value
//                         ? "bg-blue-600 text-white border-blue-600"
//                         : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
//                     }
//                   `}
//                 >
//                   {item.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* ===================== LATEST EXAMS (sessions) ===================== */}
//           <div className="mt-10 mb-16 grid grid-cols-12 gap-10">

//             <div className="col-span-12 lg:col-span-7">
//               <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
//                 <Layers className="text-blue-600" /> Danh sách bài thi mới nhất
//               </h2>

//               {filteredSessions.length === 0 ? (
//                 <div className="text-center text-slate-500 text-lg py-16">
//                   Không tìm thấy bài thi phù hợp với "{keyword}".
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {[...filteredSessions]
//                     .sort((a, b) => b._id.localeCompare(a._id))
//                     .slice(0, 6)
//                     .map((s) => (
//                       <div
//                         key={s._id}
//                         className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition border border-slate-100 p-5 flex flex-col justify-between"
//                       >
//                         <div>
//                           <div className="flex items-center gap-2 mb-3">
//                             <BadgeCheck className="text-blue-600" size={18} />
//                             <span className="text-sm text-blue-600 font-medium">
//                               Blockchain Ready
//                             </span>
//                           </div>

//                           <h3 className="text-lg font-semibold text-slate-800 mb-1 line-clamp-1">
//                             {s.title}
//                           </h3>

//                           <p className="text-slate-600 text-sm mb-1">
//                             Tổng số phần thi:{" "}
//                             <span className="font-medium text-blue-600">
//                               {s.parts?.length || 0}
//                             </span>
//                           </p>

//                           <p className="text-slate-600 text-sm">
//                             Trạng thái:{" "}
//                             <span
//                               className={`font-medium ${
//                                 s.status === "published"
//                                   ? "text-green-600"
//                                   : "text-orange-500"
//                               }`}
//                             >
//                               {s.status}
//                             </span>
//                           </p>
//                         </div>

//                         <button
//                           onClick={() => navigate(`/exam-session/${s._id}`)}
//                           className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition"
//                         >
//                           <Play size={18} />
//                           Bắt đầu thi
//                         </button>
//                       </div>
//                     ))}
//                 </div>
//               )}
//             </div>

// {/* ===================== RIGHT: LEADERBOARD ===================== */}
// <div className="col-span-12 lg:col-span-5">
//   <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
//     🏆 Bảng xếp hạng
//   </h2>

//   <div className="bg-white shadow-md rounded-2xl border border-slate-200 p-6">
//     {leaderboard.length === 0 ? (
//       <p className="text-slate-500 text-center py-6">
//         Chưa có dữ liệu xếp hạng.
//       </p>
//     ) : (
//       <table className="w-full">
//         <thead>
//           <tr className="text-left text-slate-500 text-sm border-b">
//             <th>Hạng</th>
//             <th>Học viên</th>
//             <th>Điểm</th>
//           </tr>
//         </thead>

//         <tbody className="text-slate-700">

//           {leaderboard.map((item, i) => {

//             // Avatar fallback
//             const avatar = item.avatar
//               ? item.avatar
//               : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName || "User")}&background=2563eb&color=fff&size=128`;

//             return (
//               <tr key={i} className="border-b last:border-0">
                
//                 {/* Rank icons */}
//                 <td className="py-3 font-semibold text-center">
//                   {i === 0 && <span className="text-yellow-500 text-xl">🥇</span>}
//                   {i === 1 && <span className="text-gray-400 text-xl">🥈</span>}
//                   {i === 2 && <span className="text-orange-500 text-xl">🥉</span>}
//                   {i > 2 && <span>{i + 1}</span>}
//                 </td>

//                 {/* Avatar + Name */}
//                 <td className="py-3 flex items-center gap-3">
//                   <img
//                     src={avatar}
//                     className="w-10 h-10 rounded-full object-cover border"
//                   />
//                   <span className="font-medium">
//                     {item.fullName || "Không rõ"}
//                   </span>
//                 </td>

//                 {/* Accuracy */}
//                 <td className="text-blue-600 font-bold text-lg text-right">
//                   {item.accuracy}%
//                 </td>
//               </tr>
//             );
//           })}

//         </tbody>
//       </table>
//     )}
//   </div>
// </div>

//           </div>
//         </div>

//         {/* ===================== PROMOTION SECTION ===================== */}
//         <div className="max-w-6xl mx-auto px-6">
//           <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 text-white rounded-3xl p-10 shadow-lg relative overflow-hidden">
//             <Sparkles className="absolute top-6 right-8 w-12 h-12 opacity-30" />

//             <h2 className="text-3xl font-bold mb-4 drop-shadow">
//               Nâng cấp kỹ năng cùng EduChain Academy
//             </h2>

//             <p className="text-lg text-purple-100 max-w-2xl">
//               Khám phá các khóa học chất lượng cao, được thiết kế cho người mới bắt đầu đến nâng cao.
//               Học tập hiệu quả – nhận chứng chỉ Blockchain minh bạch, uy tín – xác minh toàn cầu.
//             </p>

//             <button className="mt-6 px-6 py-3 bg-white text-purple-700 font-semibold rounded-xl shadow hover:bg-slate-100 transition flex items-center gap-2">
//               <BookOpen size={18} /> Khám phá khóa học
//             </button>

//             <div className="absolute bottom-0 right-0 w-56 h-56 bg-white opacity-10 rounded-full blur-3xl"></div>
//           </div>
//         </div>

//         {/* ===================== FOOTER ===================== */}
//         <footer className="text-center text-slate-400 text-sm py-6">
//           © 2025 EduChain — Hệ thống luyện thi và chứng chỉ blockchain
//         </footer>
//       </div>
//     </>
//   );
// }

// export default Home;
// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import API from "../api/http.js";

import Navbar from "../components/layout/topbar/Navbar.jsx";
import Leftbar from "../components/layout/leftbar/Leftbar.jsx";

import {
  BookOpen,
  Play,
  BadgeCheck,
  ShieldCheck,
  Sparkles,
  Layers,
  Blocks,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { useSearch } from "../context/SearchContext";
import { toast } from "react-toastify";

function Home() {
  const [sessions, setSessions] = useState([]); // <-- đổi từ exams → sessions
  const [filterStatus, setFilterStatus] = useState("all"); // <-- enum filter

  const navigate = useNavigate();
  const { collapsed } = useSidebar();
  const { keyword } = useSearch();

  const [leaderboard, setLeaderboard] = useState([]);

  // ================================
  // LOAD EXAMSESSIONS
  // ================================
  useEffect(() => {
    API.get("/api/examsessions")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        setSessions(data);

        localStorage.setItem("allExamSessions", JSON.stringify(data));
      })
      .catch((err) => console.error("❌ Lỗi tải session:", err));
  }, []);

  // ================================
  // LOAD LEADERBOARD
  // ================================
  useEffect(() => {
    API.get("/api/session-results/leaderboard")
      .then((res) => setLeaderboard(res.data?.data || []))
      .catch(() => console.error("❌ Lỗi tải leaderboard"));
  }, []);

  // ================================
  // FILTER SESSION
  // ================================
  const filteredSessions = sessions.filter((s) => {
    const matchKeyword = s.title?.toLowerCase().includes(keyword.toLowerCase());
    const matchStatus =
      filterStatus === "all" ? true : s.status === filterStatus;
    return matchKeyword && matchStatus;
  });

  // ================================
  // CONFIRM BẮT ĐẦU THI (TOAST)
  // ================================
  const handleStartSession = (session) => {
    // Dùng custom toast có nút Xác nhận / Hủy
    toast.info(
      ({ closeToast }) => (
        <div className="text-sm">
          <p className="mb-2 font-semibold">
            Bắt đầu kỳ thi: <span className="text-blue-600">{session.title}</span>?
          </p>
          <p className="mb-3 text-slate-600">
            Thời gian sẽ được tính khi bạn vào bài. Hãy đảm bảo bạn đã sẵn sàng.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={closeToast}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                closeToast();
                navigate(`/exam-session/${session._id}`);
              }}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition flex items-center gap-1"
            >
              <Play size={14} />
              Bắt đầu
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
      }
    );
  };

  return (
    <>
      <Leftbar />
      <Navbar />

      <div
        className={`page-content transition-all duration-300 ${
          collapsed ? "ml-[80px]" : "ml-[250px]"
        }`}
      >
        {/* ===================== HERO SECTION ===================== */}
        <div className="pt-[88px] px-6 max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white rounded-3xl p-10 shadow-lg relative overflow-hidden">
            <BadgeCheck className="absolute top-6 right-8 w-10 h-10 opacity-20" />

            <h1 className="text-4xl font-bold mb-4 drop-shadow">
              EduChain – Nền tảng luyện thi hiện đại
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl">
              Luyện thi hiệu quả, minh bạch và an toàn.
              <br />
              Chứng chỉ của bạn được lưu trữ trên Blockchain – chống giả mạo,
              xác minh chỉ trong 1 giây.
            </p>

            <button
              onClick={() => navigate("/exam")}
              className="mt-6 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl shadow hover:bg-slate-100 transition flex items-center gap-2"
            >
              <BadgeCheck size={18} /> Bắt đầu ngay
            </button>
          </div>

          {/* ===================== STATISTICS SECTION ===================== */}
          <div className="grid sm:grid-cols-3 gap-6 mt-10">
            <div className="bg-white shadow-md p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
              <BookOpen className="text-blue-600 w-10 h-10" />
              <div>
                <p className="text-slate-500">Bài thi hiện có</p>
                <h3 className="text-2xl font-bold">{sessions.length}</h3>
              </div>
            </div>

            <div className="bg-white shadow-md p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
              <ShieldCheck className="text-green-600 w-10 h-10" />
              <div>
                <p className="text-slate-500">Chứng chỉ Blockchain</p>
                <h3 className="text-2xl font-bold">∞</h3>
              </div>
            </div>

            <div className="bg-white shadow-md p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
              <Blocks className="text-purple-600 w-10 h-10" />
              <div>
                <p className="text-slate-500">Minh bạch tuyệt đối</p>
                <h3 className="text-2xl font-bold">100%</h3>
              </div>
            </div>
          </div>

          {/* ===================== FILTER SECTION (status enum) ===================== */}
          <div className="mt-14 mb-4">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Lọc bài thi theo trạng thái
            </h2>

            <div className="flex gap-4 flex-wrap">
              {[
                { label: "Tất cả", value: "all" },
                { label: "Practice", value: "practice" },
                { label: "Published", value: "published" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilterStatus(item.value)}
                  className={`
                    px-5 py-2 rounded-xl border shadow-sm transition
                    ${
                      filterStatus === item.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }
                  `}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* ===================== LATEST EXAMS (sessions) ===================== */}
          <div className="mt-10 mb-16 grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-7">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <Layers className="text-blue-600" /> Danh sách bài thi mới nhất
              </h2>

              {filteredSessions.length === 0 ? (
                <div className="text-center text-slate-500 text-lg py-16">
                  Không tìm thấy bài thi phù hợp với "{keyword}".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...filteredSessions]
                    .sort((a, b) => b._id.localeCompare(a._id))
                    .slice(0, 6)
                    .map((s) => (
                      <div
                        key={s._id}
                        className="home-session-card"
                      >
                        <div className="home-session-body">
                          <div className="home-session-eyebrow">
                            <BadgeCheck
                              className="text-blue-600"
                              size={18}
                            />
                            <span className="home-session-eyebrow-text">
                              Blockchain Ready
                            </span>
                          </div>

                          <h3 className="home-session-title">
                            {s.title}
                          </h3>

                          <p className="home-session-meta">
                            Tổng số phần thi:{" "}
                            <span className="home-session-meta-accent">
                              {s.parts?.length || 0}
                            </span>
                          </p>

                          <p className="home-session-status">
                            Trạng thái:{" "}
                            <span
                              className={`home-session-status-badge ${
                                s.status === "published"
                                  ? "home-session-status-published"
                                  : "home-session-status-practice"
                              }`}
                            >
                              {s.status}
                            </span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleStartSession(s)}
                          className="home-session-button"
                        >
                          <Play size={18} />
                          Bắt đầu thi
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* ===================== RIGHT: LEADERBOARD ===================== */}
            <div className="col-span-12 lg:col-span-5">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                🏆 Bảng xếp hạng
              </h2>

              <div className="bg-white shadow-md rounded-2xl border border-slate-200 p-6">
                {leaderboard.length === 0 ? (
                  <p className="text-slate-500 text-center py-6">
                    Chưa có dữ liệu xếp hạng.
                  </p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-slate-500 text-sm border-b">
                        <th>Hạng</th>
                        <th>Học viên</th>
                        <th>Điểm</th>
                      </tr>
                    </thead>

                    <tbody className="text-slate-700">
                      {leaderboard.map((item, i) => {
                        // Avatar fallback
                        const avatar = item.avatar
                          ? item.avatar
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              item.fullName || "User"
                            )}&background=2563eb&color=fff&size=128`;

                        return (
                          <tr key={i} className="border-b last:border-0">
                            {/* Rank icons */}
                            <td className="py-3 font-semibold text-center">
                              {i === 0 && (
                                <span className="text-yellow-500 text-xl">
                                  🥇
                                </span>
                              )}
                              {i === 1 && (
                                <span className="text-gray-400 text-xl">
                                  🥈
                                </span>
                              )}
                              {i === 2 && (
                                <span className="text-orange-500 text-xl">
                                  🥉
                                </span>
                              )}
                              {i > 2 && <span>{i + 1}</span>}
                            </td>

                            {/* Avatar + Name */}
                            <td className="py-3 flex items-center gap-3">
                              <img
                                src={avatar}
                                className="w-10 h-10 rounded-full object-cover border"
                              />
                              <span className="font-medium">
                                {item.fullName || "Không rõ"}
                              </span>
                            </td>

                            {/* Accuracy */}
                            <td className="text-blue-600 font-bold text-lg text-right">
                              {item.accuracy}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===================== PROMOTION SECTION ===================== */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 text-white rounded-3xl p-10 shadow-lg relative overflow-hidden">
            <Sparkles className="absolute top-6 right-8 w-12 h-12 opacity-30" />

            <h2 className="text-3xl font-bold mb-4 drop-shadow">
              Nâng cấp kỹ năng cùng EduChain Academy
            </h2>

            <p className="text-lg text-purple-100 max-w-2xl">
              Khám phá các khóa học chất lượng cao, được thiết kế cho người mới
              bắt đầu đến nâng cao. Học tập hiệu quả – nhận chứng chỉ Blockchain
              minh bạch, uy tín – xác minh toàn cầu.
            </p>

            <button className="mt-6 px-6 py-3 bg-white text-purple-700 font-semibold rounded-xl shadow hover:bg-slate-100 transition flex items-center gap-2">
              <BookOpen size={18} /> Khám phá khóa học
            </button>

            <div className="absolute bottom-0 right-0 w-56 h-56 bg-white opacity-10 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* ===================== FOOTER ===================== */}
        <footer className="text-center text-slate-400 text-sm py-6">
          © 2025 EduChain — Hệ thống luyện thi và chứng chỉ blockchain
        </footer>
      </div>
    </>
  );
}

export default Home;
