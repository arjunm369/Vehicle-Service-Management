import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Wrench, Plus, Calendar, Clock, X, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const Bookings = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: '',
    date: '',
    time: '',
    description: ''
  });

  const serviceTypes = [
    'Oil Change',
    'General Service',
    'Tire Rotation',
    'Brake Service',
    'Engine Diagnostics',
    'Transmission Service',
    'AC Service',
    'Battery Replacement',
    'Wheel Alignment',
    'Full Service'
  ];

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;

    try {
      // Fetch bookings
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', currentUser.uid)
      );
      const bookingsSnap = await getDocs(bookingsQuery);
      const bookingsData = bookingsSnap.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Fetch vehicles
      const vehiclesQuery = query(
        collection(db, 'vehicles'),
        where('userId', '==', currentUser.uid)
      );
      const vehiclesSnap = await getDocs(vehiclesQuery);
      const vehiclesData = vehiclesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setBookings(bookingsData);
      setVehicles(vehiclesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);

    try {
      await addDoc(collection(db, 'bookings'), {
        ...formData,
        vehicleName: `${selectedVehicle.make} ${selectedVehicle.model}`,
        registrationNumber: selectedVehicle.registrationNumber,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      setShowModal(false);
      setFormData({
        vehicleId: '',
        serviceType: '',
        date: '',
        time: '',
        description: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      fetchData();
    } catch (error) {
      console.error('Error updating booking:', error);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Bookings</h1>
            <p className="text-gray-600 mt-2">Schedule and track your vehicle services</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={vehicles.length === 0}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            <span>Book Service</span>
          </button>
        </div>

        {vehicles.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              Please add a vehicle first before booking a service.
            </p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
            <p className="text-gray-600 mb-6">Schedule your first service appointment</p>
            {vehicles.length > 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Book Your First Service
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onUpdateStatus={updateBookingStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Book Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Book a Service</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Vehicle</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Choose a vehicle...</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Choose a service...</option>
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows="3"
                  placeholder="Any specific issues or requests..."
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Book Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const BookingCard = ({ booking, onUpdateStatus }) => {
  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <Clock className="w-5 h-5" />
    },
    confirmed: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <CheckCircle className="w-5 h-5" />
    },
    'in-progress': {
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: <Wrench className="w-5 h-5" />
    },
    completed: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <CheckCircle className="w-5 h-5" />
    },
    cancelled: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <XCircle className="w-5 h-5" />
    }
  };

  const config = statusConfig[booking.status] || statusConfig.pending;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{booking.serviceType}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color} flex items-center space-x-1`}>
              {config.icon}
              <span className="ml-1">{booking.status}</span>
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{booking.date} at {booking.time}</span>
            </div>
            <p className="font-medium">{booking.vehicleName} ({booking.registrationNumber})</p>
            {booking.description && (
              <p className="text-gray-600 mt-2">{booking.description}</p>
            )}
          </div>
        </div>
      </div>

      {booking.status === 'pending' && (
        <div className="flex space-x-2 mt-4 pt-4 border-t">
          <button
            onClick={() => onUpdateStatus(booking.id, 'cancelled')}
            className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition font-medium"
          >
            Cancel Booking
          </button>
        </div>
      )}
    </div>
  );
};

export default Bookings;




