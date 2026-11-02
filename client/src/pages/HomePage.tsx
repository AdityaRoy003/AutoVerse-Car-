import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  Car,
  ShieldCheck,
  Calendar,
  Fuel,
  Gauge,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Award,
  Zap,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const [featuredCars, setFeaturedCars] = useState<any[]>([]);
  const [usedCars, setUsedCars] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [carsRes, usedRes, offersRes] = await Promise.all([
          api.getCars({ limit: 4, sortBy: 'featured' }),
          api.getUsedCars({ limit: 4, sortBy: 'newest' }),
          api.getOffers(),
        ]);

        if (carsRes.success) setFeaturedCars(carsRes.cars || []);
        if (usedRes.success) setUsedCars(usedRes.usedCars || []);
        if (offersRes.success) setOffers(offersRes.offers || []);
      } catch (err) {
        console.error('Failed to load homepage inventory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#101010] text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        {/* Subtle automotive background pattern & glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>Lucknow's Authorised Passenger Car Dealership</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Find the Car <br />
              That <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">Moves You.</span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              Explore Lucknow's finest showroom lineup: turbo SUVs, executive sedans, and 150-point certified pre-owned vehicles. Calculate authentic on-road pricing with zero hidden charges.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <Link
                to="/cars"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-7 py-3.5 rounded-lg transition shadow-lg shadow-red-900/20 text-center flex items-center justify-center space-x-2"
              >
                <span>{t('btnExploreNew')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/used-cars"
                className="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 font-semibold px-7 py-3.5 rounded-lg transition text-center flex items-center justify-center space-x-2"
              >
                <span>{t('btnExploreUsed')}</span>
              </Link>
            </div>

            {/* Quick credibility stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-800/80">
              <div>
                <span className="block text-2xl font-black text-white">3</span>
                <span className="text-xs text-gray-400">Lucknow Showrooms</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">150-Pt</span>
                <span className="text-xs text-gray-400">Technical Inspection</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">100%</span>
                <span className="text-xs text-gray-400">RTO On-Road Transparency</span>
              </div>
            </div>
          </div>

          {/* Hero Car Showcase Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl bg-gray-950 group">
              <img
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80"
                alt="Autoverse Flagship Model H"
                className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider block">Featured Flagship</span>
                <div className="flex justify-between items-end mt-1">
                  <div>
                    <h3 className="text-2xl font-black text-white">Model H Turbo SUV</h3>
                    <p className="text-xs text-gray-300">Level 2 ADAS • Panoramic Sunroof • 158 bhp</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Starting From</span>
                    <span className="text-lg font-bold text-white">₹10.95 Lakh*</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROMOTIONAL FESTIVE OFFER BANNER (If Available) */}
      {offers.length > 0 && (
        <section className="bg-red-600 text-white py-3.5 px-4 text-center text-xs sm:text-sm font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-3">
            <span className="bg-white text-red-700 font-extrabold text-[11px] uppercase tracking-wider px-2 py-0.5 rounded">
              {offers[0].badgeText || 'Special Offer'}
            </span>
            <span>{offers[0].title}: {offers[0].description}</span>
            <Link to="/offers" className="underline font-bold hover:text-red-100 flex items-center ml-2">
              View Terms <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* 3. FEATURED NEW VEHICLES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-1">
              New Inventory
            </span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {t('secFeaturedNew')}
            </h2>
            <p className="text-sm text-gray-600 mt-1 max-w-xl">
              Factory-new passenger models configured with the latest automotive safety tech and fuel options.
            </p>
          </div>
          <Link
            to="/cars"
            className="mt-4 md:mt-0 text-sm font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
          >
            <span>View All Models</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-gray-200 h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCars.map((car) => (
              <div
                key={car._id}
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-lg transition flex flex-col overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={car.heroImage}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-0.5 rounded uppercase tracking-wider">
                    {car.bodyType}
                  </div>
                  {car.safetyRating && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center space-x-1">
                      <span>★ {car.safetyRating} Safety</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition">
                      {car.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{car.tagline}</p>

                    {/* Quick Specs */}
                    <div className="flex items-center space-x-3 text-xs text-gray-600 mt-3 pt-3 border-t border-gray-100">
                      <span className="flex items-center space-x-1">
                        <Fuel className="w-3.5 h-3.5 text-gray-400" />
                        <span>{car.specifications?.fuelTypes?.join(', ') || 'Petrol'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Gauge className="w-3.5 h-3.5 text-gray-400" />
                        <span>{car.specifications?.mileageKmpl || 18} km/l</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">Ex-Showroom From</span>
                      <span className="text-base font-extrabold text-gray-900">
                        {formatCurrency(car.startingPrice)}
                      </span>
                    </div>
                    <Link
                      to={`/cars/${car.slug}`}
                      className="bg-gray-100 hover:bg-red-600 hover:text-white text-gray-800 text-xs font-semibold px-3 py-2 rounded-md transition"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. CERTIFIED PRE-OWNED USED CARS SHOWCASE */}
      <section className="bg-gray-100/70 border-y border-gray-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-1">
                Verified Pre-Owned
              </span>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {t('secCertifiedUsed')}
              </h2>
              <p className="text-sm text-gray-600 mt-1 max-w-xl">
                Every vehicle includes an unedited 150-point diagnostic inspection, ultrasound paint check, and masked registration number.
              </p>
            </div>
            <Link
              to="/used-cars"
              className="mt-4 md:mt-0 text-sm font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <span>Explore All Pre-Owned Cars</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {usedCars.map((used) => (
              <div
                key={used._id}
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-md transition flex flex-col overflow-hidden group"
              >
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={used.images?.[0] || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'}
                    alt={`${used.modelName} ${used.variantName}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    {used.maskedRegistration || 'UP32AB****'}
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Certified</span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Stock #{used.stockId}
                    </span>
                    <h4 className="font-bold text-base text-gray-900 group-hover:text-red-600 transition">
                      {used.manufacturingYear} {used.modelName}
                    </h4>
                    <p className="text-xs text-gray-500">{used.variantName}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 mt-3 pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-gray-400 block text-[9px] uppercase">Odometer</span>
                        <span className="font-medium">{used.kilometres?.toLocaleString()} km</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px] uppercase">Fuel & Trans</span>
                        <span className="font-medium">{used.fuelType} • {used.transmission}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-semibold">Dealership Price</span>
                      <span className="text-base font-extrabold text-gray-900">
                        {formatCurrency(used.askingPrice)}
                      </span>
                    </div>
                    <Link
                      to={`/used-cars/${used.stockId}`}
                      className="bg-gray-100 hover:bg-black hover:text-white text-gray-800 text-xs font-semibold px-2.5 py-1.5 rounded transition"
                    >
                      Report
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY DRIVE WITH AUTOVERSE (USPs) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-1">
            Authorised Dealership Advantage
          </span>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {t('secWhyChooseUs')}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {t('secWhyChooseUsSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition">
            <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900 mb-2">{t('uspCertifiedTitle')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{t('uspCertifiedDesc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition">
            <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900 mb-2">{t('uspPricingTitle')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{t('uspPricingDesc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition">
            <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900 mb-2">{t('uspTestDriveTitle')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{t('uspTestDriveDesc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition">
            <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900 mb-2">{t('uspServiceTitle')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{t('uspServiceDesc')}</p>
          </div>
        </div>
      </section>

      {/* 5.5 EXPRESS WORKSHOP BOOKING (Answers ₹48.6L/yr Unanswered Service Call Problem) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-3xl p-8 sm:p-12 border border-neutral-800 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Zero Call Queues • 60-Second Booking
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif text-white">
                Book Authorized Service & Repairs Online
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Skip telephone delays. Book directly into our 40 state-of-the-art service bays across Transport Nagar (24 bays) and Amausi (16 bays) with live bay occupancy and transparent estimates.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Real-time bay slot reservation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Complimentary doorstep pickup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Digital job card & WhatsApp tracking</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                to="/book-service"
                className="btn-primary text-center py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-red-700"
              >
                <span>Book Service in 60s</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-center text-[11px] text-neutral-400">
                Standard ₹4,500 maintenance package or Express 90-min bay
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="bg-[#121212] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Your Next Drive Starts Here in Lucknow.
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Reserve a priority test-drive slot at Hazratganj Central, Gomti Nagar, or Alambagh with instant slot reservation and live consultant coordination.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
            <Link
              to="/book-test-drive"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3.5 rounded-lg transition shadow-lg text-sm"
            >
              Book an Executive Test Drive
            </Link>
            <Link
              to="/cars"
              className="bg-transparent hover:bg-gray-800 border border-gray-700 text-gray-300 font-semibold px-8 py-3.5 rounded-lg transition text-sm"
            >
              Browse New Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

