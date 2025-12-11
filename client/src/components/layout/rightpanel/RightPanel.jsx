// import React, { useState } from "react";
// import { MessageCircle, Settings, ChevronLeft, ChevronRight } from "lucide-react";
// import "./RightPanel.css";

// export default function RightPanel() {
//   const [open, setOpen] = useState(false);       // sidebar 3 nút
//   const [showPanel, setShowPanel] = useState(null); // null | "message" | "settings"

//   return (
//     <>
//       {/* SIDEBAR 3 NÚT */}
//       <div className={`rp-mini ${open ? "open" : ""}`}>
        
//         {/* TOGGLE */}
//         <button className="rp-btn-small" onClick={() => setOpen(!open)}>
//           {open ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
//         </button>

//         {/* NÚT TIN NHẮN */}
//         {open && (
//           <button className="rp-btn-small" onClick={() => setShowPanel("message")}>
//             <MessageCircle size={20} />
//           </button>
//         )}

//         {/* NÚT CÀI ĐẶT */}
//         {open && (
//           <button className="rp-btn-small" onClick={() => setShowPanel("settings")}>
//             <Settings size={20} />
//           </button>
//         )}
//       </div>

//       {/* PANEL 2/3 CHIỀU CAO */}
//       {showPanel && (
//         <div className="rp-popup">
//           <div className="rp-popup-header">
//             <h3>
//               {showPanel === "message" ? "Gửi thông báo toàn bộ user" : "Cài đặt hệ thống"}
//             </h3>

//             <button className="rp-close" onClick={() => setShowPanel(null)}>×</button>
//           </div>

//           <div className="rp-popup-body">
//             {showPanel === "message" ? (
//               <>
//                 <textarea
//                   placeholder="Nhập nội dung thông báo..."
//                   className="rp-textarea"
//                 ></textarea>

//                 <button className="rp-send">Gửi thông báo</button>
//               </>
//             ) : (
//               <p className="rp-placeholder">
//                 Chức năng đang phát triển...
//               </p>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
import React, { useState, useEffect } from "react";
import { MessageCircle, Settings, ChevronLeft, ChevronRight, X } from "lucide-react";
import API from "../../../api/http";
import "./RightPanel.css";

export default function RightPanel({ activeUser, trigger }) {
  const [open, setOpen] = useState(false);         // Mở / Thu mini sidebar
  const [showPanel, setShowPanel] = useState(null); // null | "message" | "settings"
  const [message, setMessage] = useState("");

  // Khi AdminHome nhấn "Gửi thông báo" → Mở popup message
  useEffect(() => {
    if (trigger) {
      setShowPanel("message");
      setOpen(true); // mini-bar tự mở cho tiện
    }
  }, [trigger]);

  // Gửi thông báo toàn hệ thống
  const sendBroadcast = async () => {
    if (!message.trim()) return alert("Nhập nội dung!");

    try {
      await API.post("/api/notifications/broadcast", {
        title: "Thông báo từ Admin",
        message,
      });

      alert("Đã gửi thông báo đến toàn bộ user!");
      setMessage("");
      setShowPanel(null);
    } catch (err) {
      console.error(err);
      alert("Lỗi gửi broadcast.");
    }
  };

  // Gửi thông báo RIÊNG USER
  const sendToUser = async () => {
    if (!activeUser) return alert("Chưa chọn user!");
    if (!message.trim()) return alert("Nhập nội dung!");

    try {
      await API.post("/api/notifications/private", {
        toUserId: activeUser._id,
        title: "Tin nhắn từ Admin",
        message,
      });

      alert(`Đã gửi tới ${activeUser.name}!`);
      setMessage("");
      setShowPanel(null);
    } catch (err) {
      console.error(err);
      alert("Lỗi gửi tin nhắn riêng.");
    }
  };

  return (
    <>
      {/* ⬅ MINI SIDEBAR 3 NÚT (KHÔNG MÔ TẢ) */}
      <div className={`rp-mini ${open ? "open" : ""}`}>
        
        {/* Toggle mini panel */}
        <button className="rp-btn-small" onClick={() => setOpen(!open)}>
          {open ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Icon mở popup tin nhắn */}
        {open && (
          <button className="rp-btn-small" onClick={() => setShowPanel("message")}>
            <MessageCircle size={20} />
          </button>
        )}

        {/* Icon mở popup settings */}
        {open && (
          <button className="rp-btn-small" onClick={() => setShowPanel("settings")}>
            <Settings size={20} />
          </button>
        )}
      </div>

      {/* 📩 POPUP MESSAGE PANEL */}
      {showPanel === "message" && (
        <div className="rp-popup">
          <div className="rp-popup-header">
            <h3>
              {activeUser
                ? `Gửi tới: ${activeUser.name}`
                : "Gửi thông báo toàn hệ thống"}
            </h3>

            <button className="rp-close" onClick={() => setShowPanel(null)}>
              <X size={22} />
            </button>
          </div>

          <div className="rp-popup-body">
            <textarea
              className="rp-textarea"
              placeholder="Nhập nội dung..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {activeUser ? (
              <button className="rp-send" onClick={sendToUser}>
                Gửi cho {activeUser.name}
              </button>
            ) : (
              <button className="rp-send" onClick={sendBroadcast}>
                Gửi toàn bộ user
              </button>
            )}
          </div>
        </div>
      )}

      {/* ⚙ POPUP SETTINGS */}
      {showPanel === "settings" && (
        <div className="rp-popup">
          <div className="rp-popup-header">
            <h3>Cài đặt hệ thống</h3>
            <button className="rp-close" onClick={() => setShowPanel(null)}>
              <X size={22} />
            </button>
          </div>

          <div className="rp-popup-body">
            <p className="rp-placeholder">Tính năng đang phát triển...</p>
          </div>
        </div>
      )}
    </>
  );
}
