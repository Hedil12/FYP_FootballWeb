import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import UserDashboard from "./routes/UserDashboard";
import StaffDashboard from "./routes/StaffDashboard";
import Register from "./pages/Register";

function LogOut() {
  localStorage.clear();
  return <Navigate to="/login" replace={true} />;
}

function RegisterandLogOut() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin-Dashboard/*"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-Dashboard/*"
          element={
            <ProtectedRoute allowedRoles={['User']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/logout" element={<LogOut />} />
        <Route path="/register" element={<RegisterandLogOut />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;