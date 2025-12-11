// import React, { useState } from "react";
// import "./Login.css";
// import API from "../../api/http.js";
// import { useAuth } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import leaf1 from "../../assets/leaf_01.png";
// import leaf2 from "../../assets/leaf_02.png";
// import leaf3 from "../../assets/leaf_03.png";
// import leaf4 from "../../assets/leaf_04.png";
// import bg from "../../assets/bg.jpg";
// import girl from "../../assets/girl.png";
// import trees from "../../assets/trees.png";

// function Login() {
//   const [mode, setMode] = useState("login");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       if (mode === "register") {
//         await API.post("/api/auth/register", { name, email, password });
//         toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
//         setMode("login");
//         setPassword("");
//         return;
//       } else {
//         const res = await API.post("/api/auth/login", { email, password });
//         const { token, user } = res.data;

//         login(token, user);
//         toast.success(`Xin chào ${user.name || "bạn"}!`);
//         setTimeout(() => navigate("/"), 1200);
//       }
//     } catch (err) {
//       console.error("Auth error:", err);
//       toast.error(
//         mode === "register"
//           ? "Email đã tồn tại hoặc không hợp lệ!"
//           : "Sai email hoặc mật khẩu!"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="no-scroll">
//       {/* 🌿 Lá rơi */}
//       <div className="leaves">
//         <div className="set">
//           {[leaf1, leaf2, leaf3, leaf4, leaf1, leaf2, leaf3, leaf4].map(
//             (src, i) => (
//               <div key={i}>
//                 <img src={src} alt="leaf" />
//               </div>
//             )
//           )}
//         </div>
//       </div>

//       {/* 🌄 Background */}
//       <img src={bg} className="bg" alt="" />
//       <img src={girl} className="girl" alt="" />
//       <img src={trees} className="trees" alt="" />

//       {/* 🔐 Form Auth */}
//       <form className="login" onSubmit={handleSubmit}>
//         <h2>{mode === "login" ? "Đăng nhập" : "Đăng kí"}</h2>

//         {/* Tabs chuyển chế độ */}
//         <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
//           <button
//             type="button"
//             onClick={() => setMode("login")}
//             style={{
//               padding: "8px 14px",
//               borderRadius: 8,
//               border: "1px solid rgba(255,255,255,0.6)",
//               background: mode === "login" ? "#8f2c24" : "rgba(255,255,255,0.25)",
//               color: mode === "login" ? "#fff" : "#8f2c24",
//               cursor: "pointer",
//             }}
//           >
//             Đăng nhập
//           </button>
//           <button
//             type="button"
//             onClick={() => setMode("register")}
//             style={{
//               padding: "8px 14px",
//               borderRadius: 8,
//               border: "1px solid rgba(255,255,255,0.6)",
//               background:
//                 mode === "register" ? "#8f2c24" : "rgba(255,255,255,0.25)",
//               color: mode === "register" ? "#fff" : "#8f2c24",
//               cursor: "pointer",
//             }}
//           >
//             Đăng ký
//           </button>
//         </div>

//         {/* Form input */}
//         {mode === "register" && (
//           <div className="inputBox" style={{ marginTop: 10 }}>
//             <input
//               type="text"
//               placeholder="Họ và tên"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required={mode === "register"}
//             />
//           </div>
//         )}

//         <div className="inputBox">
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             autoComplete="email"
//           />
//         </div>

//         <div className="inputBox">
//           <input
//             type="password"
//             placeholder="Mật khẩu"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             autoComplete={mode === "login" ? "current-password" : "new-password"}
//           />
//         </div>

//         <div className="inputBox">
//           <input
//             type="submit"
//             value={
//               loading
//                 ? "Đang xử lý..."
//                 : mode === "login"
//                 ? "Đăng nhập"
//                 : "Đăng kí"
//             }
//             id="btn"
//             disabled={loading}
//           />
//         </div>
//       </form>
//     </section>
//   );
// }

