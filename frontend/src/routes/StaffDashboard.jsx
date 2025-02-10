import React from "react";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProductList from "../pages/admin/ProductList";
import EventList from "../pages/admin/EventList";
import { UserInfo } from "../constants";
import "../styles/StaffDashboard.css";
import ProductDetails from "../pages/user/ProductDetails";
import UserList from "../pages/admin/UserList";



function LogOut() {
  localStorage.clear();
  return <Navigate to="/login" replace={true} />;
}

function RegisterUsers() {
  return <Register />;
}

function StaffDashboard() {
  const profile = localStorage.getItem(UserInfo);

  return (
    <div className="staff-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1>Staff Dashboard</h1>
        <div className="profile-info">
          <h3>Welcome back, {profile.username || "Admin"}!</h3>
        </div>
        <ul>
          <li>
            <Link to="register-user">Register User</Link>
          </li>
          <li>
            <Link to="manage-user">Manage User</Link>
          </li>
          <li>
            <Link to="manage-stores">Manage Stores</Link>
          </li>
          <li>
            <Link to="manage-events">Manage Events</Link>
          </li>
          <li>
            <Link to="logout">Log Out</Link>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="content">
        <Routes>
          <Route path="register-user" element={<RegisterUsers />} />
          <Route path="manage-user" element={<UserList />} />
          <Route path="manage-stores" element={<ProductList />} />
          <Route path="manage-events" element={<EventList />} />
          <Route path="login" element={<Login />} />
          <Route path="logout" element={<LogOut />} />
        </Routes>
      </main>
    </div>
  );
}

export default StaffDashboard;
