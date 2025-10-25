import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../public/logo.webp";
import { FaStore, FaPlus, FaHome, FaChartBar, FaUsers, FaBox, FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { HiMenu, HiX } from "react-icons/hi";

function OurCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const adminData = JSON.parse(localStorage.getItem("admin"));
  const admin = adminData?.admin;
  const token = adminData?.token;

  useEffect(() => {
    if (!token) {
      toast.error("Please login to admin");
      navigate("/admin/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log("Fetching admin courses with token:", token); // Debug log
        const response = await axios.get("http://localhost:4002/api/v1/admin/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        console.log("Admin courses response:", response.data); // Debug log
        setCourses(response.data.courses);
        setLoading(false);
      } catch (error) {
        console.log("error in fetchCourses ", error);
        console.log("Error response:", error.response?.data); // Debug log
        toast.error("Failed to load courses");
        setLoading(false);
      }
    };
    
    if (token) {
      fetchCourses();
    }
  }, [token]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:4002/api/v1/course/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      setCourses(courses.filter((course) => course._id !== id));
    } catch (error) {
      console.log("Error in deleting course ", error);
      toast.error(error.response?.data?.errors || "Error in deleting course");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get("http://localhost:4002/api/v1/admin/logout", {
        withCredentials: true,
      });
      toast.success(response.data.message);
      localStorage.removeItem("admin");
      navigate("/admin/login");
    } catch (error) {
      console.log("Error in logging out ", error);
      toast.error(error.response?.data?.errors || "Error in logging out");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white items-center justify-center">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 shadow-2xl max-w-md mx-auto">
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaStore className="text-3xl text-orange-400" />
          </div>
          <h3 className="text-2xl font-poppins font-bold text-orange-400 mb-4">Loading Items</h3>
          <p className="text-gray-300 font-inter">Fetching your item data...</p>
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
            <p className="text-xs text-gray-400 font-inter">Admin Panel</p>
          </div>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/admin/dashboard" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-white/10 hover:text-orange-400 transition-all duration-200 group">
                <FaChartBar className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Dashboard</span>
              </Link>
            </li>
            <li>
              <span className="text-nav flex items-center px-4 py-3 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <FaStore className="mr-3 text-lg" /> 
                <span className="font-medium">Our Items</span>
              </span>
            </li>
            <li>
              <Link to="/admin/create-course" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-white/10 hover:text-orange-400 transition-all duration-200 group">
                <FaPlus className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Post Item</span>
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
            <h2 className="text-4xl font-poppins font-bold text-orange-400 drop-shadow-md tracking-tight mb-2">Our items</h2>
            <p className="text-gray-400 font-inter">Manage and organize your item catalog</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/dashboard"
              className="px-4 py-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 transition-all font-inter font-medium"
            >
              Go to Dashboard
            </Link>
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              <FaStore className="text-lg" />
            </div>
          </div>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {courses.map((course) => (
              <div key={course._id} className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img
                    className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={course?.image?.url || "https://via.placeholder.com/200"}
                    alt={course.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-inter font-medium">
                    Admin
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-product-title text-white mb-3 group-hover:text-orange-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-product-description text-gray-300 mb-4 line-clamp-2">
                    {course.description.length > 100
                      ? `${course.description.slice(0, 100)}...`
                      : course.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-product-price text-green-400">₹{course.price}</span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-inter font-medium">
                      10% off
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to={`/admin/update-course/${course._id}`}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-xl text-sm font-inter font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-center flex items-center justify-center gap-2"
                    >
                      <FaEdit className="text-xs" />
                      Update
                    </Link>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-xl text-sm font-inter font-medium transition-all duration-300 shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-2"
                    >
                      <FaTrash className="text-xs" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 shadow-2xl max-w-md mx-auto">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaStore className="text-3xl text-orange-400" />
              </div>
              <h3 className="text-2xl font-poppins font-bold text-orange-400 mb-4">No Items Yet</h3>
              <p className="text-gray-300 mb-8 font-inter leading-relaxed">You haven't created any items yet. Start by creating your first item to build your learning platform!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/admin/create-course"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-inter font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                >
                  Post your first Item
                </Link>
                <Link
                  to="/admin/dashboard"
                  className="border-2 border-white/30 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OurCourses;
