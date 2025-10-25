import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("admin"); // token save केले असेल
        const res = await axios.get("http://localhost:4002/api/v1/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.orders);
      } catch (err) {
        console.log(err);
        toast.error("Error fetching orders");
      }
    }; 
    fetchOrders();
  }, []);

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-white border border-gray-500">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Item</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Purchased At</th>
          </tr>
        </thead>
        <tbody className="bg-gray-900">
          {orders.map((order) => (
            <tr key={order._id} className="text-center border-b border-gray-700 hover:bg-gray-800 transition-all">
              <td className="px-4 py-2">{order.userId.firstName} {order.userId.lastName}</td>
              <td className="px-4 py-2">{order.userId.email}</td>
              <td className="px-4 py-2">{order.itemId.title}</td>
              <td className="px-4 py-2">{order.itemId.price}</td>
              <td className="px-4 py-2">{new Date(order.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;
