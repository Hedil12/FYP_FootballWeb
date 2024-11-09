import React, { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import UserDashboard from "./routes/UserDashboard"
import StaffDashboard from "./routes/StaffDashboard"
import Register from "./pages/Register"
import api from "./api"

function LogOut(){
  localStorage.clear()
  return <Navigate to="/login" replace={true} />
}

function RegisterandLogOut(){
  localStorage.clear()
  return <Register />
}

function App() { 
  const [userRole, setUserRole] = useState(null); 

  useEffect(() => { 
      defineUserRole(); 
  }, []); 

  const defineUserRole = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await api.get('/api/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRole(response.data.user_role);
    } catch (error) {
      console.error(error);
      alert('Error fetching user profile');
    }
  };

  const renderDashboard = () => { 
      if (userRole === 'User') return <UserDashboard />; 
      if (userRole === 'Admin') return <StaffDashboard />; 
      return <Navigate to="/" replace={true} />; 
  }; 

  return ( 
      <BrowserRouter> 
          <Routes> 
              <Route path="/" element={<ProtectedRoute>{renderDashboard()}</ProtectedRoute>} /> 
              <Route path="/login" element={<Login />} /> 
              <Route path="/logout" element={<LogOut />} /> 
              <Route path="/register" element={<RegisterandLogOut />} />
              <Route path="*" element={<NotFound />} /> 
          </Routes> 
      </BrowserRouter> 
  ); 
}
/*
Testing Users:
'TestUser1', 'TestUser@Test.com', 'pw1234'
'TestAdmin', 'TestAdmin@Test.com', 'pw1234'
*/
export default App
