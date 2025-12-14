import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { SidebarProvider } from "./context/SidebarContext";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./context/AuthContext";  
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
     <ThemeProvider>
        <AuthProvider>
        <SidebarProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
        </SidebarProvider>
      </AuthProvider>
     </ThemeProvider>
  </React.StrictMode>
);
