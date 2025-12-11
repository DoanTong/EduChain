// import React, { useState, useRef } from "react";
// import API from "../../api/http";
// import { useAuth } from "../../context/AuthContext";
// import { toast } from "react-toastify";

// import {
//   Camera,
//   Wallet,
//   LogOut,
//   Save,
//   Mail,
//   ArrowLeftCircle,
//   Home,
// } from "lucide-react";

// import "./Profile.css";
// import { useNavigate } from "react-router-dom";

// function Profile() {
//   const { user, updateUser, logout } = useAuth();
//   const navigate = useNavigate();

//   const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

//   // ============================ INIT AVATAR URL ============================
//   const initialAvatar =
//     user?.avatar && user.avatar.startsWith("/uploads")
//       ? BASE + user.avatar
//       : user?.avatar ||
//         "https://ui-avatars.com/api/?name=" +
//           encodeURIComponent(user?.name || "User") +
//           "&background=2563eb&color=fff";

//   const [avatarPreview, setAvatarPreview] = useState(initialAvatar);

//   const [name, setName] = useState(user?.name || "");
//   const [currentPw, setCurrentPw] = useState("");
//   const [newPw, setNewPw] = useState("");
//   const [wallet, setWallet] = useState(user?.wallet || null);

//   const fileInputRef = useRef(null);

//   // ============================ AVATAR ============================
//   const chooseAvatar = () => fileInputRef.current?.click();

//   const handleAvatarUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const localUrl = URL.createObjectURL(file);
//     setAvatarPreview(localUrl);

//     const form = new FormData();
//     form.append("avatar", file);

//     try {
//       const res = await API.post("/api/users/avatar", form);

//       const relative = res.data?.avatarUrl;
//       const fullUrl = relative.startsWith("http") ? relative : BASE + relative;

//       setAvatarPreview(fullUrl);
//       updateUser({ ...user, avatar: fullUrl });

//       toast.success("Cập nhật ảnh đại diện thành công!");
//     } catch {
//       toast.error("Không thể upload ảnh");
//     }
//   };

//   // ============================ WALLET ============================
//   const connectWallet = async () => {
//     try {
//       if (!window.ethereum) return toast.error("Vui lòng cài MetaMask");

//       const accounts = await window.ethereum.request({
//         method: "eth_requestAccounts",
//       });

//       const selected = accounts[0];

//       setWallet(selected);
//       await API.put("/api/users/wallet", { wallet: selected });
//       updateUser({ ...user, wallet: selected });

//       toast.success("Kết nối ví thành công");
//     } catch {
//       toast.error("Kết nối ví thất bại");
//     }
//   };

//   const disconnectWallet = async () => {
//     await API.put("/api/users/wallet", { wallet: null });
//     updateUser({ ...user, wallet: null });
//     setWallet(null);
//     toast.info("Đã ngắt kết nối ví");
//   };

//   // ============================ UPDATE NAME ============================
//   const saveProfile = async () => {
//     try {
//       await API.put("/api/users/update", { name });
//       updateUser({ ...user, name });
//       toast.success("Đã cập nhật hồ sơ");
//     } catch {
//       toast.error("Không thể cập nhật");
//     }
//   };

//   // ============================ CHANGE PASSWORD ============================
//   const changePassword = async () => {
//     if (!currentPw || !newPw)
//       return toast.warning("Vui lòng nhập đầy đủ thông tin");

//     try {
//       await API.put("/api/users/change-password", {
//         currentPassword: currentPw,
//         newPassword: newPw,
//       });

//       setCurrentPw("");
//       setNewPw("");
//       toast.success("Đổi mật khẩu thành công!");
//     } catch {
//       toast.error("Đổi mật khẩu thất bại");
//     }
//   };

//   return (
//     <div className="upro-wrapper">

//       {/* ===================== TOPBAR ===================== */}
//       <div className="upro-topbar">
//         <div className="left">
//           <button className="top-btn" onClick={() => navigate("/")}>
//             <ArrowLeftCircle size={22} />
//             <span>Quay lại</span>
//           </button>

//           <button className="top-btn" onClick={() => navigate("/")}>
//             <Home size={20} />
//             Trang chủ
//           </button>
//         </div>

//         <div className="right">
//           <img src={avatarPreview} className="top-avatar" />
//           <span className="top-name">{user?.name}</span>
//           <button className="logout-btn" onClick={logout}>
//             <LogOut size={18} />
//           </button>
//         </div>
//       </div>

//       {/* ===================== MAIN CARD ===================== */}
//       <div className="upro-page">
//         <div className="upro-card">
//           {/* COVER */}
//           <div className="upro-cover">
//             <div className="upro-cover-layer"></div>

//             {/* Avatar + Name */}
//             <div className="upro-header">
//               <div className="upro-avatar">
//                 <img src={avatarPreview} alt="avatar" />
//                 <button className="upro-avatar-btn" onClick={chooseAvatar}>
//                   <Camera size={18} />
//                 </button>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   ref={fileInputRef}
//                   style={{ display: "none" }}
//                   onChange={handleAvatarUpload}
//                 />
//               </div>