// export default Login;
import React, { useState, useEffect } from "react";
import "./Login.css";
import API from "../../api/http.js";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import leaf1 from "../../assets/leaf_01.png";
import leaf2 from "../../assets/leaf_02.png";
import leaf3 from "../../assets/leaf_03.png";
import leaf4 from "../../assets/leaf_04.png";
import bg from "../../assets/bg.jpg";
import girl from "../../assets/girl.png";
import trees from "../../assets/trees.png";

function Login() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ================================
  // Đọc lý do bị đá / hết hạn token
  // ================================
  useEffect(() => {
    const reason = localStorage.getItem("logoutReason");

    if (reason === "locked") {
      toast.error(
        "Tài khoản của bạn đã bị admin khoá rồi 😢. Inbox admin để nhờ mở lại nha."
      );
    } else if (reason === "expired") {
      toast.info(
        "Phiên đăng nhập đã hết hạn, mình đăng nhập lại xíu nha 😉."
      );
    } else if (reason === "auth") {
      toast.info("Bạn cần đăng nhập để tiếp tục nè ✨.");
    }

    if (reason) {
      localStorage.removeItem("logoutReason");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        await API.post("/api/auth/register", { name, email, password });
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        setMode("login");
        setPassword("");
        return;
      } else {
        const res = await API.post("/api/auth/login", { email, password });
        const { token, user } = res.data;

        login(token, user);
        toast.success(`Xin chào ${user.name || "bạn"}!`);
        setTimeout(() => navigate("/"), 1200);
      }
        } catch (err) {
      console.error("Auth error:", err);

      const status = err.response?.status;
      // const msg = err.response?.data?.message || ""; // không cần nữa

      if (mode === "register") {
        // Giữ logic cũ cho register
        toast.error("Email đã tồn tại hoặc không hợp lệ!");
      } else {
        // Login
        if (status === 403) {
          toast.error(
            "Tài khoản này đang bị khoá nên tạm thời chưa đăng nhập được nha 😭. Liên hệ admin để mở lại giúp nhé."
          );
        } else if (status === 401) {
          toast.error(
            "Sai email hoặc mật khẩu rồi á 😅. Check lại giúp mình nha!"
          );
        } else {
          toast.error(
            "Có lỗi gì đó hơi lạ, bạn thử lại sau một xíu nha 😭."
          );
        }
      }
    } finally {
      setLoading(false);
    }

  };

  return (
    <section className="no-scroll">
      {/* 🌿 Lá rơi */}
      <div className="leaves">
        <div className="set">
          {[leaf1, leaf2, leaf3, leaf4, leaf1, leaf2, leaf3, leaf4].map(
            (src, i) => (
              <div key={i}>
                <img src={src} alt="leaf" />
              </div>
            )
          )}
        </div>
      </div>

      {/* 🌄 Background */}
      <img src={bg} className="bg" alt="" />
      <img src={girl} className="girl" alt="" />
      <img src={trees} className="trees" alt="" />

      {/* 🔐 Form Auth */}
      <form className="login" onSubmit={handleSubmit}>
        <h2>{mode === "login" ? "Đăng nhập" : "Đăng kí"}</h2>

        {/* Tabs chuyển chế độ */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => setMode("login")}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.6)",
              background:
                mode === "login" ? "#8f2c24" : "rgba(255,255,255,0.25)",
              color: mode === "login" ? "#fff" : "#8f2c24",
              cursor: "pointer",
            }}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.6)",
              background:
                mode === "register" ? "#8f2c24" : "rgba(255,255,255,0.25)",
              color: mode === "register" ? "#fff" : "#8f2c24",
              cursor: "pointer",
            }}
          >
            Đăng ký
          </button>
        </div>

        {/* Form input */}
        {mode === "register" && (
          <div className="inputBox" style={{ marginTop: 10 }}>
            <input
              type="text"
              placeholder="Họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={mode === "register"}
            />
          </div>
        )}

        <div className="inputBox">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="inputBox">
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        <div className="inputBox">
          <input
            type="submit"
            value={
              loading
                ? "Đang xử lý..."
                : mode === "login"
                ? "Đăng nhập"
                : "Đăng kí"
            }
            id="btn"
            disabled={loading}
          />
        </div>
      </form>
    </section>
  );
}

export default Login;
