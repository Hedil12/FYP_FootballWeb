import { Routes, Route, Link, Navigate } from "react-router-dom";
import Profile from "../pages/user/Profile";
import MembershipProgram from "../pages/admin/MembershipProgram";
import EventListView from "../pages/user/EventListView";
import ProductListView from "../pages/user/ProductListView";
import "../styles/UserDashboard.css";
import { UserInfo } from "../constants";


function LogOut() {
  localStorage.clear();
  return <Navigate to="/login" replace={true} />;
}

function DashboardUser() {
  const profile = localStorage.getItem(UserInfo);

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Dashboard</h2>
        <div className="profile-info">
          <h3>Welcome back, {profile.username || "User"}!</h3>
        </div>
        <ul>
          <li>
            <Link to="home">Home</Link>
          </li>
          <li>
            <Link to="profile">Profile</Link>
          </li>
          <li>
            <Link to="membership">Incentive Program</Link>
          </li>
          <li>
            <Link to="store">Store</Link>
          </li>
          <li>
            <Link to="events">Events</Link>
          </li>
          <li>
            <Link to="logout">Log Out</Link>
          </li>
        </ul>
      </div>

      <div className="content">
        <Routes>
          <Route
            path="home"
            element={
              <div className="home">
                <h2>Welcome to your Dashboard</h2>
                <p>Here is your home page content!</p>
              </div>
            }
          />
          <Route path="profile" element={<Profile />} />
          <Route path="membership" element={<MembershipProgram />} />
          <Route path="events" element={<EventListView />} />
          <Route path="store" element={<ProductListView/>}/>
          <Route path="logout" element={<LogOut />} />
        </Routes>
      </div>
    </div>
  );
}

export default DashboardUser;
