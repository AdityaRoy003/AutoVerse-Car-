import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Search, Filter, Fuel, Gauge, SlidersHorizontal, ArrowUpDown, ChevronRight, Check } from 'lucide-react';

export const NewCarsPage: React.FC = () => {
  const { t } = useLanguage();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [bodyType, setBodyType] = useState('all');
  const [fuelType, setFuelType] = useState('all');
  const [transmission, setTransmission] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      try {
        const params: any = { sortBy };
        if (search) params.search = search;
        if (bodyType !== 'all') params.bodyType = bodyType;
        if (fuelType !== 'all') params.fuelType = fuelType;
        if (transmission !== 'all') params.transmission = transmission;

        if (priceRange === 'under10') params.maxPrice = 1000000;
        else if (priceRange === '10to15') { params.minPrice = 1000000; params.maxPrice = 1500000; }
        else if (priceRange === 'above15') params.minPrice = 1500000;

        const res = await api.getCars(params);
        if (res.success) {
          setCars(res.cars || []);
        }
      } catch (err) {
        console.error('Failed to fetch new cars:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchCars, 200);
    return () => clearTimeout(timer);
  }, [search, bodyType, fuelType, transmission, sortBy, priceRange]);

  const resetFilters = () => {
    setSearch('');
    setBodyType('all');
    setFuelType('all');
    setTransmission('all');
    setPriceRange('all');
    setSortBy('featured');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Page Header & Breadcrumb */}
      <div className="bg-[#121212] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-red-400 font-medium">New Vehicles Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            New Passenger Vehicles Lineup
          </h1>
          <p className="text-gray-300 text-sm mt-1 max-w-2xl">
            Explore our authorised passenger models in Lucknow. Choose your variant, review complete specifications, and calculate real-time city-wise on-road prices.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search & Filter Toolbar */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by model, SUV, Sedan, or feature..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
              />
            </div>

            {/* Body Type Filter */}
            <div className="md:col-span-2">
              <select
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value)}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Body Types</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="EV">Electric Vehicle (EV)</option>
              </select>
            </div>

            {/* Fuel Filter */}
            <div className="md:col-span-2">
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Fuel Types</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Model: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Secondary Quick Filter Pills */}
          <div className="flex flex-wrap items-center justify-between pt-3 border-t border-gray-100 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-500 font-medium mr-1">Budget Slab:</span>
              <button
                onClick={() => setPriceRange('all')}
                className={`px-3 py-1 rounded-full border transition ${
                  priceRange === 'all'
                    ? 'bg-[#121212] text-white border-black font-semibold'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                All Budgets
              </button>
              <button
                onClick={() => setPriceRange('under10')}
                className={`px-3 py-1 rounded-full border transition ${
                  priceRange === 'under10'
                    ? 'bg-[#121212] text-white border-black font-semibold'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                Under ₹10 Lakh
              </button>
              <button
                onClick={() => setPriceRange('10to15')}
                className={`px-3 py-1 rounded-full border transition ${
                  priceRange === '10to15'
                    ? 'bg-[#121212] text-white border-black font-semibold'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                ₹10 - ₹15 Lakh
              </button>
              <button
                onClick={() => setPriceRange('above15')}
                className={`px-3 py-1 rounded-full border transition ${
                  priceRange === 'above15'
                    ? 'bg-[#121212] text-white border-black font-semibold'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                Above ₹15 Lakh
              </button>
            </div>

            <button
              onClick={resetFilters}
              className="text-red-600 hover:text-red-800 font-medium transition mt-2 sm:mt-0"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 h-96 animate-pulse" />
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-md mx-auto">
            <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No vehicles match these filters</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Try adjusting your price range, fuel type, or search query.
            </p>
            <button
              onClick={resetFilters}
              className="bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => (
              <div
                key={car._id}
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-lg transition flex flex-col overflow-hidden group"
              >
                {/* Vehicle Photograph */}
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img
                    src={car.heroImage}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded">
                    {car.bodyType}
                  </div>
                  {car.safetyRating && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow">
                      ★ {car.safetyRating} Star Safety
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition">
                          {car.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{car.tagline}</p>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-md">
                        {car.variantCount || (car.variants ? car.variants.length : 1)} Variants
                      </span>
                    </div>

                    {/* Technical Highlights */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-5 pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Engine / Power</span>
                        <span className="font-medium text-gray-800">{car.specifications?.maxPower || '158 bhp'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Fuel Types</span>
                        <span className="font-medium text-gray-800">{car.specifications?.fuelTypes?.join(', ') || 'Petrol'}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Certified Mileage</span>
                        <span className="font-medium text-gray-800">{car.specifications?.mileageKmpl || 18.2} km/l</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Seating</span>
                        <span className="font-medium text-gray-800">{car.specifications?.seatingCapacity || 5} Seater</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-5 mt-5 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                        Ex-Showroom Starting
                      </span>
                      <span className="text-lg font-black text-gray-900">
                        {formatCurrency(car.startingPrice)}
                      </span>
                    </div>

                    <Link
                      to={`/cars/${car.slug}`}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition shadow-sm flex items-center space-x-1"
                    >
                      <span>View & Price</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

