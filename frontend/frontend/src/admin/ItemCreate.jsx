import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../public/logo.webp";
import { FaStore, FaPlus, FaHome, FaChartBar, FaUsers, FaBox, FaCheckCircle } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { HiMenu, HiX } from "react-icons/hi";

function ItemCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const changePhotoHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImagePreview(reader.result);
      setImage(file);
    };
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("image", image);

    const admin = JSON.parse(localStorage.getItem("admin"));
    const token = admin?.token;

    if (!token) {
      navigate("/admin/login");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4002/api/v1/item/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      navigate("/admin/our-items");
    } catch (error) {
      console.log("error in createItem ", error);
      toast.error(error.response?.data?.errors || "Failed to create item");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get("http://localhost:4002/api/v1/admin/logout", {
        withCredentials: true,
      });
      toast.success(response.data.message);
      localStorage.removeItem("admin");
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
              <Link to="/admin/dashboard" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-white/10 hover:text-orange-400 transition-all duration-200 group">
                <FaChartBar className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/our-items" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-white/10 hover:text-orange-400 transition-all duration-200 group">
                <FaStore className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Our Items</span>
              </Link>
            </li>
            <li>
              <span className="text-nav flex items-center px-4 py-3 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <FaPlus className="mr-3 text-lg" /> 
                <span className="font-medium">Create Item</span>
              </span>
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
            <h2 className="text-4xl font-poppins font-bold text-orange-400 drop-shadow-md tracking-tight mb-2">Create New Item</h2>
            <p className="text-gray-400 font-inter">Add a new item to your marketplace</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              <FaPlus className="text-lg" />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleCreateItem} className="space-y-8">
              {/* Item Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-inter font-medium text-gray-300 mb-3">
                  Item Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter item title (e.g., MacBook Pro 13-inch)"
                  required
                />
              </div>

              {/* Item Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-inter font-medium text-gray-300 mb-3">
                  Item Description *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Describe your item in detail (condition, features, why you're selling, etc.)"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-inter font-medium text-gray-300 mb-3">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter price in rupees"
                  min="1"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label htmlFor="image" className="block text-sm font-inter font-medium text-gray-300 mb-3">
                  Item Image *
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={changePhotoHandler}
                    className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-500 file:text-white hover:file:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                  
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-300 mb-2">Image Preview:</p>
                      <div className="relative w-full max-w-md">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-xl border border-white/20"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Link
                  to="/admin/our-items"
                  className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-inter font-medium hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-inter font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25 hover:scale-105 flex items-center space-x-2"
                >
                  <FaPlus className="text-lg" />
                  <span>Create Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemCreate;
