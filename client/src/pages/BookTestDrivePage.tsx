import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react';

export const BookTestDrivePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Wizard state (Steps 1 to 7)
  const [currentStep, setCurrentStep] = useState(1);

  // Catalogs
  const [cars, setCars] = useState<any[]>([]);
  const [showrooms, setShowrooms] = useState<any[]>([]);
  const [demoVehicles, setDemoVehicles] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Array<{ slot: string; isAvailable: boolean }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Selections
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedShowroom, setSelectedShowroom] = useState<any>(null);
  const [selectedDemoVehicle, setSelectedDemoVehicle] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Customer Details Form
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);

  // Final Confirmation result
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // 1. Initial Load: Cars & Showrooms
  useEffect(() => {
    async function loadData() {
      try {
        const [carsRes, showroomsRes] = await Promise.all([
          api.getCars({ limit: 50 }),
          api.getShowrooms(),
        ]);

        if (carsRes.success) {
          setCars(carsRes.cars || []);
          // Check query param for preselected model
          const modelIdParam = searchParams.get('model');
          if (modelIdParam) {
            const foundModel = carsRes.cars.find((c: any) => c._id === modelIdParam || c.slug === modelIdParam);
            if (foundModel) {
              setSelectedModel(foundModel);
              const variantIdParam = searchParams.get('variant');
              if (variantIdParam && foundModel.variants) {
                const foundVariant = foundModel.variants.find((v: any) => v._id === variantIdParam);
                if (foundVariant) setSelectedVariant(foundVariant);
              } else if (foundModel.variants?.length > 0) {
                setSelectedVariant(foundModel.variants[0]);
              }
            }
          }
        }

        if (showroomsRes.success) {
          setShowrooms(showroomsRes.showrooms || []);
        }

        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().slice(0, 10));
      } catch (err) {
        console.error('Failed to load booking initial data:', err);
      }
    }
    loadData();
  }, [searchParams]);

  // 2. Load Demo Vehicles when Showroom or Model changes
  useEffect(() => {
    async function fetchDemoCars() {
      if (!selectedShowroom) return;
      try {
        const res = await api.getDemoVehicles(selectedShowroom._id, selectedModel?._id);
        if (res.success) {
          setDemoVehicles(res.demoVehicles || []);
          if (res.demoVehicles?.length > 0) {
            setSelectedDemoVehicle(res.demoVehicles[0]);
          } else {
            setSelectedDemoVehicle(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch demo vehicles:', err);
      }
    }
    fetchDemoCars();
  }, [selectedShowroom, selectedModel]);

  // 3. Load Available Slots when Demo Vehicle or Date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDemoVehicle || !selectedDate) return;
      setLoadingSlots(true);
      try {
        const res = await api.getAvailableSlots(selectedDemoVehicle._id, selectedDate);
        if (res.success && res.slots) {
          setAvailableSlots(res.slots);
          const firstOpen = res.slots.find((s: any) => s.isAvailable);
          if (firstOpen) setSelectedSlot(firstOpen.slot);
          else setSelectedSlot('');
        }
      } catch (err) {
        console.error('Failed to fetch slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedDemoVehicle, selectedDate]);

  // Submit Final Booking
  const handleConfirmBooking = async () => {
    if (!consentGiven) {
      setBookingError('Explicit consent under DPDP regulations is required.');
      return;
    }
    setSubmitting(true);
    setBookingError(null);

    try {
      const res = await api.createBooking({
        customerName,
        customerPhone,
        customerEmail,
        carModelId: selectedModel._id,
        carVariantId: selectedVariant?._id || selectedModel.variants?.[0]?._id,
        showroomId: selectedShowroom._id,
        demoVehicleId: selectedDemoVehicle._id,
        bookingDate: selectedDate,
        timeSlot: selectedSlot,
        consentGiven: true,
        notes,
      });

      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        setCurrentStep(7); // Final step
      } else {
        setBookingError(res.message || 'Unable to confirm test-drive slot.');
      }
    } catch (err: any) {
      setBookingError(err.message || 'Slot conflict or network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Model' },
    { num: 2, title: 'Showroom' },
    { num: 3, title: 'Demo Car' },
    { num: 4, title: 'Date' },
    { num: 5, title: 'Time Slot' },
    { num: 6, title: 'Details' },
    { num: 7, title: 'Confirmed' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header */}
      <div className="bg-[#121212] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-red-400 font-bold">
            Executive Driving Experience
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Schedule Your Autoverse Test Drive
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm max-w-xl mx-auto">
            Choose your vehicle, select an authorized showroom in Lucknow, and secure your dedicated 60-minute driving appointment with zero waiting.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Progress Stepper Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-sm">
          <div className="flex justify-between items-center relative">
            {stepsList.map((s, idx) => (
              <div key={s.num} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                    currentStep === s.num
                      ? 'bg-red-600 text-white ring-4 ring-red-100'
                      : currentStep > s.num
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {currentStep > s.num ? '✓' : s.num}
                </div>
                <span className={`text-[10px] mt-1 font-semibold hidden sm:block ${
                  currentStep === s.num ? 'text-red-600 font-bold' : 'text-gray-500'
                }`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Container Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8">
          
          {bookingError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* STEP 1: SELECT MODEL & VARIANT */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Step 1: Choose Vehicle Model</h3>
                <p className="text-xs text-gray-500 mt-1">Select the model you would like to test drive in Lucknow.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cars.map((c) => {
                  const isSelected = selectedModel?._id === c._id;
                  return (
                    <button
                      key={c._id}
                      onClick={() => {
                        setSelectedModel(c);
                        if (c.variants?.length > 0) setSelectedVariant(c.variants[0]);
                      }}
                      className={`text-left p-4 rounded-xl border transition flex items-center space-x-4 ${
                        isSelected
                          ? 'border-red-600 bg-red-50/40 ring-2 ring-red-500/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={c.heroImage} alt={c.name} className="w-20 h-14 object-cover rounded-md" />
                      <div className="flex-1">
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase font-semibold">
                          {c.bodyType}
                        </span>
                        <h4 className="font-bold text-base text-gray-900 mt-1">{c.name}</h4>
                        <span className="text-xs text-gray-500">From ₹{(c.startingPrice / 100000).toFixed(2)} Lakh</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Variant selection */}
              {selectedModel && selectedModel.variants?.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Choose Equipment Variant:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.variants.map((v: any) => (
                      <button
                        key={v._id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 text-xs rounded-lg border font-semibold transition ${
                          selectedVariant?._id === v._id
                            ? 'bg-black text-white border-black'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {v.name} ({v.fuelType} • {v.transmission})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  disabled={!selectedModel}
                  onClick={() => setCurrentStep(2)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <span>Proceed to Showroom</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT SHOWROOM */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Step 2: Select Dealership Showroom</h3>
                <p className="text-xs text-gray-500 mt-1">Choose which Lucknow authorized facility you will visit.</p>
              </div>

              <div className="space-y-3">
                {showrooms.map((s) => {
                  const isSelected = selectedShowroom?._id === s._id;
                  return (
                    <button
                      key={s._id}
                      onClick={() => setSelectedShowroom(s)}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-start space-x-4 ${
                        isSelected
                          ? 'border-red-600 bg-red-50/40 ring-2 ring-red-500/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="p-2.5 bg-gray-100 rounded-lg text-gray-700 shrink-0">
                        <MapPin className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-base text-gray-900">{s.name}</h4>
                          <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                            Open {s.operatingHours?.open} - {s.operatingHours?.close}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{s.address}</p>
                        <p className="text-[11px] text-gray-400 mt-1">Phone: {s.phone}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!selectedShowroom}
                  onClick={() => setCurrentStep(3)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <span>Select Demo Car</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT DEMO VEHICLE */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Step 3: Select Dedicated Demo Vehicle</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Active test-drive fleet stationed at {selectedShowroom?.name}.
                </p>
              </div>

              {demoVehicles.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
                  <Car className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">No active demo cars currently available at this showroom for {selectedModel?.name}. Please pick another showroom.</p>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="mt-3 text-xs bg-gray-800 text-white px-3 py-1.5 rounded"
                  >
                    Change Showroom
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {demoVehicles.map((demo) => {
                    const isSelected = selectedDemoVehicle?._id === demo._id;
                    return (
                      <button
                        key={demo._id}
                        onClick={() => setSelectedDemoVehicle(demo)}
                        className={`text-left p-4 rounded-xl border transition ${
                          isSelected
                            ? 'border-red-600 bg-red-50/40 ring-2 ring-red-500/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5 rounded">
                              {demo.registrationNumber}
                            </span>
                            <h4 className="font-bold text-sm text-gray-900 mt-2">
                              {demo.color}
                            </h4>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-red-600" />}
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          <span>{demo.fuelType} • {demo.transmission}</span>
                          {demo.notes && <p className="text-[11px] text-gray-500 mt-1 italic">{demo.notes}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!selectedDemoVehicle}
                  onClick={() => setCurrentStep(4)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <span>Select Date</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SELECT DATE */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Step 4: Select Preferred Date</h3>
                <p className="text-xs text-gray-500 mt-1">Bookings are accepted up to 14 days in advance.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Test Drive Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-64 p-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!selectedDate}
                  onClick={() => setCurrentStep(5)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center space-x-1.5"
                >
                  <span>Check Available Time Slots</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SELECT TIME SLOT */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Step 5: Select Time Slot</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Availability for demo vehicle {selectedDemoVehicle?.registrationNumber} on {new Date(selectedDate).toLocaleDateString()}.
                </p>
              </div>

              {loadingSlots ? (
                <div className="py-8 text-center">
                  <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs text-gray-500">Checking slot reservations in database...</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-xs text-gray-500">No slots configured for this date.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableSlots.map((item, idx) => {
                    const isSelected = selectedSlot === item.slot;
                    return (
                      <button
                        key={idx}
                        disabled={!item.isAvailable}
                        onClick={() => setSelectedSlot(item.slot)}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition ${
                          !item.isAvailable
                            ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-red-600 bg-red-50/50 ring-2 ring-red-500/20'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Clock className={`w-4 h-4 ${isSelected ? 'text-red-600' : 'text-gray-400'}`} />
                          <span className={`text-xs font-semibold ${isSelected ? 'text-red-900 font-bold' : 'text-gray-800'}`}>
                            {item.slot}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {item.isAvailable ? 'Available' : 'Reserved'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!selectedSlot}
                  onClick={() => setCurrentStep(6)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <span>Enter Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: BUYER DETAILS & DPDP CONSENT */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Step 6: Customer Information & Consent</h3>
                <p className="text-xs text-gray-500 mt-1">
                  We will send your unique reference voucher and coordinate your sales consultant over SMS & Email.
                </p>
              </div>

              {/* Booking Summary Box */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Vehicle</span>
                  <span className="font-bold text-gray-900">{selectedModel?.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Showroom</span>
                  <span className="font-bold text-gray-900">{selectedShowroom?.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Date</span>
                  <span className="font-bold text-gray-900">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Time Slot</span>
                  <span className="font-bold text-red-600">{selectedSlot}</span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number (10 Digits)</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      placeholder="9876543210"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      placeholder="name@email.com"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Special Driving Requests (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Would like to test ADAS emergency braking on Shaheed Path."
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                {/* DPDP Consent Checkbox */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="flex items-start space-x-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                    />
                    <span>
                      I provide explicit consent under the Digital Personal Data Protection (DPDP) Act for Autoverse Dealership to record my details, retain pricing snapshots, and dispatch booking updates.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={submitting || !customerName || !customerPhone || !customerEmail || !consentGiven}
                  onClick={handleConfirmBooking}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-7 py-3 rounded-lg text-sm flex items-center space-x-2 shadow-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Reserving Slot Atomically...' : 'Confirm Test Drive'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: CONFIRMATION RECEIPT */}
          {currentStep === 7 && confirmedBooking && (
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 block">
                  Reservation Confirmed & Slot Locked
                </span>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  Your Test Drive Is Booked!
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Reference Code: <strong className="font-mono text-gray-900 text-sm">{confirmedBooking.bookingReference}</strong>
                </p>
              </div>

              {/* Confirmation Details Card */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-left max-w-lg mx-auto space-y-3 text-xs">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-bold text-gray-900">{confirmedBooking.customerName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Model & Variant</span>
                  <span className="font-bold text-gray-900">{selectedModel?.name} ({selectedVariant?.name})</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Showroom Facility</span>
                  <span className="font-bold text-gray-900">{selectedShowroom?.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Scheduled Date & Time</span>
                  <span className="font-bold text-red-600">{new Date(confirmedBooking.bookingDate).toLocaleDateString()} • {confirmedBooking.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Notification Dispatch</span>
                  <span className="font-semibold text-emerald-700">Simulated SMS & Email Dispatched</span>
                </div>
              </div>

              <div className="flex justify-center space-x-4 pt-4">
                <Link
                  to="/dashboard/buyer"
                  className="bg-black hover:bg-gray-800 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition"
                >
                  View in My Garage Dashboard
                </Link>
                <Link
                  to="/"
                  className="border border-gray-300 text-gray-700 font-semibold text-xs px-5 py-2.5 rounded-lg transition hover:bg-gray-50"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

