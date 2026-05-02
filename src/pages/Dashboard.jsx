import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Car, Wrench, ShoppingBag, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    vehicles: 0,
    bookings: 0,
    orders: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const fetchDashboardData = async () => {
    if (!currentUser) return;

    try {
      // Fetch vehicles count
      const vehiclesQuery = query(
        collection(db, 'vehicles'),
        where('userId', '==', currentUser.uid)
      );
      const vehiclesSnap = await getDocs(vehiclesQuery);
      
      // Fetch bookings count
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', currentUser.uid)
      );
      const bookingsSnap = await getDocs(bookingsQuery);
      
      // Fetch recent bookings
      const recentQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', currentUser.uid)
      );
      const recentSnap = await getDocs(recentQuery);
      const bookingsData = recentSnap.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Fetch orders count
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.uid)
      );
      const ordersSnap = await getDocs(ordersQuery);

      setStats({
        vehicles: vehiclesSnap.size,
        bookings: bookingsSnap.size,
        orders: ordersSnap.size
      });

      setRecentBookings(bookingsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentUser?.displayName || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your vehicles
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Car className="w-8 h-8 text-indigo-600" />}
            title="My Vehicles"
            value={stats.vehicles}
            link="/vehicles"
            linkText="Manage Vehicles"
          />
          <StatCard
            icon={<Wrench className="w-8 h-8 text-green-600" />}
            title="Service Bookings"
            value={stats.bookings}
            link="/bookings"
            linkText="View Bookings"
          />
          <StatCard
            icon={<ShoppingBag className="w-8 h-8 text-purple-600" />}
            title="Parts Orders"
            value={stats.orders}
            link="/orders"
            linkText="View Orders"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <QuickAction
            title="Book a Service"
            description="Schedule a service appointment for your vehicle"
            link="/bookings/new"
            buttonText="Book Now"
            color="indigo"
          />
          <QuickAction
            title="Buy Spare Parts"
            description="Browse our collection of genuine spare parts"
            link="/store"
            buttonText="Shop Now"
            color="purple"
          />
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Bookings</h2>
            <Link to="/bookings" className="text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No bookings yet</p>
              <Link
                to="/bookings/new"
                className="inline-block mt-4 text-indigo-600 hover:underline"
              >
                Book your first service
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, link, linkText }) => (
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
    <div className="flex items-center justify-between mb-4">
      {icon}
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </div>
    <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
    <Link to={link} className="text-indigo-600 hover:underline text-sm font-medium">
      {linkText} →
    </Link>
  </div>
);

const QuickAction = ({ title, description, link, buttonText, color }) => (
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <Link
      to={link}
      className={`inline-block bg-${color}-600 text-white px-6 py-2 rounded-lg hover:bg-${color}-700 transition font-medium`}
    >
      {buttonText}
    </Link>
  </div>
);

const BookingCard = ({ booking }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-900">{booking.serviceType}</h4>
          <p className="text-sm text-gray-600 mt-1">
            {booking.vehicleName} • {booking.date}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
          {booking.status}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;




