import React from "react";
import ReactDOM from "react-dom/client"; // Use ReactDOM from "react-dom/client" for React 18
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DivisionRepository from "./pages/DivisionRepository";
import AddCredential from "./pages/AddCredential";
import UpdateCredential from "./pages/UpdateCredential";

// Create a root element for React 18
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/division/:id/repository"
          element={<DivisionRepository />}
        />
        <Route path="/division/:id/add" element={<AddCredential />} />
        <Route path="/credential/:id/update" element={<UpdateCredential />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