//               <div className="upro-info">
//                 <h1 className="upro-name">{user?.name}</h1>
//                 <span className="upro-email">
//                   <Mail size={14} /> {user?.email}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* BODY */}
//           <div className="upro-body">
//             {/* LEFT */}
//             <div className="upro-section">
//               <h2 className="upro-title">Thông tin cơ bản</h2>

//               <label className="upro-label">Tên hiển thị</label>
//               <input
//                 className="upro-input"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />

//               <button className="upro-btn purple" onClick={saveProfile}>
//                 <Save size={18} /> Lưu thay đổi
//               </button>

//               <div className="upro-divider"></div>

//               <h2 className="upro-title">Đổi mật khẩu</h2>

//               <label className="upro-label">Mật khẩu hiện tại</label>
//               <input
//                 type="password"
//                 className="upro-input"
//                 value={currentPw}
//                 onChange={(e) => setCurrentPw(e.target.value)}
//               />

//               <label className="upro-label">Mật khẩu mới</label>
//               <input
//                 type="password"
//                 className="upro-input"
//                 value={newPw}
//                 onChange={(e) => setNewPw(e.target.value)}
//               />

//               <button className="upro-btn green" onClick={changePassword}>
//                 Đổi mật khẩu
//               </button>
//             </div>

//             {/* RIGHT */}
//             <div className="upro-section">
//               <h2 className="upro-title">Ví Blockchain</h2>

//               {wallet ? (
//                 <div className="upro-wallet connected">
//                   <Wallet size={18} />
//                   <code>{wallet}</code>
//                 </div>
//               ) : (
//                 <div className="upro-wallet">
//                   <Wallet size={18} />
//                   <span>Chưa kết nối ví</span>
//                 </div>
//               )}

//               {!wallet ? (
//                 <button className="upro-btn blue" onClick={connectWallet}>
//                   <Wallet size={18} /> Kết nối MetaMask
//                 </button>
//               ) : (
//                 <button className="upro-btn red" onClick={disconnectWallet}>
//                   <LogOut size={18} /> Ngắt kết nối ví
//                 </button>
//               )}

