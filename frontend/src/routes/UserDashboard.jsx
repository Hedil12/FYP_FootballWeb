import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import IncentiveProgram from "../pages/IncentiveProgram";
import EventList from "../pages/EventList";

function LogOut() {
  localStorage.clear();
  return <Navigate to="/login" replace={true} />;
}

function UserDashboard() {
  return (
    <div className="container">
      <h1>User Dashboard</h1>
      <Routes>
        <Route path="/user/home" element={<Navigate to="/home" />} />
        <Route path="home" element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="incentives" element={<IncentiveProgram />} />
        <Route path="events" element={<EventList />} />
        <Route path="logout" element={<LogOut />} />
      </Routes>
    </div>
  );
}

export default UserDashboard;
