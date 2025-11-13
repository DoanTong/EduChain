import React, { useState } from "react";
import "./Login.css";
import API from "../../api/http.js";
import { useAuth } from "../../hooks/useAuth.js";
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
      toast.error(
        mode === "register"
          ? "Email đã tồn tại hoặc không hợp lệ!"
          : "Sai email hoặc mật khẩu!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
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
              background: mode === "login" ? "#8f2c24" : "rgba(255,255,255,0.25)",
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
