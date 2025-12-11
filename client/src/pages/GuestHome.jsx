import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  MonitorCheck,
} from "lucide-react";
import educhainImg from "../assets/educhain.png";
export default function GuestHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white">

{/* ================= HERO ================= */}
<section className="max-w-7xl mx-auto px-6 pt-28 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

  {/* LEFT TEXT */}
  <div className="flex flex-col justify-center">
    <h1 className="text-5xl font-extrabold text-slate-900 leading-tight">
      EduChain – <br />
      <span className="text-blue-700">Luyện thi hiện đại,</span> <br />
      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        minh bạch bằng Blockchain
      </span>
    </h1>

    <p className="mt-6 text-lg text-slate-600 max-w-lg">
      Nền tảng luyện thi TOEIC & nhiều môn khác.
      Chứng chỉ được lưu trên Blockchain – chống giả mạo, xác thực tức thì.
    </p>

    <div className="flex gap-4 mt-8">
      <button
        onClick={() => navigate("/login")}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
      >
        Đăng nhập
      </button>

      <button
        onClick={() => navigate("/login")}
        className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl shadow hover:bg-slate-100 transition"
      >
        Đăng ký miễn phí
      </button>
    </div>
  </div>

  {/* RIGHT: LOGO BOX */}
  <div className="flex justify-center relative">
    {/* BIG GLOW BACKGROUND */}
    <div className="w-[480px] h-[480px] bg-gradient-to-br from-blue-200 to-purple-300 rounded-full blur-3xl opacity-40 absolute"></div>

    {/* LOGO CARD */}
    <div className="relative bg-white px-10 py-8 rounded-3xl shadow-2xl border border-slate-100">
      <img
        src={educhainImg}
        alt="EduChain Logo"
        className="w-[340px] max-w-full object-contain select-none drop-shadow-md"
        draggable="false"
      />
    </div>
  </div>

</section>



      {/* ================= SECTION TITLE ================= */}
      <h2 className="text-center text-3xl font-bold text-slate-900 mb-10">
        Những tiện ích bạn có thể trải nghiệm ngay
      </h2>

      {/* ================= FEATURES GRID ================= */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

          <Feature
            icon={<Search className="w-8 h-8 text-blue-600" />}
            title="Xem thông tin kỳ thi"
            desc="Xem danh sách kỳ thi hiện có, phân loại theo chủ đề."
          />

          <Feature
            icon={<BookOpen className="w-8 h-8 text-purple-600" />}
            title="Xem mô tả bài luyện"
            desc="Xem cấu trúc Part 1, Part 2…, thời gian & yêu cầu."
          />

          <Feature
            icon={<ShieldCheck className="w-8 h-8 text-green-600" />}
            title="Tra cứu chứng chỉ"
            desc="Kiểm tra chứng chỉ Blockchain mà không cần tài khoản."
          />

          <Feature
            icon={<BadgeCheck className="w-8 h-8 text-amber-600" />}
            title="Xem hướng dẫn sử dụng"
            desc="Xem quy trình thi, luyện tập, nhận chứng chỉ blockchain."
          />

          <Feature
            icon={<MonitorCheck className="w-8 h-8 text-cyan-600" />}
            title="Xem trang chủ hệ thống"
            desc="Xem thông báo, giới thiệu, hướng dẫn chung."
          />

          <Feature
            icon={<Search className="w-8 h-8 text-pink-600" />}
            title="Tìm kiếm kỳ thi"
            desc="Dùng từ khóa để tìm kỳ thi nhanh chóng."
          />

        </div>
      </section>


      {/* ================= CTA BANNER ================= */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-purple-500 text-white p-10 rounded-3xl shadow-xl relative overflow-hidden">

          <Sparkles className="absolute top-6 right-6 w-12 h-12 opacity-20" />

          <h2 className="text-3xl font-bold mb-3">
            Bắt đầu hành trình học tập cùng EduChain
          </h2>

          <p className="text-purple-200 max-w-xl mb-6">
            Tạo tài khoản miễn phí, luyện thi với hàng trăm câu hỏi chuẩn hoá và nhận chứng chỉ Blockchain uy tín.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-xl shadow hover:bg-purple-100 transition"
          >
            Đăng ký ngay
          </button>
        </div>
      </section>


      {/* ================= FOOTER ================= */}
      <footer className="text-center text-slate-500 text-sm py-6">
        © 2025 EduChain — Nền tảng luyện thi & chứng chỉ blockchain
      </footer>

    </div>
  );
}


/* ================= COMPONENT ================= */

function Feature({ icon, title, desc }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition group">
      <div className="mb-4 group-hover:scale-110 transition">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-600 text-sm">{desc}</p>
    </div>
  );
}
