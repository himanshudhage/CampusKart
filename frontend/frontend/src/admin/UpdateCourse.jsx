import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, Link } from "react-router-dom";
import logo from "../../public/logo.webp";
import { FaStore, FaPlus, FaHome, FaChartBar, FaUsers, FaBox, FaCheckCircle, FaEdit } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { HiMenu, HiX } from "react-icons/hi";

function UpdateCourse() {
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const { data } = await axios.get(`http://localhost:4002/api/v1/course/${id}`, {
          withCredentials: true,
        });
        console.log(data);
        setTitle(data.course.title);
        setDescription(data.course.description);
        setPrice(data.course.price);
        setImage(data.course.image.url);
        setImagePreview(data.course.image.url);
        setLoading(false);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch course data");
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  const changePhotoHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImagePreview(reader.result);
      setImage(file);
    };
  };
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    if (image) {
      formData.append("imageUrl", image);
    }
    const admin = JSON.parse(localStorage.getItem("admin"));
    const token = admin.token;
    if (!token) {
      toast.error("Please login to admin");
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:4002/api/v1/course/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      toast.success(response.data.message || "Course updated successfully");
      navigate("/admin/our-courses"); // Redirect to courses page after update
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.errors);
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
            <FaEdit className="text-3xl text-orange-400" />
          </div>
          <h3 className="text-2xl font-poppins font-bold text-orange-400 mb-4">Loading Course</h3>
          <p className="text-gray-300 font-inter">Fetching course data...</p>
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
              <Link to="/admin/our-courses" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-white/10 hover:text-orange-400 transition-all duration-200 group">
                <FaStore className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Our Courses</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/create-course" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-white/10 hover:text-orange-400 transition-all duration-200 group">
                <FaPlus className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Create Course</span>
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
            <h2 className="text-4xl font-poppins font-bold text-orange-400 drop-shadow-md tracking-tight mb-2">Update Course</h2>
            <p className="text-gray-400 font-inter">Edit and modify your course details</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/our-courses"
              className="px-4 py-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 transition-all font-inter font-medium"
            >
              Back to Courses
            </Link>
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              <FaEdit className="text-lg" />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEdit className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-poppins font-bold text-white mb-2">Edit Course Details</h3>
              <p className="text-gray-400 font-inter">Update the information for your course</p>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-inter font-medium text-gray-300 mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  placeholder="Enter your course title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-inter font-medium text-gray-300 mb-2">
                  Course Description
                </label>
                <textarea
                  placeholder="Enter your course description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-none"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-inter font-medium text-gray-300 mb-2">
                  Course Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter your course price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-inter font-medium text-gray-300 mb-2">
                  Course Image
                </label>
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    <img
                      src={imagePreview ? `${imagePreview}` : "/imgPL.webp"}
                      alt="Course Preview"
                      className="h-48 w-80 object-cover rounded-xl border border-white/20 group-hover:scale-105 transition-transform duration-300"
                    />
                    {!imagePreview && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                        <span className="text-white text-sm">No image selected</span>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  onChange={changePhotoHandler}
                  accept="image/*"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-500 file:text-white hover:file:bg-orange-600 transition-all duration-300"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-inter font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02]"
              >
                Update Course
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateCourse;