import { Link } from 'react-router-dom';
import { Car, Wrench, ShoppingCart, BarChart3, Shield, Clock } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Car className="w-8 h-8 text-white" />
              <span className="text-2xl font-bold text-white">VehicleCare</span>
            </div>
            <div className="space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-gray-200 transition font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Vehicle Service & Spare Parts
              <br />
              <span className="text-blue-200">All in One Place</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Book services, manage vehicles, and purchase spare parts seamlessly with our modern platform
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Start Free Today
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600">
            Comprehensive vehicle management at your fingertips
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Wrench className="w-10 h-10 text-indigo-600" />}
            title="Service Booking"
            description="Schedule vehicle services online with real-time tracking and updates"
          />
          <FeatureCard
            icon={<Car className="w-10 h-10 text-indigo-600" />}
            title="Vehicle Management"
            description="Keep track of all your vehicles, maintenance history, and documents"
          />
          <FeatureCard
            icon={<ShoppingCart className="w-10 h-10 text-indigo-600" />}
            title="Spare Parts Store"
            description="Purchase genuine spare parts with secure payment via Razorpay"
          />
          <FeatureCard
            icon={<Clock className="w-10 h-10 text-indigo-600" />}
            title="Real-time Tracking"
            description="Track your bookings and orders in real-time with instant notifications"
          />
          <FeatureCard
            icon={<Shield className="w-10 h-10 text-indigo-600" />}
            title="Secure Payments"
            description="Safe and secure transactions powered by Razorpay integration"
          />
          <FeatureCard
            icon={<BarChart3 className="w-10 h-10 text-indigo-600" />}
            title="Analytics & Reports"
            description="Comprehensive reports and insights for admins and users"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of happy users managing their vehicles efficiently
          </p>
          <Link
            to="/register"
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition shadow-lg"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 VehicleCare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Landing;


