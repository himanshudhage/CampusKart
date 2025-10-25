import React, { useEffect, useState } from "react";
import logo from "../../public/logo.webp";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import toast from "react-hot-toast";

function Home() {
  const [items, setItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null); // ✅

  const fallbackItems = [
    { _id: "demo1", title: "HTML & CSS", image: { url: "/css.png" }, price: 299 },
    { _id: "demo2", title: "C++ Programming", image: { url: "/c++.jpg" }, price: 399 },
    { _id: "demo3", title: "C Programming", image: { url: "/c (1).jpg" }, price: 349 },
    { _id: "demo4", title: "Python", image: { url: "/python.png" }, price: 449 },
  ];

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      console.log("Parsed user data:", parsedUser); // Debug log
      setIsLoggedIn(true);
      setUserData(parsedUser.user); // ✅ Access the nested user object
    }
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get("http://localhost:4002/api/v1/item/items", {
          withCredentials: true,
        });
        setItems(res.data.items);
      } catch (error) {
        console.log("error in fetchItems", error);
        toast.error("Failed to load items");
      }
    };
    fetchItems();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axios.get("http://localhost:4002/api/v1/user/logout", {
        withCredentials: true,
      });
      toast.success(response.data.message);
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUserData(null);
    } catch (error) {
      toast.error(error.response?.data?.errors || "Error in logging out");
    }
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 2, dots: true } },
      { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Modern Header */}
        <header className="flex items-center justify-between py-6 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img src={logo} alt="Logo" className="w-12 h-12 rounded-full shadow-lg" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-2xl font-poppins font-bold text-orange-400">CampusKart</h1>
              <p className="text-xs text-gray-400 font-inter">Find What You Need, Sell What You Don’t</p>
            </div>
          </div>
          <div className="space-x-4 flex items-center">
            {isLoggedIn && userData && (
              <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                {/* User Initials Icon */}
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-orange-400/20">
                  {userData.firstName?.charAt(0)?.toUpperCase() || 'U'}{userData.lastName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {/* User Greeting */}
                <span className="text-white font-inter font-medium hidden sm:inline">
                  👋 Hi, {userData.firstName || 'User'} {userData.lastName || ''}
                </span>
              </div>
            )}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 rounded-full border border-red-400/30 bg-red-500/10 hover:bg-red-500/20 transition-all font-inter font-medium text-red-300 hover:text-red-200"
              >
                Logout
              </button>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to={"/login"}
                  className="px-4 py-2 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 transition-all font-inter font-medium text-sm"
                >
                  Login as Buyer
                </Link>
                <Link
                  to={"/admin/login"}
                  className="px-4 py-2 rounded-full border border-blue-400/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all font-inter font-medium text-sm"
                >
                  Login as Admin
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Modern Hero Section */}
        <section className="relative mt-16 mb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-slate-500/10 rounded-3xl"></div>
          <div className="relative text-center py-20 px-8">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6">
                <span className="text-orange-400 text-sm font-inter font-medium">🛍️ Best MarketPlace</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-poppins font-bold text-white mb-6 leading-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">CampusKart</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 font-inter leading-relaxed max-w-2xl mx-auto">
                "Old for one, gold for another, Only on CampusKart!" - Discover great deals and transform your campus life.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link
                  to={"/items"}
                  className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-inter font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-orange-500/25 hover:scale-105"
                >
                  <span className="relative z-10">Explore Items</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  to={"/signup"}
                  className="px-8 py-4 border-2 border-white/30 text-white rounded-full font-inter font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Join as Buyer
                </Link>
                <Link
                  to={"/admin/signup"}
                  className="px-8 py-4 border-2 border-blue-400/30 text-blue-300 rounded-full font-inter font-semibold hover:bg-blue-500/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Join as Admin
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="mb-24 overflow-hidden">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-poppins font-bold text-white mb-4">Featured Items</h2>
            <p className="text-gray-400 font-inter">Discover Recently Added Items</p>
          </div>
          <div className="overflow-hidden">
            <Slider {...settings}>
            {(items.length > 0 ? items : fallbackItems).map((item) => (
              <div key={item._id} className="p-4">
                <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <img
                      className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      src={item.image?.url || "https://via.placeholder.com/200"}
                      alt={item.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-inter font-medium">
                      Featured
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-product-title text-white mb-3 group-hover:text-orange-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-product-price text-green-400">₹{item.price}</span>
                      <div className="flex items-center text-yellow-400">
                        <span className="text-sm">⭐⭐⭐⭐⭐</span>
                      </div>
                    </div>
                    <Link
                      to={`/buy/${item._id}`}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-xl font-inter font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25 text-center block"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            </Slider>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 pt-12 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <img src={logo} alt="logo" className="w-10 h-10 rounded-full" />
                <h1 className="text-xl text-orange-400 font-bold">CampusKart</h1>
              </div>
              <p className="mt-4 text-sm text-gray-400">Follow us on:</p>
              <div className="mt-2 flex justify-center md:justify-start space-x-4">
                <a href="https://github.com/himanshudhage"><FaGithub className="text-2xl hover:text-blue-500" /></a>
                <a href="https://www.instagram.com/himanshu_dhage_01/"><FaInstagram className="text-2xl hover:text-pink-500" /></a>
                <a href="https://www.linkedin.com/in/himanshu-dhage-6543b425a/"><FaLinkedin className="text-2xl hover:text-sky-400" /></a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Connects</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer">Linkdin - Himanshu Dhage</li>
                <li className="hover:text-white cursor-pointer">Instagram - himanshu_dhage_01</li>
                <li className="hover:text-white cursor-pointer">GitHub - himanshudhage</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">© 2025</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer">Terms & Conditions</li>
                <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer">Refund & Cancellation</li>
                <li className="hover:text-white cursor-pointer">This site is developed and maintained by Himanshu Dhage</li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Home;
