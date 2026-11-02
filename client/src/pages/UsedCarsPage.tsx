import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Search, ShieldCheck, Fuel, Gauge, SlidersHorizontal, ChevronRight, Award } from 'lucide-react';

export const UsedCarsPage: React.FC = () => {
  const { t } = useLanguage();
  const [usedCars, setUsedCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [fuelType, setFuelType] = useState('all');
  const [transmission, setTransmission] = useState('all');
  const [ownershipCount, setOwnershipCount] = useState('all');
  const [maxKm, setMaxKm] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    async function fetchUsedCars() {
      setLoading(true);
      try {
        const params: any = { sortBy };
        if (search) params.search = search;
        if (fuelType !== 'all') params.fuelType = fuelType;
        if (transmission !== 'all') params.transmission = transmission;
        if (ownershipCount !== 'all') params.ownershipCount = ownershipCount;
        if (maxKm !== 'all') params.maxKm = maxKm;

        const res = await api.getUsedCars(params);
        if (res.success) {
          setUsedCars(res.usedCars || []);
        }
      } catch (err) {
        console.error('Failed to fetch used cars:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchUsedCars, 200);
    return () => clearTimeout(timer);
  }, [search, fuelType, transmission, ownershipCount, maxKm, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setFuelType('all');
    setTransmission('all');
    setOwnershipCount('all');
    setMaxKm('all');
    setSortBy('newest');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Page Header */}
      <div className="bg-[#121212] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-red-400 font-medium">Certified Used Cars</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Autoverse Certified Pre-Owned Cars
          </h1>
          <p className="text-gray-300 text-sm mt-1 max-w-2xl">
            Lucknow's certified used car marketplace. 150-point diagnostic inspection, genuine mileage certification, non-accidental ultrasound verification, and masked registration numbers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Filters Toolbar */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stock ID, Model H, Model C..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="md:col-span-2">
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Fuels</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Transmission</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={ownershipCount}
                onChange={(e) => setOwnershipCount(e.target.value)}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Any Owner</option>
                <option value="1">1st Owner Only</option>
                <option value="2">2nd Owner</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="newest">Latest Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="km_asc">Lowest Kilometres</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 text-xs text-gray-500 border-t border-gray-100">
            <span>Showing {usedCars.length} Certified Vehicles in Lucknow Stockyard</span>
            <button onClick={resetFilters} className="text-red-600 hover:text-red-800 font-semibold">
              Reset Filters
            </button>
          </div>
        </div>

        {/* Used Cars Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 h-96 animate-pulse" />
            ))}
          </div>
        ) : usedCars.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-md mx-auto">
            <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No used cars match criteria</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Try clearing filters or search parameters.</p>
            <button onClick={resetFilters} className="bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-md">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {usedCars.map((car) => (
              <div
                key={car._id}
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-lg transition flex flex-col overflow-hidden group"
              >
                {/* Photo */}
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img
                    src={car.images?.[0] || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'}
                    alt={car.modelName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {/* Masked Registration Plate */}
                  <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-sm text-white text-xs font-mono font-bold px-2.5 py-1 rounded shadow">
                    {car.maskedRegistration || 'UP32AB****'}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {car.status === 'Available' ? (
                      <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded flex items-center space-x-1 shadow">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Certified Available</span>
                      </span>
                    ) : (
                      <span className="bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow">
                        {car.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">
                          Stock #{car.stockId}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition">
                          {car.manufacturingYear} {car.modelName}
                        </h3>
                        <p className="text-xs text-gray-500">{car.variantName}</p>
                      </div>
                      <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {car.ownershipCount === 1 ? '1st Owner' : `${car.ownershipCount} Owners`}
                      </span>
                    </div>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mt-5 pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Odometer</span>
                        <span className="font-semibold text-gray-800 text-sm">{car.kilometres?.toLocaleString()} km</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Fuel & Drive</span>
                        <span className="font-semibold text-gray-800 text-sm">{car.fuelType} • {car.transmission}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="pt-5 mt-5 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                        Dealership Asking Price
                      </span>
                      <span className="text-xl font-black text-gray-900">
                        {formatCurrency(car.askingPrice)}
                      </span>
                    </div>

                    <Link
                      to={`/used-cars/${car.stockId}`}
                      className="bg-gray-900 hover:bg-black text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg transition shadow-sm flex items-center space-x-1"
                    >
                      <span>150-Pt Report</span>
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

