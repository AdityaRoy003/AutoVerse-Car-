import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import {
  User,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Car,
  MapPin,
  ChevronRight,
  Shield,
  Wrench,
  Truck,
} from 'lucide-react';

export const BuyerDashboardPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'TEST_DRIVES' | 'SERVICES'>('TEST_DRIVES');
  const [bookings, setBookings] = useState<any[]>([]);
  const [serviceBookings, setServiceBookings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [updatingConsent, setUpdatingConsent] = useState(false);
  const [cancelModalBooking, setCancelModalBooking] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    async function loadBuyerData() {
      try {
        const [bookingsRes, servicesRes, meRes] = await Promise.all([
          api.getMyBookings(),
          api.getMyServiceBookings(),
          fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${localStorage.getItem('autoverse_token')}` },
          }).then((r) => r.json()),
        ]);

        if (bookingsRes.success) setBookings(bookingsRes.bookings || []);
        if (servicesRes.success) setServiceBookings(servicesRes.bookings || []);
        if (meRes.success) {
          setProfile(meRes.profile);
          setMarketingOptIn(meRes.profile?.marketingOptIn || false);
        }
      } catch (err) {
        console.error('Failed to load buyer data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBuyerData();
  }, []);

  const handleToggleMarketing = async () => {
    setUpdatingConsent(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('autoverse_token')}`,
        },
        body: JSON.stringify({ marketingOptIn: !marketingOptIn }),
      });
      const data = await res.json();
      if (data.success) {
        setMarketingOptIn(!marketingOptIn);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingConsent(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    try {
      const res = await api.updateBookingStatus(
        cancelModalBooking._id,
        'CANCELLED',
        cancelReason || 'Cancelled by buyer via customer portal'
      );
      if (res.success) {
        setBookings(
          bookings.map((b) =>
            b._id === cancelModalBooking._id ? { ...b, status: 'CANCELLED', cancellationReason: cancelReason } : b
          )
        );
        setCancelModalBooking(null);
        setCancelReason('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">Please sign in to access your garage.</p>
          <Link to="/" className="bg-red-600 text-white px-4 py-2 rounded text-xs font-semibold">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header */}
      <div className="bg-[#121212] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider block">
              Customer Garage Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Account: {user.email} • Lucknow Dealership Portal
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <Link
              to="/book-service"
              className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg border border-neutral-700 transition flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5 text-brand-red" />
              + Book Service
            </Link>
            <Link
              to="/book-test-drive"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition"
            >
              + Book Test Drive
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Bookings & Services (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('TEST_DRIVES')}
                className={`py-3 px-4 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'TEST_DRIVES'
                    ? 'border-brand-red text-brand-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Test Drive Bookings ({bookings.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SERVICES')}
                className={`py-3 px-4 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'SERVICES'
                    ? 'border-brand-red text-brand-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Service & Maintenance ({serviceBookings.length})</span>
              </button>
            </div>

            {activeTab === 'TEST_DRIVES' ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">My Scheduled Test Drives</h3>
                    <p className="text-xs text-gray-500">Track and manage your driving appointments across Lucknow</p>
                  </div>
                  <span className="text-xs font-semibold bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full">
                    {bookings.length} Bookings
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white rounded-xl h-44 animate-pulse border border-gray-200" />
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <h4 className="font-bold text-base text-gray-800">No Active Bookings</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-4">You have not scheduled any test drives yet.</p>
                    <Link
                      to="/book-test-drive"
                      className="bg-red-600 text-white font-semibold text-xs px-4 py-2 rounded-lg"
                    >
                      Schedule Your First Drive
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row justify-between gap-6"
                      >
                        <div className="flex items-start space-x-4">
                          <img
                            src={booking.carModelId?.heroImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
                            alt={booking.carModelId?.name}
                            className="w-24 h-20 object-cover rounded-xl border border-gray-100"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono font-bold text-gray-400">
                                {booking.bookingReference}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                booking.status === 'CONFIRMED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : booking.status === 'COMPLETED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : booking.status === 'CANCELLED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-gray-900">
                              {booking.carModelId?.name} - {booking.carVariantId?.name}
                            </h4>
                            <p className="text-xs text-gray-600 flex items-center space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-red-600" />
                              <span>{booking.showroomId?.name || 'Lucknow Central'}</span>
                            </p>
                            <p className="text-xs text-gray-600 flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>{new Date(booking.bookingDate).toLocaleDateString()} at {booking.timeSlot}</span>
                            </p>

                            {/* Stored Pricing Snapshot */}
                            {booking.pricingSnapshot?.onRoadPrice && (
                              <div className="pt-2 text-[11px] text-gray-500">
                                Snapshot On-Road: <strong className="text-gray-900">{formatCurrency(booking.pricingSnapshot.onRoadPrice)}</strong> ({booking.pricingSnapshot.cityName || 'Lucknow'})
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col justify-between items-end border-t md:border-t-0 pt-3 md:pt-0">
                          {booking.demoVehicleId && (
                            <span className="text-[11px] font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              Car Plate: {booking.demoVehicleId.registrationNumber} ({booking.demoVehicleId.color})
                            </span>
                          )}

                          {booking.status === 'CONFIRMED' && (
                            <button
                              onClick={() => setCancelModalBooking(booking)}
                              className="text-xs text-red-600 hover:text-red-800 font-semibold mt-3"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* SERVICES TAB */
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Workshop Service Appointments</h3>
                    <p className="text-xs text-gray-500">Live bay allocations and job card updates for your vehicles</p>
                  </div>
                  <span className="text-xs font-semibold bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full">
                    {serviceBookings.length} Appointments
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white rounded-xl h-44 animate-pulse border border-gray-200" />
                    ))}
                  </div>
                ) : serviceBookings.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <h4 className="font-bold text-base text-gray-800">No Service Appointments</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-4">Book an authorized bay in under 60 seconds with live slot availability.</p>
                    <Link
                      to="/book-service"
                      className="bg-brand-red text-white font-semibold text-xs px-4 py-2 rounded-lg"
                    >
                      Book 60-Second Service
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceBookings.map((service) => (
                      <div
                        key={service._id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row justify-between gap-6"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-bold text-gray-400">
                              {service.bookingReference}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              service.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : service.status === 'IN_SERVICE'
                                ? 'bg-blue-100 text-blue-800'
                                : service.status === 'COMPLETED'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {service.status}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-brand-red">
                              Bay #{service.assignedBayNumber}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-gray-900">
                            {service.serviceType}
                          </h4>

                          <p className="text-xs text-gray-600 flex items-center space-x-1 font-mono font-semibold">
                            <Car className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{service.vehicleRegistrationNumber} ({service.vehicleModel})</span>
                          </p>

                          <p className="text-xs text-gray-600 flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-red-600" />
                            <span>{service.workshopId?.name || 'Lucknow Service Workshop'}</span>
                          </p>

                          <p className="text-xs text-gray-600 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{service.bookingDate} • {service.timeSlot}</span>
                          </p>

                          {service.pickupDropRequired && (
                            <p className="text-xs text-neutral-600 flex items-center space-x-1 font-medium">
                              <Truck className="w-3.5 h-3.5 text-brand-red" />
                              <span>Doorstep Driver Assigned ({service.pickupAddress || 'Lucknow Address'})</span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col justify-between items-end border-t md:border-t-0 pt-3 md:pt-0 text-right">
                          <div>
                            <span className="text-[10px] uppercase text-gray-400 block font-semibold">
                              Estimated Amount
                            </span>
                            <span className="text-base font-extrabold text-gray-900">
                              ₹{service.estimatedCost?.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="mt-3">
                            <span className="text-[11px] text-gray-500 block">
                              Service Advisor: {service.serviceAdvisorName || 'Vikash Saxena'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT: Profile & DPDP Privacy Preferences (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Profile Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{user.name}</h4>
                  <span className="text-xs text-gray-500">{user.role}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Email</span>
                  <span className="font-semibold text-gray-800">{user.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Mobile</span>
                  <span className="font-semibold text-gray-800">{user.phone || 'Not added'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">City</span>
                  <span className="font-semibold text-gray-800">{profile?.city || 'Lucknow'}</span>
                </div>
              </div>
            </div>

            {/* DPDP Consent & Marketing Management */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-gray-900">Privacy & DPDP Consent</h4>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Under the Digital Personal Data Protection Act, you have full control over optional marketing communications.
              </p>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-700">WhatsApp / SMS Offers</span>
                  <button
                    onClick={handleToggleMarketing}
                    disabled={updatingConsent}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      marketingOptIn ? 'bg-red-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        marketingOptIn ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  {marketingOptIn
                    ? '✓ Subscribed to festive exchange bonuses and model launches.'
                    : '✗ Opted out of promotional communications.'}
                </p>
              </div>

              <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                Primary enquiry and booking data is retained for warranty and compliance audit records.
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-sm w-full p-6 space-y-4">
            <h3 className="font-bold text-base text-gray-900">Cancel Test Drive</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to cancel booking #{cancelModalBooking.bookingReference}?
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for cancellation</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict"
                className="w-full px-3 py-2 border rounded-md text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-3 py-1.5 border rounded text-xs"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-3 py-1.5 bg-red-600 text-white font-semibold rounded text-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

