import React from "react";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProductList from "../pages/admin/ProductList";
import { UserInfo } from "../constants";

function LogOut() {
  localStorage.clear();
  return <Navigate to="/login" replace={true} />;
}

function RegisterUsers() {
  localStorage.clear();
  return <Register />;
}

function StaffDashboard() {
  const profile = localStorage.getItem(UserInfo);  // Ensure to parse the stored user info
  return (
    <div className="dashboard-container">
        <h1>Staff Dashboard</h1>
        <div className="profile-info">
        <h3>Welcome back, {profile.username || "Admin"}!</h3>
        </div>
        <ul>
          <li>
            <Link to="register-user">Register User</Link>
          </li>
          <li>
            <Link to="manage-stores">Manage Stores</Link>
          </li>
          <li>
            <Link to="logout">Log Out</Link>
          </li>
        </ul>

      <div className="dashboard-content">
        <Routes>
          <Route path="register-user" element={<RegisterUsers />} />
          <Route path="manage-stores" element={<ProductList />} />
          <Route path="login" element={<Login />} />
          <Route path="logout" element={<LogOut />} />
        </Routes>
      </div>
    </div>
  );
}

export default StaffDashboard;


/*
Template for final
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import ProductList from "../pages/admin/ProductList";
import EventList from "../pages/admin/EventList";

function LogOut() {
  localStorage.clear();
  return <Navigate to="/login" replace={true} />;
}

function StaffDashboard() {
  return (
    <BrowserRouter>
      <div className="dashboard-container">
        <h1>Staff Dashboard</h1>
        <nav className="dashboard-nav">
          <ul>
            <li>
              <Link to="/manage-users">Manage Users</Link>
            </li>
            <li>
              <Link to="/register-user">Register User</Link>
            </li>
            <li>
              <Link to="/manage-events">Manage Events</Link>
            </li>
            <li>
              <Link to="/manage-stores">Manage Stores</Link>
            </li>
            <li>
              <Link to="/logout">Log Out</Link>
            </li>
          </ul>
        </nav>
        <div className="dashboard-content">
          <Routes>
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/register-user" element={<Register />} />
            <Route path="/manage-events" element={<EventList />} />
            <Route path="/manage-stores" element={<ProductList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<LogOut />} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default StaffDashboard;

*/
