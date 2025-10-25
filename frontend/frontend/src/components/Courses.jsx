import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaStore, FaDownload, FaCheckCircle, FaSearch } from "react-icons/fa";
import { IoLogIn, IoLogOut } from "react-icons/io5";
import { RiHome2Fill } from "react-icons/ri";
import { HiMenu, HiX } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../public/logo.webp";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:4002/api/v1/course/courses", {
          withCredentials: true,
        });
        console.log("Fetched courses:", response.data.courses);
        console.log("First course structure:", response.data.courses[0]);
        console.log("First course createdAt:", response.data.courses[0]?.createdAt);
        console.log("First course updatedAt:", response.data.courses[0]?.updatedAt);
        console.log("All course dates:", response.data.courses.map(c => ({ 
          title: c.title, 
          createdAt: c.createdAt, 
          updatedAt: c.updatedAt 
        })));
        
        // Sort courses: available items first (newest first), then sold items (newest first)
        const sortedCourses = response.data.courses.sort((a, b) => {
          // First sort by purchase status (available items first)
          if (a.isPurchased !== b.isPurchased) {
            return a.isPurchased ? 1 : -1;
          }
          // Then sort by creation date (newest first) within each group
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setCourses(sortedCourses);
        setFilteredCourses(sortedCourses);
      } catch (error) {
        setErrorMessage("Failed to fetch Items data");
      }
    };
    fetchCourses();
  }, []);

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

  // Enhanced search functionality
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchSuggestions(value.length > 0);
  };

  const performSearch = (searchQuery) => {
    setIsSearching(true);
    
    // Simulate search delay for better UX
    setTimeout(() => {
      if (searchQuery.trim() === "") {
        setFilteredCourses(courses);
        console.log("Cleared search, showing all courses:", courses.length);
      } else {
        const term = searchQuery.toLowerCase().trim();
        console.log("Searching for:", term);
        console.log("Available courses:", courses);
        
        const filtered = courses.filter(course => {
          if (!course) return false;
          
          const title = course.title ? course.title.toLowerCase() : "";
          const description = course.description ? course.description.toLowerCase() : "";
          const price = course.price ? course.price.toString() : "";
          
          // Simple search: title, description, and price
          const matches = title.includes(term) || 
                         description.includes(term) || 
                         price.includes(term);
          
          console.log(`Course "${title}" matches "${term}":`, matches);
          return matches;
        });
        
        // Apply same sorting to search results: available first, then by date
        const sortedFiltered = filtered.sort((a, b) => {
          // First sort by purchase status (available items first)
          if (a.isPurchased !== b.isPurchased) {
            return a.isPurchased ? 1 : -1;
          }
          // Then sort by creation date (newest first) within each group
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        console.log("Filtered results:", sortedFiltered.length);
        setFilteredCourses(sortedFiltered);
        
        // Add to search history if not empty and not already in history
        if (term && !searchHistory.includes(term)) {
          const newHistory = [term, ...searchHistory.slice(0, 4)]; // Keep last 5 searches
          setSearchHistory(newHistory);
          localStorage.setItem('courseSearchHistory', JSON.stringify(newHistory));
        }
      }
      setIsSearching(false);
    }, 300);
  };

  const handleSearchClick = () => {
    performSearch(searchTerm);
    setShowSearchSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredCourses(courses);
    setShowSearchSuggestions(false);
  };

  const handleSearchFromHistory = (term) => {
    setSearchTerm(term);
    performSearch(term);
    setShowSearchSuggestions(false);
  };

  // Get search suggestions based on course titles
  const getSearchSuggestions = () => {
    if (searchTerm.length < 2) return [];
    
    const term = searchTerm.toLowerCase();
    const suggestions = courses
      .map(course => course.title)
      .filter(title => title.toLowerCase().includes(term))
      .slice(0, 5);
    
    return [...new Set(suggestions)]; // Remove duplicates
  };

  // Update filtered courses when courses change
  useEffect(() => {
    setFilteredCourses(courses);
  }, [courses]);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('courseSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

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
              <span className="text-nav flex items-center px-4 py-3 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <FaStore className="mr-3 text-lg" /> 
                <span className="font-medium">Available Items</span>
              </span>
            </li>
            <li>
              <Link to="/purchases" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-white/10 hover:text-orange-400 transition-all duration-200 group">
                <FaDownload className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Awaiting Pickup</span>
              </Link>
            </li>
            <li>
              <Link to="/received-items" className="text-nav flex items-center px-4 py-3 rounded-xl hover:bg-white/10 hover:text-orange-400 transition-all duration-200 group">
                <FaCheckCircle className="mr-3 text-lg group-hover:scale-110 transition-transform" /> 
                <span className="font-medium">Received Items</span>
              </Link>
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
            <h2 className="text-4xl font-poppins font-bold text-orange-400 drop-shadow-md tracking-tight mb-2">Available Items</h2>
            <p className="text-gray-400 font-inter">Discover amazing deals on quality pre-owned items</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Enhanced Search Bar with Suggestions */}
            <div className="relative flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Items, descriptions, or prices..."
                  value={searchTerm}
                  onChange={handleSearchInput}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchClick();
                    }
                  }}
                  onFocus={() => setShowSearchSuggestions(searchTerm.length > 0)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  className="w-80 pl-6 pr-16 py-4 bg-white rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:shadow-lg transition-all duration-300 shadow-md"
                />
                <button
                  onClick={searchTerm ? handleClearSearch : handleSearchClick}
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white hover:from-orange-500 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-orange-500/25 disabled:opacity-50"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : searchTerm ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <FaSearch className="h-5 w-5" />
                  )}
                </button>

                {/* Search Suggestions Dropdown */}
                {showSearchSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                    {/* Search History */}
                    {searchHistory.length > 0 && (
                      <div className="p-3 border-b border-gray-100">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Searches</div>
                        {searchHistory.slice(0, 3).map((term, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearchFromHistory(term)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors duration-200 flex items-center"
                          >
                            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {term}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Course Suggestions */}
                    {getSearchSuggestions().length > 0 && (
                      <div className="p-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Latest Listings</div>
                        {getSearchSuggestions().map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchTerm(suggestion);
                              performSearch(suggestion);
                              setShowSearchSuggestions(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors duration-200 flex items-center"
                          >
                            <FaSearch className="h-4 w-4 mr-2 text-gray-400" />
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No suggestions message */}
                    {searchHistory.length === 0 && getSearchSuggestions().length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Start typing to see suggestions
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              <FaStore className="text-lg" />
            </div>
          </div>
        </div>

        {errorMessage && <div className="text-red-500 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">{errorMessage}</div>}

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCourses.map((course, index) => (
              <div key={index} className={`group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 relative ${
                course.isPurchased ? 'opacity-75' : ''
              }`}>
                <div className="relative overflow-hidden">
                  <img
                    className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={course.image?.url || "https://via.placeholder.com/200"}
                    alt={course.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {course.isPurchased ? (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-inter font-medium flex items-center space-x-1">
                      <span>🔒</span>
                      <span>SOLD</span>
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-inter font-medium">
                      New
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-product-title text-white mb-4 group-hover:text-orange-400 transition-colors">
                    {course.title}
                  </h3>
                  
                  {/* Admin Info and Creation Date */}
                  <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {(course.creatorId?.firstName || course.admin?.firstName || course.createdBy?.firstName || course.adminName || 'A').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-orange-400 font-medium text-sm">
                            Posted by {course.creatorId?.firstName?.toLowerCase() || course.admin?.firstName?.toLowerCase() || course.createdBy?.firstName?.toLowerCase() || course.adminName?.toLowerCase() || 'admin'}
                          </div>
                          <div className="text-gray-400 text-xs">Product Owner</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-400 text-xs mb-1">Posted</div>
                        <div className="text-white font-semibold text-sm">
                          {course.createdAt ? new Date(course.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'N/A'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {course.createdAt ? new Date(course.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-product-price text-green-400">₹{course.price}</span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-inter font-medium">
                      10% off
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-yellow-400">
                      <span className="text-sm">⭐⭐⭐⭐⭐</span>
                      <span className="text-xs text-gray-400 ml-1">(4.8)</span>
                    </div>
                    {course.isPurchased ? (
                      <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl text-sm font-inter font-semibold cursor-not-allowed opacity-75 flex items-center justify-center space-x-2 min-w-[120px]">
                        <span>🔒</span>
                        <span>Sold Out</span>
                      </div>
                    ) : (
                      <Link
                        to={`/buy/${course._id}`}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl text-sm font-inter font-semibold transition-all duration-300 shadow-lg hover:shadow-orange-500/25 hover:scale-105 min-w-[120px] flex items-center justify-center"
                      >
                        Enroll Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 shadow-2xl max-w-md mx-auto">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                {searchTerm ? <FaSearch className="text-3xl text-orange-400" /> : <FaStore className="text-3xl text-orange-400" />}
              </div>
              <h3 className="text-2xl font-poppins font-bold text-orange-400 mb-4">
                {searchTerm ? "No Itmes Found" : "No Itmes Available"}
              </h3>
              <p className="text-gray-300 mb-8 font-inter leading-relaxed">
                {searchTerm 
                  ? `No courses match your search for "${searchTerm}". Try different keywords or browse all courses.`
                  : "We're working on adding amazing courses for you. Check back soon for new learning opportunities!"
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {searchTerm ? (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilteredCourses(courses);
                    }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-inter font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                  >
                    Clear Search
                  </button>
                ) : (
                  <Link
                    to="/"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-inter font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                  >
                    Go to Home
                  </Link>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="border-2 border-white/30 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Courses;
