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
    <div className="user-dashboard">
      <nav className="sidebar">
        <Link to="/">Home</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/incentives">Incentives</Link>
        <Link to="/events">Events</Link>
        <Link to="/logout">Log Out</Link>
      </nav>

      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/incentives" element={<IncentiveProgram />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/logout" element={<LogOut />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default UserDashboard;
