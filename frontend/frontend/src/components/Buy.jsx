import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
// import { BACKEND_URL } from "../utils/utils";
function Buy() {
  const { itemId } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [item, setItem] = useState({});
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;  //using optional chaining to avoid crashing incase token is not there!!!
  
  console.log("User data from localStorage:", user);
  console.log("Token:", token);

  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState("");

  if (!token) {
    navigate("/login");
  }

  useEffect(() => {
    const fetchBuyItemData = async () => {
      if (!token) {
        console.log("No token found, redirecting to login");
        navigate("/login");
        return;
      }
      
      console.log("Fetching item data for itemId:", itemId);
      console.log("Using token:", token);
      
      setLoading(true);
      try {
        const response = await axios.post(
          `http://localhost:4002/api/v1/item/buy/${itemId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true, // Include cookies if needed
          }
        );
        console.log("Item data fetched successfully:", response.data);
        setItem(response.data.item);
        setClientSecret(response.data.clientSecret);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching item data:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        setLoading(false);
        if (error?.response?.status === 400) {
          setError("You have already purchased this item");
          setTimeout(() => navigate("/purchases"), 2000);
        } else if (error?.response?.status === 404) {
          setError("Item not found");
        } else if (error?.response?.status === 401) {
          setError("Authentication failed. Please login again.");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setError(error?.response?.data?.errors || "Failed to load item data");
        }
      }
    };
    fetchBuyItemData();
  }, [itemId, token, navigate]);

  const handlePurchase = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.log("Stripe or Element not found");
      return;
    }

    // Validate required fields
    if (!phone.trim() || !address.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setCardError(""); // Clear previous errors
    const card = elements.getElement(CardElement);

    if (card == null) {
      console.log("Cardelement not found");
      setLoading(false);
      return;
    }

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      console.log("Stripe PaymentMethod Error: ", error);
      setLoading(false);
      setCardError(error.message);
      return;
    } else {
      console.log("[PaymentMethod Created]", paymentMethod);
    }
    if (!clientSecret) {
      console.log("No client secret found");
      setLoading(false);
      return;
    }
    const { paymentIntent, error: confirmError } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: user?.user?.firstName,
            email: user?.user?.email,
          },
        },
      });
    if (confirmError) {
      setCardError(confirmError.message);
      setLoading(false);
      return;
    } else if (paymentIntent.status === "succeeded") {
      console.log("Payment succeeded: ", paymentIntent);
      setCardError(`Payment successful! Payment ID: ${paymentIntent.id}`);
      const paymentInfo = {
        email: user?.user?.email,
        userId: user?.user?._id,
        itemId: itemId,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
        phone: phone,
        address: address,
      };
      console.log("Payment info: ", paymentInfo);
      try {
        console.log("Creating order with payment info:", paymentInfo);
        const orderResponse = await axios.post(
          "http://localhost:4002/api/v1/order", 
          paymentInfo, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        console.log("Order created successfully:", orderResponse.data);
        toast.success("Payment Successful! Order created.");
        navigate("/purchases");
      } catch (orderError) {  
        console.error("Error creating order:", orderError);
        console.error("Order error response:", orderError.response?.data);
        console.error("Order error status:", orderError.response?.status);
        toast.error("Payment succeeded but failed to create order. Please contact support.");
        // Still navigate to purchases since payment was successful
        navigate("/purchases");
      }
    }
    setLoading(false);
  };
  // Show loading state while fetching item data
  if (loading && !item.title) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-xl font-inter">Loading item details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error ? (
        <div className="flex justify-center items-center h-screen">
          <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg">
            <p className="text-lg font-semibold">{error}</p>
            <Link
              className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition duration-200 mt-3 flex items-center justify-center"
              to={"/purchases"}
            >
              Purchases
            </Link>
          </div>
        </div>
      ) : (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                  <div className="container mx-auto px-4 py-8">
                    {/* Modern Header */}
                    <div className="text-center mb-12">
                      <div className="inline-flex items-center bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6">
                        <span className="text-orange-400 text-sm font-inter font-medium">🔒 Secure Checkout</span>
                      </div>
                      <h1 className="text-5xl font-poppins font-bold text-white mb-4">
                        Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Purchase</span>
                      </h1>
                      <p className="text-gray-300 text-lg font-inter">Secure payment for your Item enrollment</p>
                    </div>

            <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
              {/* Order Details Section */}
              <div className="w-full lg:w-1/2">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <h2 className="text-3xl font-poppins font-bold text-orange-400 mb-8">Order Details</h2>

                  {/* Course Image and Info */}
                  <div className="flex flex-col sm:flex-row gap-6 mb-8">
                    <div 
                      className="w-full sm:w-56 h-40 sm:h-48 relative overflow-hidden rounded-xl cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => setIsImageModalOpen(true)}
                    >
                      <img
                        src={item.image?.url || "https://via.placeholder.com/200"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/30">
                        <div className="text-white text-center">
                          <div className="text-2xl mb-2">🔍</div>
                          <div className="text-sm font-medium">Click to zoom</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-poppins font-bold text-white mb-3">{item.title}</h3>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3 font-inter leading-relaxed">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-poppins font-bold text-orange-400">₹{item.price}</span>
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-inter font-medium">Digital Payment</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-poppins font-semibold text-white mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-inter">Item Price:</span>
                        <span className="text-white font-inter font-medium">₹{item.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-inter">Processing Fee:</span>
                        <span className="text-white font-inter font-medium">₹0.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-inter">Tax:</span>
                        <span className="text-white font-inter font-medium">₹0.00</span>
                      </div>
                      <div className="border-t border-white/20 pt-3">
                        <div className="flex justify-between items-center text-xl font-poppins font-bold">
                          <span className="text-orange-400">Total:</span>
                          <span className="text-orange-400">₹{item.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Payment Form Section */}
              <div className="w-full lg:w-1/2">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <h2 className="text-3xl font-poppins font-bold text-orange-400 mb-8">
                    Payment Information
                  </h2>
              <form onSubmit={handlePurchase}>
                {/* Phone Number Input */}
                <div className="mb-6">
                  <label
                    className="block text-white text-sm mb-3 font-inter font-medium"
                    htmlFor="phone"
                  >
                    📱 Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white placeholder-gray-400 font-inter transition-all duration-200"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                {/* Address Input */}
                <div className="mb-6">
                  <label
                    className="block text-white text-sm mb-3 font-inter font-medium"
                    htmlFor="address"
                  >
                    🏠 Delivery Address
                  </label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white placeholder-gray-400 font-inter transition-all duration-200 resize-none"
                    placeholder="Enter your complete address"
                    rows="3"
                    required
                  />
                </div>

                {/* Card Element */}
                <div className="mb-8">
                  <label
                    className="block text-white text-sm mb-3 font-inter font-medium"
                    htmlFor="card-number"
                  >
                    💳 Credit/Debit Card
                  </label>
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4 focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-transparent transition-all duration-200">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#ffffff",
                            fontFamily: "Inter, system-ui, sans-serif",
                            "::placeholder": {
                              color: "#9ca3af",
                            },
                          },
                          invalid: {
                            color: "#ef4444",
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                          <button
                            type="submit"
                            disabled={!stripe || loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-inter font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/25 text-lg"
                          >
                            {loading ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Processing Payment...
                              </div>
                            ) : (
                              `Pay ₹${item.price}`
                            )}
                          </button>
                  
                  {cardError && (
                    <p className="text-red-400 font-semibold text-sm mt-3 text-center">
                      {cardError}
                    </p>
                  )}
                </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          <div className="relative max-w-7xl max-h-[95vh] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={item.image?.url || "https://via.placeholder.com/200"}
              alt={item.title}
              className="w-full h-full object-contain max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 backdrop-blur-sm">
              <h3 className="text-white text-xl font-poppins font-bold mb-2">{item.title}</h3>
              <p className="text-gray-300 text-sm font-inter">{item.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Buy;