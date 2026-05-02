import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import RAZORPAY_KEY_ID from '../config/razorpay';
import { collection, addDoc, doc, getDoc, runTransaction } from 'firebase/firestore';
import { CreditCard, MapPin, User, Phone, Mail, Truck, Store } from 'lucide-react';
import Navbar from '../components/Navbar';

const Checkout = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deliveryType, setDeliveryType] = useState('online'); // 'online' or 'offline'
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0) {
        navigate('/store');
      }
      setCart(parsedCart);
    } else {
      navigate('/store');
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getFinalAmount = () => {
    return Math.round(getTotalAmount() * 1.18); // Including 18% tax
  };

  const validateStock = async () => {
    // Check if all items have sufficient stock
    for (const item of cart) {
      const partDoc = await getDoc(doc(db, 'spareParts', item.id));
      if (!partDoc.exists()) {
        throw new Error(`Item ${item.name} not found`);
      }
      const currentStock = partDoc.data().stock;
      if (currentStock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}. Available: ${currentStock}`);
      }
    }
  };

  const updateStock = async () => {
    // Update stock for all items using transaction
    await runTransaction(db, async (transaction) => {
      for (const item of cart) {
        const partRef = doc(db, 'spareParts', item.id);
        const partDoc = await transaction.get(partRef);
        
        if (!partDoc.exists()) {
          throw new Error(`Item ${item.name} not found`);
        }
        
        const currentStock = partDoc.data().stock;
        const newStock = currentStock - item.quantity;
        
        if (newStock < 0) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }
        
        transaction.update(partRef, { stock: newStock });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate stock before proceeding
      await validateStock();

      if (deliveryType === 'online') {
        // Online order with Razorpay payment
        const options = {
          key: RAZORPAY_KEY_ID, // Razorpay Key from config
          amount: getFinalAmount() * 100, // Amount in paise
          currency: "INR",
          name: "VehicleCare",
          description: "Spare Parts Purchase",
          image: "/vite.svg",
          handler: async function (response) {
            // Payment successful, save order
            await saveOrder(response.razorpay_payment_id, 'online');
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          notes: {
            address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`
          },
          theme: {
            color: "#4F46E5"
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
              alert('Payment cancelled');
            }
          }
        };
        
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        // Offline/Store pickup - no payment, pending admin approval
        await saveOrder('OFFLINE_ORDER_' + Date.now(), 'offline');
      }
      
    } catch (error) {
      console.error('Error processing order:', error);
      alert(error.message || 'Order processing failed. Please try again.');
      setLoading(false);
    }
  };

  const saveOrder = async (paymentId, orderType) => {
    try {
      // Update stock first
      await updateStock();

      const orderData = {
        userId: currentUser.uid,
        userName: formData.name,
        email: formData.email,
        phone: formData.phone,
        deliveryType: orderType,
        shippingAddress: orderType === 'online' ? {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        } : {
          address: 'Store Pickup',
          city: 'Store Location',
          state: '',
          pincode: ''
        },
        items: cart,
        subtotal: getTotalAmount(),
        tax: Math.round(getTotalAmount() * 0.18),
        total: getFinalAmount(),
        paymentId: paymentId,
        paymentStatus: orderType === 'online' ? 'paid' : 'pending',
        status: orderType === 'online' ? 'confirmed' : 'pending', // Offline orders need admin approval
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'orders'), orderData);

      // Clear cart
      localStorage.removeItem('cart');
      
      // Show success message based on order type
      if (orderType === 'online') {
        alert('Order placed successfully! Payment ID: ' + paymentId + '\nYour order will be delivered soon.');
      } else {
        alert('Order placed successfully!\nYour order is pending admin approval. You can pick it up from store after approval.');
      }
      
      navigate('/orders');
      
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Order creation failed: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Type</h2>

              {/* Delivery Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setDeliveryType('online')}
                  className={`p-4 border-2 rounded-lg transition ${
                    deliveryType === 'online'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <Truck className={`w-8 h-8 mb-2 ${deliveryType === 'online' ? 'text-indigo-600' : 'text-gray-600'}`} />
                    <h3 className={`font-semibold ${deliveryType === 'online' ? 'text-indigo-900' : 'text-gray-900'}`}>
                      Online Delivery
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 text-center">
                      Pay online & get delivered to your address
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('offline')}
                  className={`p-4 border-2 rounded-lg transition ${
                    deliveryType === 'offline'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <Store className={`w-8 h-8 mb-2 ${deliveryType === 'offline' ? 'text-green-600' : 'text-gray-600'}`} />
                    <h3 className={`font-semibold ${deliveryType === 'offline' ? 'text-green-900' : 'text-gray-900'}`}>
                      Store Pickup
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 text-center">
                      Pay at store & pick up after admin approval
                    </p>
                  </div>
                </button>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-6 mt-8">
                {deliveryType === 'online' ? 'Shipping Information' : 'Contact Information'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>
                </div>

                {deliveryType === 'online' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Address
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        rows="3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {deliveryType === 'online' ? (
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Payment via Razorpay</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        You'll be redirected to Razorpay's secure payment gateway
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Store className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900">Store Pickup - Pay at Store</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Your order will be pending admin approval. You can pick it up and pay at the store after approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-6 text-white py-3 rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                  deliveryType === 'online' 
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Processing...' : (deliveryType === 'online' ? 'Proceed to Payment' : 'Place Order for Store Pickup')}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{getTotalAmount()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18%)</span>
                  <span>₹{Math.round(getTotalAmount() * 0.18)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{getFinalAmount()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

