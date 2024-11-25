import react from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/Login"
import Register from "../pages/Register"
import NotFound from "../pages/NotFound"
import ProtectedRoute from "../components/ProtectedRoute"
import Profile from "../pages/Profile"
import ProductList from "../pages/ProductList"
import EventList from "../pages/EventList"
import IncentiveProgram from "../pages/IncentiveProgram"

function LogOut(){
  localStorage.clear()
  return <Navigate to="/login" replace={true} />
}

function RegisterUsers(){
  localStorage.clear()
  return <Register />
}

function StaffDashboard() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/register" element={<RegisterUsers />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<LogOut />} />
        <Route path="/*" element={<NotFound/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default StaffDashboard
