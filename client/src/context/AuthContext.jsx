// import React, { createContext, useContext, useState, useEffect } from "react";
// import { io } from "socket.io-client";
// import API from "../api/http";

// // Tạo socket một lần
// export const socket = io("http://localhost:4000", {
//   autoConnect: false,
// });

// const AuthContext = createContext();

// export function AuthProvider({ children }) {

//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // ======================================================
//   // UPDATE USER – dùng cho profile (avatar, name, wallet...)
//   // ======================================================
//   const updateUser = (value) => {
//     setUser((prev) => {
//       const newUser = typeof value === "function" ? value(prev) : value;
//       localStorage.setItem("user", JSON.stringify(newUser));
//       return newUser;
//     });
//   };

//   // ======================================================
//   // LOAD USER TỪ LOCAL STORAGE
//   // ======================================================
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     const storedToken = localStorage.getItem("token");

//     if (storedUser && storedToken) {
//       const u = JSON.parse(storedUser);
//       setUser(u);

//       API.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

//       // Kết nối socket 1 lần
//       socket.connect();

//       socket.once("connect", () => {
//         socket.emit("bind-user", u._id);
//         socket.emit("user-online", u._id);
//       });
//     }

//     setLoading(false);
//   }, []);

//   // ======================================================
//   // LOGIN
//   // ======================================================
//   const login = (token, userData) => {
//     localStorage.setItem("token", token);
//     localStorage.setItem("user", JSON.stringify(userData));

//     API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     setUser(userData);

//     socket.connect();

//     socket.once("connect", () => {
//       socket.emit("bind-user", userData._id);
//       socket.emit("user-online", userData._id);
//     });
//   };

//   // ======================================================
//   // LOGOUT
//   // ======================================================
//   const logout = () => {
//     if (user?._id) socket.emit("user-offline", user._id);

//     socket.disconnect();

//     localStorage.removeItem("user");
//     localStorage.removeItem("token");

//     delete API.defaults.headers.common["Authorization"];

//     setUser(null);
//   };

//   // ======================================================
//   // TAB CLOSED → SEND OFFLINE
//   // ======================================================
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
//       value={{
//         user,
//         loading,
//         login,
//         logout,
//         updateUser, // <--- thêm hàm đúng chuẩn
//       }}
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

// ✅ Dùng env cho cả local + production
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000";

// ✅ Tạo socket 1 lần
export const socket = io(BASE_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: true,
});

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateUser = (value) => {
    setUser((prev) => {
      const newUser = typeof value === "function" ? value(prev) : value;
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  // ✅ helper: connect + bind user an toàn (không bị miss connect)
  const bindSocket = (userId) => {
    if (!userId) return;

    const emitBind = () => {
      socket.emit("bind-user", userId);
      socket.emit("user-online", userId);
    };

    if (socket.connected) {
      emitBind();
    } else {
      socket.connect();
      socket.once("connect", emitBind);
    }
  };

  // LOAD USER TỪ LOCAL STORAGE
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const u = JSON.parse(storedUser);
      setUser(u);

      API.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

      bindSocket(u._id);
    }

    setLoading(false);
  }, []);

  // LOGIN
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);

    bindSocket(userData._id);
  };

  // LOGOUT
  const logout = () => {
    if (user?._id) socket.emit("user-offline", user._id);
    socket.disconnect();

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete API.defaults.headers.common["Authorization"];

    setUser(null);
  };

  // TAB CLOSED → SEND OFFLINE (✅ không hardcode localhost)
  useEffect(() => {
    const handleClose = () => {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (u?._id) {
        navigator.sendBeacon(
          `${BASE_URL}/api/auth/offline`,
          JSON.stringify({ userId: u._id })
        );
      }
    };

    window.addEventListener("beforeunload", handleClose);
    return () => window.removeEventListener("beforeunload", handleClose);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
