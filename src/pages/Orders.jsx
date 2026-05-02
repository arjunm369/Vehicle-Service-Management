import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Package, Calendar, Truck, Store, CreditCard, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';

const Orders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const fetchOrders = async () => {
    if (!currentUser) return;

    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(ordersQuery);
      const ordersData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(ordersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const OrderCard = ({ order }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const paymentStatusColors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Order #{order.id.slice(-8).toUpperCase()}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              {order.deliveryType === 'online' ? (
                <>
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span className="text-indigo-600 font-medium">Home Delivery</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">Store Pickup</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
            {order.status === 'pending' ? 'Pending Approval' : order.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
            <CreditCard className="w-3 h-3" />
            <span>{order.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}</span>
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Items:</h4>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.name} x {item.quantity}
              </span>
              <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>Payment ID: {order.paymentId}</p>
            <p className="mt-1">Shipping: {order.shippingAddress.city}, {order.shippingAddress.state}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-indigo-600">₹{order.total}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;