//               <p className="upro-note">
//                 Ví dùng để nhận chứng chỉ NFT khi bạn đủ điều kiện.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Profile;
import React, { useState, useRef, useEffect } from "react";
import API from "../../api/http";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import {
  Camera,
  Wallet,
  LogOut,
  Save,
  Mail,
  ArrowLeftCircle,
  Home,
} from "lucide-react";
import "./Profile.css";
import { useNavigate, useParams } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: loggedInUser, updateUser, logout } = useAuth();

  const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  // ---------------------------------------------------------
  // 🔵 STATE — luôn cố định thứ tự để không gây hook mismatch
  // ---------------------------------------------------------
  const [viewingUser, setViewingUser] = useState(null);
  const [isOwner, setIsOwner] = useState(true);

  const [avatarPreview, setAvatarPreview] = useState("");
  const [name, setName] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [wallet, setWallet] = useState(null);

  const fileInputRef = useRef(null);

  // ---------------------------------------------------------
  // 🔵 Load user theo URL hoặc theo user hiện tại
  // ---------------------------------------------------------
  useEffect(() => {
    if (!id || id === loggedInUser?._id) {
      // Xem profile của chính mình
      setViewingUser(loggedInUser);
      setIsOwner(true);
    } else {
      // Xem profile của người khác
      const load = async () => {
        try {
          const res = await API.get(`/api/users/${id}`);
          setViewingUser(res.data.data);
          setIsOwner(false);
        } catch (err) {
          toast.error("Không tìm thấy người dùng");
        }
      };
      load();
    }
  }, [id, loggedInUser]);

  // ---------------------------------------------------------
  // 🔵 Khi viewingUser thay đổi → cập nhật avatar/name/wallet
  // ---------------------------------------------------------
  useEffect(() => {
    if (!viewingUser) return;

    const initialAvatar =
      viewingUser.avatar?.startsWith("/uploads")
        ? BASE + viewingUser.avatar
        : viewingUser.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            viewingUser.name || "User"
          )}&background=2563eb&color=fff`;

    setAvatarPreview(initialAvatar);
    setName(viewingUser.name);
    setWallet(viewingUser.wallet);
  }, [viewingUser]);

  // ---------------------------------------------------------
  // 🔵 Nếu viewingUser chưa load xong → show loading stable
  // ---------------------------------------------------------
  if (!viewingUser) {
    return <div className="upro-wrapper">Đang tải...</div>;
  }

  // ---------------------------------------------------------
  // 🔵 HANDLERS (avatar / wallet / profile / password)
  // ---------------------------------------------------------
  const chooseAvatar = () => {
    if (!isOwner) return;
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e) => {
    if (!isOwner) return;

    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));

    const form = new FormData();
    form.append("avatar", file);

    try {
      const res = await API.post("/api/users/avatar", form);
      const relative = res.data.avatarUrl;
      const fullUrl = relative.startsWith("http")
        ? relative
        : BASE + relative;

      setAvatarPreview(fullUrl);
      updateUser((prev) => ({ ...prev, avatar: fullUrl }));
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch {
      toast.error("Không thể upload ảnh");
    }
  };

  const connectWallet = async () => {
    if (!isOwner) return;

    try {
      if (!window.ethereum)
        return toast.error("Vui lòng cài MetaMask");

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const selected = accounts[0];

      setWallet(selected);
      await API.put("/api/users/wallet", { wallet: selected });
      updateUser((prev) => ({ ...prev, wallet: selected }));
      toast.success("Kết nối ví thành công");
    } catch {
      toast.error("Kết nối ví thất bại");
    }
  };

  const saveProfile = async () => {
    if (!isOwner) return;

    try {
      await API.put("/api/users/update", { name });
      updateUser((prev) => ({ ...prev, name }));
      toast.success("Đã cập nhật hồ sơ");
    } catch {
      toast.error("Không thể cập nhật");
    }
  };

  const changePassword = async () => {
    if (!isOwner) return;

    if (!currentPw || !newPw)
      return toast.warning("Vui lòng nhập đầy đủ");

    try {
      await API.put("/api/users/change-password", {
        currentPassword: currentPw,
        newPassword: newPw,
      });

      setCurrentPw("");
      setNewPw("");
      toast.success("Đổi mật khẩu thành công!");
    } catch {
      toast.error("Đổi mật khẩu thất bại");
    }
  };

  // ---------------------------------------------------------
  // 🔵 JSX RETURN — không có hook nào nằm dưới đây nữa
  // ---------------------------------------------------------
  return (
    <div className="upro-wrapper">
      {/* TOPBAR */}
      <div className="upro-topbar">
        <div className="left">
          <button className="top-btn" onClick={() => navigate(-1)}>
            <ArrowLeftCircle size={22} />
            <span>Quay lại</span>
          </button>

          <button className="top-btn" onClick={() => navigate("/")}>
            <Home size={20} />
            Trang chủ
          </button>
        </div>

        <div className="right">
          <img src={avatarPreview} className="top-avatar" />
          <span className="top-name">{viewingUser.name}</span>

          {isOwner && (
            <button className="logout-btn" onClick={logout}>
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="upro-page">
        <div className="upro-card">
          {/* COVER */}
          <div className="upro-cover">
            <div className="upro-cover-layer"></div>

            <div className="upro-header">
              <div className="upro-avatar">
                <img src={avatarPreview} alt="avatar" />
                {isOwner && (
                  <>
                    <button className="upro-avatar-btn" onClick={chooseAvatar}>
                      <Camera size={18} />
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleAvatarUpload}
                    />
                  </>
                )}
              </div>

              <div className="upro-info">
                <h1 className="upro-name">{viewingUser.name}</h1>
                <span className="upro-email">
                  <Mail size={14} /> {viewingUser.email}
                </span>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="upro-body">
            {/* LEFT SIDE */}
            <div className="upro-section">
              <h2 className="upro-title">Thông tin cơ bản</h2>

              <label className="upro-label">Tên hiển thị</label>
              <input
                className="upro-input"
                disabled={!isOwner}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              {isOwner && (
                <button className="upro-btn purple" onClick={saveProfile}>
                  <Save size={18} /> Lưu thay đổi
                </button>
              )}

              <div className="upro-divider"></div>

              {isOwner && (
                <>
                  <h2 className="upro-title">Đổi mật khẩu</h2>

                  <label className="upro-label">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    className="upro-input"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                  />

                  <label className="upro-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="upro-input"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                  />

                  <button className="upro-btn green" onClick={changePassword}>
                    Đổi mật khẩu
                  </button>
                </>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="upro-section">
              <h2 className="upro-title">Ví Blockchain</h2>

              {wallet ? (
                <div className="upro-wallet connected">
                  <Wallet size={18} />
                  <code>{wallet}</code>
                </div>
              ) : (
                <div className="upro-wallet">
                  <Wallet size={18} />
                  <span>Chưa kết nối ví</span>
                </div>
              )}

              {isOwner ? (
                !wallet ? (
                  <button className="upro-btn blue" onClick={connectWallet}>
                    <Wallet size={18} /> Kết nối MetaMask
                  </button>
                ) : (
                  <button
                    className="upro-btn red"
                    onClick={() => {
                      API.put("/api/users/wallet", { wallet: null });
                      updateUser((prev) => ({ ...prev, wallet: null }));
                      setWallet(null);
                      toast.info("Đã ngắt kết nối ví");
                    }}
                  >
                    <LogOut size={18} /> Ngắt kết nối ví
                  </button>
                )
              ) : (
                <p className="upro-note">
                  Không thể thao tác ví của người khác.
                </p>
              )}

              <p className="upro-note">
                Ví dùng để nhận chứng chỉ NFT khi bạn đủ điều kiện.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
