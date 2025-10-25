import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../public/logo.webp";
import toast from "react-hot-toast";
import axios from "axios";
import { FaStore, FaPlus, FaHome, FaChartBar, FaUsers, FaBox, FaCheckCircle } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { HiMenu, HiX } from "react-icons/hi";

function Dashboard() {
  const [purchaseData, setPurchaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const adminDataString = localStorage.getItem("admin");
  const adminData = adminDataString ? JSON.parse(adminDataString) : null;
  const admin = adminData?.admin;
  const token = adminData?.token;

  useEffect(() => {
    console.log("Dashboard useEffect triggered");
    console.log("Admin data:", adminData);
    console.log("Admin:", admin);
    console.log("Token:", token);
    
    if (!adminData || !admin || !token) {
      console.log("No admin data found, redirecting to login");
      navigate("/admin/login");
      return;
    }
    
    const fetchPurchaseData = async () => {
      try {
        console.log("Fetching purchase data...");
        
        const response = await axios.get("http://localhost:4002/api/v1/admin/purchases", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        
        console.log("Purchase data received successfully");
        console.log("Response data:", response.data);
        console.log("Purchases array:", response.data.purchases);
        
        
        if (response.data) {

          const data = {
            message: response.data.message || "Purchase data retrieved successfully",
            totalPurchases: response.data.totalPurchases || 0,
            totalRevenue: response.data.totalRevenue || 0,
            purchases: response.data.purchases || []
          };
          console.log("Setting purchase data:", data);
          setPurchaseData(data);
        } else {
         
          const emptyData = {
            message: "No purchases found",
            totalPurchases: 0,
            totalRevenue: 0,
            purchases: []
          };
          console.log("Setting empty purchase data:", emptyData);
          setPurchaseData(emptyData);
        }
        setLoading(false);
      } catch (error) {
        console.log("Error fetching purchase data:", error);
        console.log("Error response:", error.response?.data); 
        console.log("Error status:", error.response?.status); 
        console.log("Error headers:", error.response?.headers); 
        console.log("Error code:", error.code); 
        console.log("Error message:", error.message); 
        
        
        setPurchaseData({
          message: "No purchases found",
          totalPurchases: 0,
          totalRevenue: 0,
          purchases: []
        });
        setLoading(false);
        

        if (error.response?.status >= 500) {
          toast.error("Server error. Please try again later.");
        } else if (error.response?.status === 401) {
          toast.error("Authentication failed. Please login again.");
          localStorage.removeItem("admin");
          navigate("/admin/login");
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          toast.error("Network error. Please check your connection.");
        } else {
          
          console.log("API call failed with status:", error.response?.status);
          console.log("Error details:", error.response?.data);
        }
      }
    };

    fetchPurchaseData();
  }, [navigate, token, admin?._id]);

  const handleDeliveredUpdate = async (orderId, delivered) => {
    try {
      console.log("Updating delivered status:", { orderId, delivered }); 
      const response = await axios.put(
        `http://localhost:4002/api/v1/admin/orders/${orderId}/delivered`,
        { delivered },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("Delivered status updated:", response.data); 

      // Show success message
      toast.success(delivered ? 'Course marked as delivered!' : 'Course marked as not delivered!');

      // Refresh the purchase data to show updated status
      const updatedResponse = await axios.get("http://localhost:4002/api/v1/admin/purchases", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setPurchaseData(updatedResponse.data);

    } catch (error) {
      console.log("Error updating delivered status:", error);
      toast.error(error.response?.data?.errors || "Failed to update delivered status");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get("http://localhost:4002/api/v1/admin/logout", {
        withCredentials: true,
      });
      toast.success(response.data.message);
      localStorage.removeItem("admin");
      // Navigate to home page after logout
      navigate("/");
    } catch (error) {
      console.log("Error in logging out ", error);
      toast.error(error.response?.data?.errors || "Error in logging out");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
            <p className="text-xs text-gray-400 font-inter">Admin Panel</p>
          </div>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <span className="text-nav flex items-center px-4 py-3 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <FaChartBar className="mr-3 text-lg" /> 
                <span className="font-medium">Dashboard</span>
              </span>
            </li>
            <li>
              <Link to="/admin/our-items" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-white/10 hover:text-orange-400 transition-all duration-200 group">
                <FaStore className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Our Items</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/create-item" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-white/10 hover:text-orange-400 transition-all duration-200 group">
                <FaPlus className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Create Item</span>
              </Link>
            </li>
            <li>
              <Link to="/" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-white/10 hover:text-orange-400 transition-all duration-200 group">
                <FaHome className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Home</span>
              </Link>
            </li>
            <li className="pt-4 border-t border-white/10">
              <button onClick={handleLogout} className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 group w-full">
                <IoLogOut className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Logout</span>
              </button>
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
            <h2 className="text-4xl font-poppins font-bold text-orange-400 drop-shadow-md tracking-tight mb-2">Admin Dashboard</h2>
            <p className="text-gray-400 font-inter">Manage your items and track sales performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              <FaChartBar className="text-lg" />
            </div>
          </div>
        </div>
          
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 shadow-2xl max-w-md mx-auto">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaChartBar className="text-3xl text-orange-400" />
              </div>
              <h3 className="text-2xl font-poppins font-bold text-orange-400 mb-4">Loading Dashboard</h3>
              <p className="text-gray-300 font-inter">Fetching your sales data...</p>
            </div>
          </div>
        ) : purchaseData ? (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <FaUsers className="text-white text-lg" />
                  </div>
                  <span className="text-2xl font-bold text-orange-400">{purchaseData.totalPurchases}</span>
                </div>
                <h3 className="text-lg font-poppins font-semibold text-white mb-1">Total Purchases</h3>
                <p className="text-sm text-gray-400 font-inter">All time sales</p>
              </div>
              
              <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <FaChartBar className="text-white text-lg" />
                  </div>
                  <span className="text-2xl font-bold text-green-400">₹{(purchaseData.totalRevenue / 100).toFixed(2)}</span>
                </div>
                <h3 className="text-lg font-poppins font-semibold text-white mb-1">Total Revenue</h3>
                <p className="text-sm text-gray-400 font-inter">Earnings generated</p>
              </div>
              
              <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-white text-lg" />
                  </div>
                  <span className="text-2xl font-bold text-blue-400">
                    {purchaseData.purchases.filter(p => p.order?.status === 'succeeded').length}
                  </span>
                </div>
                <h3 className="text-lg font-poppins font-semibold text-white mb-1">Successful Payments</h3>
                <p className="text-sm text-gray-400 font-inter">Completed transactions</p>
              </div>
              
              <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <FaBox className="text-white text-lg" />
                  </div>
                  <span className="text-2xl font-bold text-purple-400">
                    {purchaseData.purchases.filter(p => p.order?.delivered === true).length}
                  </span>
                </div>
                <h3 className="text-lg font-poppins font-semibold text-white mb-1">Delivered</h3>
                <p className="text-sm text-gray-400 font-inter">Items shipped</p>
              </div>
            </div>

            {/* Purchase List */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-poppins font-bold text-orange-400 mb-6">Recent Purchases</h3>
              {purchaseData.purchases.length > 0 ? (
                <div className="space-y-4">
                  {console.log("Rendering purchases:", purchaseData.purchases)}
                  {purchaseData.purchases.map((purchase, index) => {
                    console.log(`Purchase ${index}:`, purchase);
                    return (
                    <div key={purchase.purchaseId} className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                              <FaStore className="text-white text-xl" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xl font-poppins font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                                {purchase.item.title}
                              </h4>
                              <div className="space-y-1 text-sm text-gray-300">
                                <p><span className="text-gray-400">Customer:</span> {purchase.user.name}</p>
                                <p><span className="text-gray-400">Email:</span> {purchase.user.email}</p>
                                {purchase.order && (
                                  <>
                                    <p><span className="text-gray-400">Phone:</span> {purchase.order.phone || 'Not provided'}</p>
                                    <p><span className="text-gray-400">Address:</span> {purchase.order.address || 'Not provided'}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {purchase.order && (
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-400 text-sm">Payment:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  purchase.order.status === 'succeeded'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                  {purchase.order.status}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-400 text-sm">Delivery:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  purchase.order.delivered
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                }`}>
                                  {purchase.order.delivered ? 'Delivered' : 'Pending'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-400 text-sm">Payment ID:</span>
                                <span className="text-green-400 text-xs font-mono">{purchase.order.paymentId}</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex space-x-2">
                              {purchase.order && !purchase.order.delivered ? (
                                <button
                                  onClick={() => handleDeliveredUpdate(purchase.order.id, true)}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm rounded-xl font-inter font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                                >
                                  Mark as Delivered
                                </button>
                              ) : purchase.order ? (
                                <button
                                  onClick={() => handleDeliveredUpdate(purchase.order.id, false)}
                                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-sm rounded-xl font-inter font-medium transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
                                >
                                  Mark as Pending
                                </button>
                              ) : null}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-orange-400">₹{purchase.item.price}</p>
                              {purchase.order && (
                                <p className="text-sm text-gray-400">Amount: ₹{(purchase.order.amount / 100).toFixed(2)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 shadow-2xl max-w-md mx-auto">
                    <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaStore className="text-3xl text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-poppins font-bold text-orange-400 mb-4">No Purchases Yet</h3>
                    <p className="text-gray-300 mb-8 font-inter leading-relaxed">When students buy your items, they'll appear here with all the details.</p>
                    <Link
                      to="/admin/create-item"
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-inter font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                    >
                      Create Your First Item
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 shadow-2xl max-w-md mx-auto">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaStore className="text-3xl text-red-400" />
              </div>
              <h3 className="text-2xl font-poppins font-bold text-red-400 mb-4">Dashboard Error</h3>
              <p className="text-gray-300 mb-8 font-inter leading-relaxed">
                There was an issue loading the dashboard. Please check:
                <br />• Backend server is running on port 4002
                <br />• You are logged in as admin
                <br />• Check browser console for errors
              </p>
              <button
                onClick={() => {
                  setLoading(true);
                  fetchPurchaseData();
                }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-inter font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
              >
                Retry Loading Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
