import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { Toaster } from "react-hot-toast";
import Items from "./components/Items";
import Buy from "./components/Buy";
import Purchases from "./components/Purchases";
import AdminSignup from "./admin/AdminSignup";
import AdminLogin from "./admin/AdminLogin";
import Dashboard from "./admin/Dashboard";
import ItemCreate from "./admin/ItemCreate";
import ReceivedItems from "./components/RecivedItems";
import UpdateItem from "./admin/UpdateItem";
import OurItems from "./admin/OurItems";
import AdminOrders from "./admin/AdminOrders";

import { Navigate} from "react-router-dom";

const App = () => {
  // Simple function to check if admin is logged in
  const isAdminLoggedIn = () => {
    try {
      const adminData = localStorage.getItem("admin");
      if (!adminData) return false;
      const parsed = JSON.parse(adminData);
      return parsed && parsed.admin && parsed.token;
    } catch {
      return false;
    }
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const admin = isAdminLoggedIn();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/items" element={<Items />} />
        <Route path="/buy/:itemId" element={<Buy />} />
        <Route
          path="/purchases"
          element={user ? <Purchases /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/received-items"
          element={user ? <ReceivedItems /> : <Navigate to={"/login"} />}
        />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard"
          element={admin ? <Dashboard /> : <Navigate to={"/admin/login"} />}
        />
        <Route path="/admin/our-items" element={<OurItems />} />
        <Route path="/admin/create-item" element={<ItemCreate />} />
        <Route path="/admin/update-item/:id" element={<UpdateItem />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
