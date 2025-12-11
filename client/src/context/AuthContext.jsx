// import React, { createContext, useContext, useState, useEffect } from "react";
// import { io } from "socket.io-client";
// import API from "../api/http";

// // --------------------------
// // SOCKET.IO — KHỞI TẠO 1 LẦN
// // --------------------------
// export const socket = io("http://localhost:4000", {
//   autoConnect: false, // tránh tự kết nối khi chưa login
// });

// const AuthContext = createContext();
// socket.connect();
// socket.emit("bind-user", userData._id);
// socket.emit("user-online", userData._id);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // ------------------------------------------------------
//   // LOAD USER TỪ LOCALSTORAGE → TỰ ĐỘNG KẾT NỐI SOCKET
//   // ------------------------------------------------------
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     const token = localStorage.getItem("token");

//     if (storedUser && token) {
//       const u = JSON.parse(storedUser);
//       setUser(u);

//       API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//       // ⚡ connect socket
//       socket.connect();

//       // ⚡ emit user online ngay sau khi connect
//       socket.emit("user-online", u._id);
//     }

//     setLoading(false);
//   }, []);

//   // ------------------------------------------------------
//   // LOGIN
//   // ------------------------------------------------------
//   const login = (token, userData) => {
//     localStorage.setItem("token", token);
//     localStorage.setItem("user", JSON.stringify(userData));

//     API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     setUser(userData);

//     socket.connect();
//     socket.emit("user-online", userData._id);
//   };

//   // ------------------------------------------------------
//   // LOGOUT
//   // ------------------------------------------------------
//   const logout = () => {
//     if (user?._id) {
//       socket.emit("user-offline", user._id);
//     }

//     socket.disconnect();

//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     delete API.defaults.headers.common["Authorization"];

//     setUser(null);
//   };

//   // ------------------------------------------------------
//   // HANDLE TAB CLOSED → user-offline
//   // ------------------------------------------------------
//   useEffect(() => {
//     const handleClose = () => {
//       const u = JSON.parse(localStorage.getItem("user") || "null");
//       if (u?._id) {
//         navigator.sendBeacon(
//           "http://localhost:4000/api/auth/offline",
//           JSON.stringify({ userId: u._id })
//         );
//       }
//     };

//     window.addEventListener("beforeunload", handleClose);
//     return () => window.removeEventListener("beforeunload", handleClose);
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{ user, setUser, login, logout, loading }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }
import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import API from "../api/http";

// Tạo socket một lần
export const socket = io("http://localhost:4000", {
  autoConnect: false,
});

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // UPDATE USER – dùng cho profile (avatar, name, wallet...)
  // ======================================================
  const updateUser = (value) => {
    setUser((prev) => {
      const newUser = typeof value === "function" ? value(prev) : value;
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  // ======================================================
  // LOAD USER TỪ LOCAL STORAGE
  // ======================================================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const u = JSON.parse(storedUser);
      setUser(u);

      API.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

      // Kết nối socket 1 lần
      socket.connect();

      socket.once("connect", () => {
        socket.emit("bind-user", u._id);
        socket.emit("user-online", u._id);
      });
    }

    setLoading(false);
  }, []);

  // ======================================================
  // LOGIN
  // ======================================================
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);

    socket.connect();

    socket.once("connect", () => {
      socket.emit("bind-user", userData._id);
      socket.emit("user-online", userData._id);
    });
  };

  // ======================================================
  // LOGOUT
  // ======================================================
  const logout = () => {
    if (user?._id) socket.emit("user-offline", user._id);

    socket.disconnect();

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    delete API.defaults.headers.common["Authorization"];

    setUser(null);
  };

  // ======================================================
  // TAB CLOSED → SEND OFFLINE
  // ======================================================
  useEffect(() => {
    const handleClose = () => {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (u?._id) {
        navigator.sendBeacon(
          "http://localhost:4000/api/auth/offline",
          JSON.stringify({ userId: u._id })
        );
      }
    };

    window.addEventListener("beforeunload", handleClose);
    return () => window.removeEventListener("beforeunload", handleClose);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser, // <--- thêm hàm đúng chuẩn
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
