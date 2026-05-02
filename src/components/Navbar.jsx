import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Home, Wrench, ShoppingBag, LayoutDashboard, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to={userRole === 'admin' ? '/admin' : '/dashboard'} className="flex items-center space-x-2">
              <Car className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-800">VehicleCare</span>
            </Link>

            <div className="hidden md:flex space-x-4">
              {userRole === 'admin' ? (
                // Admin-only navigation
                <NavLink to="/admin" icon={<LayoutDashboard />} text="Admin Dashboard" isActive={isActive('/admin')} />
              ) : (
                // Regular user navigation
                <>
                  <NavLink to="/dashboard" icon={<Home />} text="Dashboard" isActive={isActive('/dashboard')} />
                  <NavLink to="/vehicles" icon={<Car />} text="Vehicles" isActive={isActive('/vehicles')} />
                  <NavLink to="/bookings" icon={<Wrench />} text="Bookings" isActive={isActive('/bookings')} />
                  <NavLink to="/store" icon={<ShoppingBag />} text="Store" isActive={isActive('/store')} />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 hidden md:block">
              {currentUser?.displayName || currentUser?.email}
            </span>
            <Link
              to="/profile"
              className="text-gray-600 hover:text-indigo-600 transition"
            >
              <Settings className="w-6 h-6" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, text, isActive }) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
      isActive
        ? 'bg-indigo-100 text-indigo-600'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <span className="w-5 h-5">{icon}</span>
    <span className="font-medium">{text}</span>
  </Link>
);

export default Navbar;


