// src/api/http.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:4000", // ✅ mặc định 4000
});

export default API;
