import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { SidebarProvider } from "./context/SidebarContext";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./context/AuthContext";  

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SidebarProvider>
        <SearchProvider>
          <App />
        </SearchProvider>
      </SidebarProvider>
    </AuthProvider>
  </React.StrictMode>
);
