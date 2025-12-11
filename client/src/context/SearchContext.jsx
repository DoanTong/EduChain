// // src/context/SearchContext.jsx
// import React, { createContext, useContext, useState } from "react";

// const SearchContext = createContext();

// export const SearchProvider = ({ children }) => {
//   const [inputText, setInputText] = useState("");   // đang gõ
//   const [keyword, setKeyword] = useState("");       // filter sau Enter
//   const [suggestions, setSuggestions] = useState([]); // gợi ý
  
//   return (
//     <SearchContext.Provider
//       value={{
//         inputText,
//         setInputText,
//         keyword,
//         setKeyword,
//         suggestions,
//         setSuggestions,
//       }}
//     >
//       {children}
//     </SearchContext.Provider>
//   );
// };

// export const useSearch = () => useContext(SearchContext);
// src/context/SearchContext.jsx
import React, { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  // =========================
  // SEARCH BÀI THI (CHO USER)
  // =========================
  const [inputText, setInputText] = useState("");    // Đang gõ trong search bar
  const [keyword, setKeyword] = useState("");        // Từ khóa đã submit
  const [suggestions, setSuggestions] = useState([]); // Gợi ý bài thi

  // =========================
  // SEARCH USER (CHO ADMIN)
  // =========================
  const [userSearch, setUserSearch] = useState("");  // Từ khóa lọc user trong AdminHome

  return (
    <SearchContext.Provider
      value={{
        // SEARCH EXAMS
        inputText,
        setInputText,
        keyword,
        setKeyword,
        suggestions,
        setSuggestions,

        // SEARCH USERS
        userSearch,
        setUserSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
