import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaStore, FaDownload, FaCheckCircle } from "react-icons/fa";
import { IoLogIn, IoLogOut } from "react-icons/io5";
import { RiHome2Fill } from "react-icons/ri";
import { HiMenu, HiX } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../public/logo.webp";

function ReceivedItems() {
  const [receivedItems, setReceivedItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  useEffect(() => {
    // Add a small delay to ensure localStorage is fully loaded
    const checkAuth = () => {
      if (token && token.trim() !== '') {
        setIsLoggedIn(true);
        setIsLoading(false);
      } else {
        setIsLoggedIn(false);
        setIsLoading(false);
        navigate("/login");
      }
    };
    
    // Small delay to prevent race conditions
    const timeoutId = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeoutId);
  }, [token, navigate]);

  useEffect(() => {
    const fetchReceivedItems = async () => {
      try {
        const response = await axios.get("http://localhost:4002/api/v1/user/received-items", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setReceivedItems(response.data.receivedItemsData);
      } catch (error) {
        setErrorMessage("Failed to fetch received items data");
      }
    };
    fetchReceivedItems();
  }, [token]);

  const handleLogout = async () => {
    try {
      const response = await axios.get("http://localhost:4002/api/v1/user/logout", {
        withCredentials: true,
      });
      toast.success(response.data.message);
      localStorage.removeItem("user");
      navigate("/login");
      setIsLoggedIn(false);
    } catch (error) {
      toast.error(error.response?.data?.errors || "Error in logging out");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-xl font-inter">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Modern Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-white/10 p-6 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-72 z-50`}
      >
        <div className="flex items-center space-x-3 mb-10">
          <div className="relative">
            <img src={logo} alt="logo" className="w-12 h-12 rounded-full shadow-lg" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-xl font-poppins font-bold text-orange-400">CampusKart</h1>
            <p className="text-xs text-gray-400 font-inter">The Best MarketPlace</p>
          </div>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-white/10 hover:text-orange-400 transition-all duration-200 group">
                <RiHome2Fill className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Home</span>
              </Link>
            </li>
            <li>
              <Link to="/items" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-white/10 hover:text-orange-400 transition-all duration-200 group">
                <FaStore className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Available Items</span>
              </Link>
            </li>
            <li>
              <Link to="/purchases" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-white/10 hover:text-orange-400 transition-all duration-200 group">
                <FaDownload className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Awaiting Pickup</span>
              </Link>
            </li>
            <li>
              <span className="text-nav flex items-center px-4 py-3 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <FaCheckCircle className="mr-3 text-lg" /> 
                <span className="font-medium">Received Items</span>
              </span>
            </li>
            <li className="pt-4 border-t border-white/10">
              {isLoggedIn ? (
                <button onClick={handleLogout} className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 group w-full">
                  <IoLogOut className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                  <span className="font-medium">Logout</span>
                </button>
              ) : (
                <Link to="/login" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-green-500/20 hover:text-green-400 transition-all duration-200 group">
                  <IoLogIn className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                  <span className="font-medium">Login</span>
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {/* Toggle Button (Mobile) */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-orange-500 text-white p-2 rounded-lg"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
      </button>

      {/* Main Content */}
      <div className={`flex-1 p-8 overflow-auto transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-0"} md:ml-72`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-poppins font-bold text-orange-400 drop-shadow-md tracking-tight mb-2">Received Items</h2>
            <p className="text-gray-400 font-inter">Items are delivered to you</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              <FaCheckCircle className="text-lg" />
            </div>
          </div>
        </div>

        {errorMessage && <div className="text-red-500 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">{errorMessage}</div>}

        {receivedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {receivedItems.map((item, index) => (
              <div key={index} className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img
                    className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={item.image?.url || "https://via.placeholder.com/200"}
                    alt={item.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-inter font-medium">
                    ✓ Delivered
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-product-title text-white mb-3 group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-product-description text-gray-300 mb-4 line-clamp-2">
                    {item.description.length > 100
                      ? `${item.description.slice(0, 100)}...`
                      : item.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-product-price text-green-400">₹{item.price}</span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-inter font-medium">
                      Completed
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-400">
                      <span className="text-sm">📅</span>
                      <span className="text-xs text-gray-400 ml-1">
                        {item.order?.updatedAt ? new Date(item.order.updatedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center text-yellow-400">
                      <span className="text-sm">⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 shadow-2xl max-w-md mx-auto">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-3xl text-green-400" />
              </div>
              <h3 className="text-2xl font-poppins font-bold text-orange-400 mb-4">No Received Items Yet</h3>
              <p className="text-gray-300 mb-8 font-inter leading-relaxed">Your delivered items will appear here once they are marked as delivered by the admin. Check your awaiting pickup items.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/purchases"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-inter font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                >
                  View Awaiting Pickup
                </Link>
                <Link
                  to="/items"
                  className="border-2 border-white/30 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Browse More Items
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReceivedItems;

