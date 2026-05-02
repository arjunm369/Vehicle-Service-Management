import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { Users, Car, Wrench, Package, ShoppingBag, Plus, Edit2, Trash2, X } from 'lucide-react';
import Navbar from '../components/Navbar';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    users: 0,
    vehicles: 0,
    bookings: 0,
    orders: 0
  });
  const [data, setData] = useState({
    users: [],
    bookings: [],
    orders: [],
    spareParts: []
  });
  const [loading, setLoading] = useState(true);
  const [showPartModal, setShowPartModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [partFormData, setPartFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: ''
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch all collections
      const usersSnap = await getDocs(collection(db, 'users'));
      const vehiclesSnap = await getDocs(collection(db, 'vehicles'));
      const bookingsSnap = await getDocs(collection(db, 'bookings'));
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const partsSnap = await getDocs(collection(db, 'spareParts'));

      setStats({
        users: usersSnap.size,
        vehicles: vehiclesSnap.size,
        bookings: bookingsSnap.size,
        orders: ordersSnap.size
      });

      setData({
        users: usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        bookings: bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        orders: ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        spareParts: partsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      fetchAdminData();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      fetchAdminData();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handlePartSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPart) {
        await updateDoc(doc(db, 'spareParts', editingPart.id), {
          ...partFormData,
          price: parseFloat(partFormData.price),
          stock: parseInt(partFormData.stock),
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'spareParts'), {
          ...partFormData,
          price: parseFloat(partFormData.price),
          stock: parseInt(partFormData.stock),
          createdAt: new Date().toISOString()
        });
      }
      setShowPartModal(false);
      setEditingPart(null);
      setPartFormData({ name: '', description: '', category: '', price: '', stock: '' });
      fetchAdminData();
    } catch (error) {
      console.error('Error saving part:', error);
    }
  };

  const handleEditPart = (part) => {
    setEditingPart(part);
    setPartFormData({
      name: part.name,
      description: part.description,
      category: part.category,
      price: part.price.toString(),
      stock: part.stock.toString()
    });
    setShowPartModal(true);
  };

  const handleDeletePart = async (partId) => {
    if (window.confirm('Are you sure you want to delete this part?')) {
      try {
        await deleteDoc(doc(db, 'spareParts', partId));
        fetchAdminData();
      } catch (error) {
        console.error('Error deleting part:', error);
      }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard icon={<Users />} title="Total Users" value={stats.users} color="indigo" />
              <StatCard icon={<Car />} title="Total Vehicles" value={stats.vehicles} color="green" />
              <StatCard icon={<Wrench />} title="Bookings" value={stats.bookings} color="purple" />
              <StatCard icon={<Package />} title="Orders" value={stats.orders} color="orange" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickAccessCard
                title="Manage Bookings"
                description="View and update service bookings"
                onClick={() => setActiveTab('bookings')}
                color="purple"
              />
              <QuickAccessCard
                title="Manage Orders"
                description="Track and fulfill orders"
                onClick={() => setActiveTab('orders')}
                color="orange"
              />
              <QuickAccessCard
                title="Manage Users"
                description="View user information"
                onClick={() => setActiveTab('users')}
                color="indigo"
              />
              <QuickAccessCard
                title="Spare Parts Inventory"
                description="Add and manage spare parts"
                onClick={() => setActiveTab('parts')}
                color="green"
              />
            </div>
          </>
        )}

        {/* Tabs */}
        {activeTab !== 'overview' && (
          <div className="mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-indigo-600 hover:underline mb-4"
            >
              ← Back to Overview
            </button>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Bookings</h2>
            <div className="space-y-4">
              {data.bookings.map(booking => (
                <AdminBookingCard
                  key={booking.id}
                  booking={booking}
                  onUpdateStatus={updateBookingStatus}
                />
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders Management</h2>
            <div className="space-y-4">
              {data.orders.map(order => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                />
              ))}
            </div>
          </div>
        )}

        {/* Spare Parts Tab */}
        {activeTab === 'parts' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Spare Parts Inventory</h2>
              <button
                onClick={() => setShowPartModal(true)}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-5 h-5" />
                <span>Add Part</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.spareParts.map(part => (
                <PartCard
                  key={part.id}
                  part={part}
                  onEdit={handleEditPart}
                  onDelete={handleDeletePart}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Part Modal */}
      {showPartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPart ? 'Edit Part' : 'Add New Part'}
              </h2>
              <button
                onClick={() => {
                  setShowPartModal(false);
                  setEditingPart(null);
                  setPartFormData({ name: '', description: '', category: '', price: '', stock: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handlePartSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                <input
                  type="text"
                  value={partFormData.name}
                  onChange={(e) => setPartFormData({ ...partFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={partFormData.description}
                  onChange={(e) => setPartFormData({ ...partFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={partFormData.category}
                  onChange={(e) => setPartFormData({ ...partFormData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Select category...</option>
                  <option value="Engine">Engine</option>
                  <option value="Brakes">Brakes</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Body">Body</option>
                  <option value="Filters">Filters</option>
                  <option value="Tires">Tires</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={partFormData.price}
                    onChange={(e) => setPartFormData({ ...partFormData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={partFormData.stock}
                    onChange={(e) => setPartFormData({ ...partFormData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPartModal(false);
                    setEditingPart(null);
                    setPartFormData({ name: '', description: '', category: '', price: '', stock: '' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  {editingPart ? 'Update' : 'Add'} Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mb-4`}>
      <div className={`text-${color}-600`}>{icon}</div>
    </div>
    <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const QuickAccessCard = ({ title, description, onClick, color }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
  >
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <button className={`bg-${color}-600 text-white px-4 py-2 rounded-lg hover:bg-${color}-700 transition`}>
      Open →
    </button>
  </div>
);

const AdminBookingCard = ({ booking, onUpdateStatus }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="font-bold text-gray-900">{booking.serviceType}</h4>
        <p className="text-sm text-gray-600">{booking.vehicleName} • {booking.date}</p>
        <p className="text-sm text-gray-600">Customer: {booking.userName}</p>
      </div>
      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
        {booking.status}
      </span>
    </div>
    <div className="flex space-x-2">
      <button
        onClick={() => onUpdateStatus(booking.id, 'confirmed')}
        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
      >
        Confirm
      </button>
      <button
        onClick={() => onUpdateStatus(booking.id, 'in-progress')}
        className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
      >
        In Progress
      </button>
      <button
        onClick={() => onUpdateStatus(booking.id, 'completed')}
        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
      >
        Complete
      </button>
    </div>
  </div>
);

const AdminOrderCard = ({ order, onUpdateStatus }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="font-bold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</h4>
        <p className="text-sm text-gray-600">Customer: {order.userName}</p>
        <p className="text-sm text-gray-600">Total: ₹{order.total}</p>
      </div>
      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
        {order.status}
      </span>
    </div>
    <div className="flex space-x-2">
      <button
        onClick={() => onUpdateStatus(order.id, 'processing')}
        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
      >
        Processing
      </button>
      <button
        onClick={() => onUpdateStatus(order.id, 'shipped')}
        className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
      >
        Shipped
      </button>
      <button
        onClick={() => onUpdateStatus(order.id, 'delivered')}
        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
      >
        Delivered
      </button>
    </div>
  </div>
);

const PartCard = ({ part, onEdit, onDelete }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-bold text-gray-900">{part.name}</h4>
      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{part.category}</span>
    </div>
    <p className="text-sm text-gray-600 mb-3">{part.description}</p>
    <div className="flex justify-between items-center mb-3">
      <span className="text-lg font-bold text-indigo-600">₹{part.price}</span>
      <span className="text-sm text-gray-600">Stock: {part.stock}</span>
    </div>
    <div className="flex space-x-2">
      <button
        onClick={() => onEdit(part)}
        className="flex-1 flex items-center justify-center space-x-1 bg-blue-100 text-blue-700 py-2 rounded hover:bg-blue-200"
      >
        <Edit2 className="w-4 h-4" />
        <span>Edit</span>
      </button>
      <button
        onClick={() => onDelete(part.id)}
        className="flex-1 flex items-center justify-center space-x-1 bg-red-100 text-red-700 py-2 rounded hover:bg-red-200"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>
  </div>
);

export default Admin;




