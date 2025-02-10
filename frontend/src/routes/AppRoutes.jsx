import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SchedulePage from "../pages/SchedulePage";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/schedule" element={<SchedulePage />} />
    </Routes>
  </Router>
);

export default AppRoutes;
