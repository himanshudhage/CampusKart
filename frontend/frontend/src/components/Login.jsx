import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import logo from "../../public/logo.webp";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors

    try {
      const response = await axios.post(
        "http://localhost:4002/api/v1/user/login",
        { email, password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message || "Login successful!");
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/");
    } catch (error) {
      const err = error?.response?.data;

      if (err?.message) {
        setErrorMessage(err.message);
      } else if (err?.errors) {
        setErrorMessage(
          typeof err.errors === "string"
            ? err.errors
            : Array.isArray(err.errors)
            ? err.errors.join(", ")
            : "Login failed!"
        );
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen">
      <div className="container mx-auto px-4">
        {/* Modern Header */}
        <header className="flex items-center justify-between py-6 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img src={logo} alt="Logo" className="w-12 h-12 rounded-full shadow-lg" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-2xl font-poppins font-bold text-orange-400">CampusKart</h1>
              <p className="text-xs text-gray-400 font-inter">Learning Hub</p>
            </div>
          </div>
          <div className="space-x-4 flex items-center">
            <div className="flex space-x-3">
              <Link
                to="/signup"
                className="px-6 py-2.5 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 transition-all font-inter font-medium"
              >
                Signup
              </Link>
              <Link
                to="/"
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all font-inter font-medium shadow-lg hover:shadow-orange-500/25"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </header>

        {/* Modern Hero Section */}
        <section className="relative mt-16 mb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-slate-500/10 rounded-3xl"></div>
          <div className="relative text-center py-20 px-8">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6">
                <span className="text-orange-400 text-sm font-inter font-medium">🔐 User Login Portal</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-poppins font-bold text-white mb-6 leading-tight">
                Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Back</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 font-inter leading-relaxed max-w-2xl mx-auto">
                Sign in to unlock deals, manage your listings, and make the most of your campus marketplace
              </p>
            </div>
          </div>
        </section>

        {/* User Login Form */}
        <div className="max-w-md mx-auto mb-24">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h2 className="text-2xl font-poppins font-bold text-white mb-2">
                User Login
              </h2>
              <p className="text-gray-400 font-inter">
                Enter your credentials to access your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-inter font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="user@campuskart.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-inter font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your password"
                    required
                  />
                  <span
                    className="absolute right-3 top-3 text-gray-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-center font-inter">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-inter font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02]"
              >
                Sign In to Account
              </button>
            </form>
          </div>
        </div>

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
              <h3 className="text-lg font-semibold mb-3">Learning Platform</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer">Course Catalog</li>
                <li className="hover:text-white cursor-pointer">Progress Tracking</li>
                <li className="hover:text-white cursor-pointer">Certificates</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">© 2025</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer">Terms & Conditions</li>
                <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer">This site is developed and maintained by Himanshu Dhage</li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Login;
