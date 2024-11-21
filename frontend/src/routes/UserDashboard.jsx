import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import IncentiveProgram from "../pages/IncentiveProgram";
import EventList from "../pages/EventList";
import NotFound from "../pages/NotFound";

function LogOut() {
  localStorage.clear();
  return <Navigate to="/login" replace={true} />;
}

function UserDashboard() {
  return (
    <div className="container">
      <h1>User Dashboard</h1>
      <nav>
        <Link to="home">Home</Link> | <Link to="profile">Profile</Link>
      </nav>
      <Routes>
        <Route path="home" element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="incentives" element={<IncentiveProgram />} />
        <Route path="events" element={<EventList />} />
        <Route path="logout" element={<LogOut />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default UserDashboard;
