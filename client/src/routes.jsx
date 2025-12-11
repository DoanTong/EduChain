  // // src/AppRoutes.jsx
  // import React from "react";
  // import { BrowserRouter, Routes, Route } from "react-router-dom";
  // import Home from "./pages/Home.jsx";
  // import AdminDashboard from "./pages/manager/AdminDashboard.jsx";
  // import Verify from "./pages/verify/Verify.jsx";
  // import Login from "./pages/Auth/Login.jsx";
  // import ProtectedRoute from "./components/ProtectedRoute.jsx";
  // import QuestionEditor from "./pages/questions/QuestionEditor.jsx";
  // // 🧩 Import Toastify global
  // import { ToastContainer, Slide } from "react-toastify";
  // import "react-toastify/dist/ReactToastify.css";

  // import RoleManagement from "./pages/admin/roles/RoleManagement.jsx";
  // import UserManagement from "./pages/admin/users/UserManagement.jsx";

  // import DoExam from "./pages/exam/DoExam.jsx";

  // import ExamSessionPage from "./pages/exam/ExamSessionPage";
  // import ReviewExamSession from "./pages/exam/review/ReviewExamSession";

  // import LatestExams from "./pages/exam/LatestExams/LatestExams.jsx";
  // import ExamHistory from "./pages/exam/history/ExamHistory";
  // import Profile from "./pages/Profile/Profile.jsx";
  // import MyCertificates from "./pages/Certificates/MyCertificates.jsx";


  // function AppRoutes() {
  //   return (
  //     <BrowserRouter>
  //       <Routes>
  //         {/* 🌐 Public routes */}
  //         <Route path="/" element={<Home />} />
  //         <Route path="/verify" element={<Verify />} />
  //         <Route path="/login" element={<Login />} />

  //         {/* 🔒 Protected: chỉ admin được phép vào */}
  //         <Route
  //           path="/admin"
  //           element={
  //             <ProtectedRoute requireAdmin>
  //               <AdminDashboard />
  //             </ProtectedRoute>
  //           }
  //         />
  //         <Route
  //           path="/questions/:examId"
  //           element={
  //             <ProtectedRoute requireAdmin>
  //               <QuestionEditor />
  //             </ProtectedRoute>
  //           }
  //         />
  //         <Route path="/exam/:examId" element={<DoExam />} />

  //         <Route
  //           path="/admin/roles"
  //           element={
  //             <ProtectedRoute requireAdmin>
  //               <RoleManagement />
  //             </ProtectedRoute>
  //           }
  //         />
  //         <Route
  //           path="/admin/users"
  //           element={
  //             <ProtectedRoute requireAdmin>
  //               <UserManagement />
  //             </ProtectedRoute>
  //           }
  //         />
  //         <Route path="/exam-session/:id" element={<ExamSessionPage />} />
          
  //         <Route
  //           path="/exam-session/:id/review"
  //           element={<ReviewExamSession />}
  //         />  
  //         <Route path="/exam/latest" element={<LatestExams />} />
  //         <Route path="/exam/history" element={<ExamHistory />} />

  //         <Route
  //           path="/profile"
  //           element={
  //             <ProtectedRoute>
  //               <Profile />
  //             </ProtectedRoute>
  //           }
  //         />
  //         <Route path="/my-certificates" element={<MyCertificates />} />
  //       </Routes>

  //       {/* ✅ Popup toàn cục cho toàn bộ app */}
  //       <ToastContainer
  //         position="bottom-right"   // 👈 góc phải dưới
  //         autoClose={2500}
  //         hideProgressBar={false}
  //         newestOnTop={false}
  //         closeOnClick
  //         pauseOnHover
  //         draggable
  //         transition={Slide}        // 👈 hiệu ứng trượt
  //         theme="colored"           // 👈 màu sắc tự động (success, error, warning)
  //       />
  //     </BrowserRouter>
  //   );
  // }

  // export default AppRoutes;
// src/AppRoutes.jsx






import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Auth/Login.jsx";
import Verify from "./pages/verify/Verify.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

// ADMIN PAGES
import AdminHome from "./pages/manager/AdminHome.jsx";
import AdminDashboard from "./pages/manager/AdminDashboard.jsx";
import RoleManagement from "./pages/admin/roles/RoleManagement.jsx";
import UserManagement from "./pages/admin/users/UserManagement.jsx";

// EXAM PAGES
import DoExam from "./pages/exam/DoExam.jsx";
import QuestionEditor from "./pages/questions/QuestionEditor.jsx";
import ExamSessionPage from "./pages/exam/ExamSessionPage";
import ReviewExamSession from "./pages/exam/review/ReviewExamSession.jsx";
import LatestExams from "./pages/exam/LatestExams/LatestExams.jsx";
import ExamHistory from "./pages/exam/history/ExamHistory.jsx";

// USER PAGES
import Profile from "./pages/Profile/Profile.jsx";
import MyCertificates from "./pages/Certificates/MyCertificates.jsx";

import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/login" element={<Login />} />

        {/* ADMIN AREA */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminHome />     {/* 🎯 TRANG CHÍNH ADMIN */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />  {/* Tab Dashboard */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute requireAdmin>
              <RoleManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* ADMIN EDITOR */}
        <Route
          path="/questions/:examId"
          element={
            <ProtectedRoute requireAdmin>
              <QuestionEditor />
            </ProtectedRoute>
          }
        />

        {/* EXAM */}
        <Route path="/exam/:examId" element={<DoExam />} />
        <Route path="/exam-session/:id" element={<ExamSessionPage />} />
        <Route path="/exam-session/:id/review" element={<ReviewExamSession />} />
        <Route path="/exam/latest" element={<LatestExams />} />
        <Route path="/exam/history" element={<ExamHistory />} />

        {/* USER */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="/my-certificates" element={<MyCertificates />} />
        <Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute requireAdmin>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/profile/:id"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
<Route path="/verify/result/:contentHash" element={<Verify />} />


      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        hideProgressBar={false}
        transition={Slide}
        theme="colored"
      />
    </BrowserRouter>
  );
}

export default AppRoutes;
