import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ShoppingCart, Plus, Minus, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Store = () => {
  useAuth();
  const navigate = useNavigate();
  const [parts, setParts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Engine', 'Brakes', 'Suspension', 'Electrical', 'Body', 'Filters', 'Tires'];

  useEffect(() => {
    fetchParts();
    loadCart();
  }, []);

  const fetchParts = async () => {
    try {
      const partsSnap = await getDocs(collection(db, 'spareParts'));
      const partsData = partsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setParts(partsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching parts:', error);
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (part) => {
    const existingItem = cart.find(item => item.id === part.id);
    
    if (existingItem) {
      const newCart = cart.map(item =>
        item.id === part.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      saveCart(newCart);
    } else {
      saveCart([...cart, { ...part, quantity: 1 }]);
    }
  };

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || part.category === selectedCategory;
    return matchesSearch && matchesCategory && part.stock > 0;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Spare Parts Store</h1>
            <p className="text-gray-600 mt-2">Browse and purchase genuine spare parts</p>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="relative bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center space-x-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Cart</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search spare parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Parts Grid */}
        {filteredParts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-600">No parts found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParts.map(part => (
              <PartCard
                key={part.id}
                part={part}
                onAddToCart={addToCart}
                cartItem={cart.find(item => item.id === part.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PartCard = ({ part, onAddToCart, cartItem }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
    <div className="h-48 bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
      <ShoppingCart className="w-16 h-16 text-indigo-400" />
    </div>
    
    <div className="p-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-gray-900">{part.name}</h3>
        <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">
          {part.category}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{part.description}</p>
      
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-bold text-indigo-600">₹{part.price}</span>
        <span className="text-sm text-gray-600">{part.stock} in stock</span>
      </div>

      <button
        onClick={() => onAddToCart(part)}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add to Cart</span>
      </button>

      {cartItem && (
        <div className="mt-2 text-center text-sm text-green-600 font-medium">
          {cartItem.quantity} in cart
        </div>
      )}
    </div>
  </div>
);

export default Store;




