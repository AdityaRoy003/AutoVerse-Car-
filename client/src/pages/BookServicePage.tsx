import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Wrench,
  MapPin,
  Calendar,
  Clock,
  Car,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Truck,
  FileText,
  Printer,
  Sparkles,
} from 'lucide-react';

interface WorkshopItem {
  _id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  baysCount: number;
}

interface SlotBayInfo {
  slot: string;
  totalBays: number;
  bookedBays: number;
  baysLeft: number;
  isAvailable: boolean;
}

const SERVICE_PACKAGES = [
  {
    id: 'Periodic Maintenance',
    name: 'Periodic Maintenance',
    duration: '2.5 Hours',
    estimate: 4500,
    description: 'Complete multi-point safety inspection, synthetic engine oil & filter replacement, brake inspection, fluid top-up and exterior jet wash.',
    badge: 'Most Popular',
  },
  {
    id: 'Express 90-Min Service',
    name: 'Express 90-Min Service',
    duration: '90 Minutes',
    estimate: 3200,
    description: 'Dual-technician high-velocity bay service for routine oil change, tire pressure balancing, and essential electrical diagnostics.',
    badge: 'Quick Turnaround',
  },
  {
    id: 'Running Repairs & Diagnostics',
    name: 'Running Repairs & Diagnostics',
    duration: '3.0 Hours',
    estimate: 2800,
    description: 'Comprehensive computerised OBD-II scanner diagnostics, suspension test, noise troubleshooting, and error code clearance.',
    badge: 'Expert Diagnostics',
  },
  {
    id: 'AC Sterilization & Filter',
    name: 'AC Sterilization & Filter',
    duration: '1.5 Hours',
    estimate: 2400,
    description: 'Cabin air disinfectant ultrasonic misting, condenser coil pressure wash, and HEPA PM2.5 pollen filter replacement.',
    badge: 'Seasonal Essential',
  },
  {
    id: 'EV Battery Health Check',
    name: 'EV Battery Health Check',
    duration: '2.0 Hours',
    estimate: 3800,
    description: 'High-voltage traction pack diagnostics, thermal management system fluid top-up, regenerative braking check, and cell balance report.',
    badge: 'Electric & Hybrid',
  },
  {
    id: 'Body & Paint Ultrasound',
    name: 'Body & Paint Ultrasound',
    duration: '4.0 Hours',
    estimate: 6500,
    description: 'Laser-guided chassis alignment analysis, computerized paint thickness profiling, dent appraisal, and ceramic coating touch-up.',
    badge: 'Body Shop',
  },
];

export const BookServicePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [workshops, setWorkshops] = useState<WorkshopItem[]>([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);

  // Selections
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopItem | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<typeof SERVICE_PACKAGES[0]>(SERVICE_PACKAGES[0]);
  const [vehicleModel, setVehicleModel] = useState('Model H (Sedan)');
  const [registrationNumber, setRegistrationNumber] = useState('');
  
  // Date & Bay slots
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [baySlots, setBaySlots] = useState<SlotBayInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');

  // Doorstep concierge
  const [pickupDropRequired, setPickupDropRequired] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');

  // Customer Contact & Compliance
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load workshops on mount
  useEffect(() => {
    async function fetchWorkshops() {
      try {
        setLoadingWorkshops(true);
        const res = await api.getWorkshops();
        if (res.success && res.workshops) {
          setWorkshops(res.workshops);
          if (res.workshops.length > 0) {
            setSelectedWorkshop(res.workshops[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load workshops:', err);
      } finally {
        setLoadingWorkshops(false);
      }
    }
    fetchWorkshops();
  }, []);

  // Fetch slot bay availability when workshop or date changes
  useEffect(() => {
    if (!selectedWorkshop || !selectedDate) return;
    async function fetchSlots() {
      try {
        setLoadingSlots(true);
        const res = await api.getAvailableServiceSlots(selectedWorkshop!._id, selectedDate);
        if (res.success && res.slots) {
          setBaySlots(res.slots);
          // auto-select first available slot if current selected is unavailable
          const firstAvail = res.slots.find((s: SlotBayInfo) => s.isAvailable);
          if (firstAvail && (!selectedSlot || !res.slots.some((s: SlotBayInfo) => s.slot === selectedSlot && s.isAvailable))) {
            setSelectedSlot(firstAvail.slot);
          }
        }
      } catch (err) {
        console.error('Failed to query service slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedWorkshop, selectedDate]);

  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!selectedWorkshop) {
        setErrorMsg('Please select an authorized service workshop.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!registrationNumber.trim()) {
        setErrorMsg('Please provide your vehicle registration number (e.g. UP 32 AB 1234).');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedDate || !selectedSlot) {
        setErrorMsg('Please select a service date and an available workshop bay slot.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setErrorMsg('Please complete all contact details.');
      return;
    }

    if (!consentGiven) {
      setErrorMsg('Consent under the Digital Personal Data Protection Act 2023 is mandatory.');
      return;
    }

    if (pickupDropRequired && !pickupAddress.trim()) {
      setErrorMsg('Please enter your pickup location address in Lucknow.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        workshopId: selectedWorkshop!._id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        vehicleRegistrationNumber: registrationNumber.trim().toUpperCase(),
        vehicleModel,
        serviceType: selectedPackage.id,
        bookingDate: selectedDate,
        timeSlot: selectedSlot,
        pickupDropRequired,
        pickupAddress: pickupDropRequired ? pickupAddress.trim() : undefined,
        notes: notes.trim() || undefined,
        consentGiven: true,
      };

      const res = await api.createServiceBooking(payload);
      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        setCurrentStep(5);
      } else {
        setErrorMsg(res.message || 'Failed to confirm service booking. Please try another slot.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred while scheduling service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-brand-red text-xs font-semibold uppercase tracking-wider mb-3">
            <Wrench className="w-4 h-4" />
            40 Certified Workshop Bays Across Lucknow
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-serif">
            Express Service & Workshop Booking
          </h1>
          <p className="mt-2 text-base text-neutral-600 max-w-2xl mx-auto">
            Book an authorized maintenance bay in under 60 seconds with real-time bay allocation, zero wait time, and transparent upfront pricing.
          </p>
        </div>

        {/* Progress Bar (Steps 1 to 4) */}
        {currentStep < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-neutral-500 mb-2">
              <span className={currentStep >= 1 ? 'text-brand-red font-semibold' : ''}>1. Workshop</span>
              <span className={currentStep >= 2 ? 'text-brand-red font-semibold' : ''}>2. Service & Car</span>
              <span className={currentStep >= 3 ? 'text-brand-red font-semibold' : ''}>3. Bay Slot</span>
              <span className={currentStep >= 4 ? 'text-brand-red font-semibold' : ''}>4. Confirm</span>
            </div>
            <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-red h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to proceed</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Step 1: Select Workshop */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-red" />
              Select Authorized Service Centre
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              Our 2 Lucknow state-of-the-art facilities offer diagnostic rigs, genuine OEM spares, and high-velocity lifts.
            </p>

            {loadingWorkshops ? (
              <div className="py-12 text-center text-neutral-400">Loading service centres...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workshops.map((w) => {
                  const isSelected = selectedWorkshop?._id === w._id;
                  return (
                    <div
                      key={w._id}
                      onClick={() => setSelectedWorkshop(w)}
                      className={`cursor-pointer rounded-xl p-5 border-2 transition-all ${
                        isSelected
                          ? 'border-brand-red bg-red-50/20 shadow-md ring-2 ring-brand-red/20'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-neutral-100 text-neutral-700 mb-2">
                            {w.code}
                          </span>
                          <h3 className="font-bold text-neutral-900 text-lg">{w.name}</h3>
                          <p className="text-xs text-neutral-600 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-neutral-400" />
                            {w.address}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">Direct: {w.phone}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                            {w.baysCount} Active Bays
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center gap-2 px-6 py-3"
              >
                Continue to Service Options
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Service Package & Vehicle Identification */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-brand-red" />
              Select Service Package & Vehicle
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              Choose from standardized factory-approved maintenance programs with fixed upfront pricing.
            </p>

            {/* Service Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {SERVICE_PACKAGES.map((pkg) => {
                const isSelected = selectedPackage.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`cursor-pointer rounded-xl p-5 border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-red bg-red-50/20 shadow-md ring-2 ring-brand-red/20'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-neutral-100 text-neutral-800">
                          {pkg.badge}
                        </span>
                        <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {pkg.duration}
                        </span>
                      </div>
                      <h3 className="font-bold text-neutral-900 text-base">{pkg.name}</h3>
                      <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{pkg.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Estimated from</span>
                      <span className="text-base font-extrabold text-neutral-900">
                        ₹{pkg.estimate.toLocaleString('en-IN')}*
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vehicle Details */}
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="font-bold text-neutral-900 text-base mb-4 flex items-center gap-2">
                <Car className="w-4 h-4 text-brand-red" />
                Vehicle Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Model
                  </label>
                  <select
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                  >
                    <option value="Model H (Sedan)">Brand X - Model H (Executive Sedan)</option>
                    <option value="Model C (Compact SUV)">Brand X - Model C (Urban SUV)</option>
                    <option value="Model S (Hatchback)">Brand X - Model S (Smart Hatchback)</option>
                    <option value="Model E (Electric)">Brand X - Model E (EV Cross)</option>
                    <option value="Other Brand X Model">Other Brand X Variant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Registration Plate Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UP 32 AB 1234"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 text-sm uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                  <span className="text-[11px] text-neutral-400 mt-0.5 block">
                    Used to retrieve service history & dispatch dedicated genuine parts.
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-secondary flex items-center gap-1.5 px-4 py-2.5 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center gap-2 px-6 py-3"
              >
                Select Bay & Date
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Date & Real-Time Bay Slot Matrix */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-red" />
              Select Date & Available Bay Slot
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              Our live booking system queries the active workshop bays at {selectedWorkshop?.name}. Your car is allocated a dedicated lift upon confirmation.
            </p>

            {/* Date Picker */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Appointment Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-neutral-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            {/* Slots with Bay Occupancy Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Workshop Bay Capacity ({selectedWorkshop?.baysCount} Total Bays)
                </span>
                <span className="text-xs text-neutral-500">Real-time availability</span>
              </div>

              {loadingSlots ? (
                <div className="py-8 text-center text-neutral-400">Checking bay availability...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {baySlots.map((s) => {
                    const isSelected = selectedSlot === s.slot;
                    return (
                      <button
                        key={s.slot}
                        type="button"
                        disabled={!s.isAvailable}
                        onClick={() => setSelectedSlot(s.slot)}
                        className={`text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                          !s.isAvailable
                            ? 'opacity-40 bg-neutral-100 border-neutral-200 cursor-not-allowed'
                            : isSelected
                            ? 'border-brand-red bg-red-50/30 ring-2 ring-brand-red/20 shadow-sm'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-neutral-500" />
                            <span className="font-semibold text-neutral-900 text-sm">{s.slot}</span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-1">
                            {s.isAvailable ? (
                              <span className="text-emerald-700 font-medium">
                                {s.baysLeft} of {s.totalBays} bays open
                              </span>
                            ) : (
                              <span className="text-red-600 font-medium">All bays occupied</span>
                            )}
                          </p>
                        </div>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            s.baysLeft > 5
                              ? 'bg-emerald-500'
                              : s.baysLeft > 0
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Optional Doorstep Concierge Pickup */}
            <div className="rounded-xl p-4 bg-neutral-50 border border-neutral-200 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pickupDropRequired}
                  onChange={(e) => setPickupDropRequired(e.target.checked)}
                  className="w-4 h-4 text-brand-red rounded border-neutral-300 focus:ring-brand-red"
                />
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-red" />
                  <span className="text-sm font-semibold text-neutral-900">
                    Complimentary Doorstep Pickup & Drop within Lucknow
                  </span>
                </div>
              </label>

              {pickupDropRequired && (
                <div className="mt-3 pl-7">
                  <input
                    type="text"
                    required
                    placeholder="Enter pickup address, landmark, and pin code in Lucknow..."
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red bg-white"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Our verified dealership driver will arrive 45 minutes prior to the scheduled slot with digital job card handover.
                  </span>
                </div>
              )}
            </div>

            {/* Step 3 Actions */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn-secondary flex items-center gap-1.5 px-4 py-2.5 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center gap-2 px-6 py-3"
              >
                Provide Contact Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Contact Details & DPDP Compliance Consent */}
        {currentStep === 4 && (
          <form onSubmit={handleSubmitBooking} className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-red" />
              Owner Information & Booking Confirmation
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              Review your appointment summary and provide contact details for SMS and WhatsApp gate pass delivery.
            </p>

            {/* Summary Card */}
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 mb-6 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-xs text-neutral-500 block">Workshop</span>
                  <span className="font-semibold text-neutral-900">{selectedWorkshop?.name}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">Service Package</span>
                  <span className="font-semibold text-neutral-900">{selectedPackage.name}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">Vehicle</span>
                  <span className="font-semibold text-neutral-900">{registrationNumber}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">Slot & Date</span>
                  <span className="font-semibold text-neutral-900">{selectedDate} ({selectedSlot})</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Verma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Specific Concerns or Observations (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Slight vibration during braking above 60 km/h, check wiper blades..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            {/* DPDP Act 2023 Consent Checkbox */}
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="w-4 h-4 text-brand-red rounded border-neutral-300 mt-1 focus:ring-brand-red"
                />
                <span className="text-xs text-neutral-600 leading-relaxed">
                  I hereby provide my explicit consent under the{' '}
                  <strong className="text-neutral-900">Digital Personal Data Protection (DPDP) Act 2023</strong>{' '}
                  for Autoverse Dealership to process my contact number, email, and vehicle registration data for workshop scheduling, digital job cards, and automated service status notifications via WhatsApp/SMS.
                </span>
              </label>
            </div>

            {/* Step 4 Actions */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-secondary flex items-center gap-1.5 px-4 py-2.5 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-2 px-8 py-3 text-base shadow-lg"
              >
                {submitting ? (
                  <span>Reserving Bay...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm Bay Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 5: Digital Service Voucher Confirmation */}
        {currentStep === 5 && confirmedBooking && (
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
            {/* Voucher Header Banner */}
            <div className="bg-neutral-950 text-white p-6 sm:p-8 relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Booking Confirmed & Bay Allocated
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
                    Autoverse Official Service Voucher
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Present this voucher or quote Reference ID upon vehicle check-in.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-400 block uppercase">Booking Reference</span>
                  <span className="text-xl sm:text-2xl font-mono font-bold text-brand-red">
                    {confirmedBooking.bookingReference}
                  </span>
                </div>
              </div>
            </div>

            {/* Voucher Body Details */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div>
                  <span className="text-xs text-neutral-500 block uppercase">Workshop Bay</span>
                  <span className="text-lg font-extrabold text-neutral-900 text-emerald-600">
                    Bay #{confirmedBooking.assignedBayNumber}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block uppercase">Date & Time</span>
                  <span className="text-sm font-bold text-neutral-900 block">
                    {confirmedBooking.bookingDate}
                  </span>
                  <span className="text-xs text-neutral-600">{confirmedBooking.timeSlot}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block uppercase">Vehicle Reg Plate</span>
                  <span className="text-sm font-mono font-bold text-neutral-900">
                    {confirmedBooking.vehicleRegistrationNumber}
                  </span>
                  <span className="text-xs text-neutral-600 block">{confirmedBooking.vehicleModel}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block uppercase">Service Advisor</span>
                  <span className="text-sm font-bold text-neutral-900 block">
                    {confirmedBooking.serviceAdvisorName}
                  </span>
                  <span className="text-xs text-neutral-600">Dedicated Technical Lead</span>
                </div>
              </div>

              {/* Service Inclusions */}
              <div className="border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-neutral-900 text-sm">
                    Package: {confirmedBooking.serviceType}
                  </h4>
                  <span className="text-base font-extrabold text-neutral-900">
                    Estimated ₹{confirmedBooking.estimatedCost?.toLocaleString('en-IN')}
                  </span>
                </div>
                <ul className="text-xs text-neutral-600 space-y-1.5 list-disc list-inside">
                  <li>Computerised 30-point diagnostics and OEM electronic scan</li>
                  <li>Genuine OEM spare parts with official 6-month / 10,000 km warranty</li>
                  <li>Complimentary foam wash, cabin vacuuming, and battery health report</li>
                  {confirmedBooking.pickupDropRequired && (
                    <li className="text-brand-red font-semibold">
                      Doorstep driver assigned for pickup at: {confirmedBooking.pickupAddress}
                    </li>
                  )}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save Voucher (PDF)
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    to="/buyer-dashboard"
                    className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm text-center"
                  >
                    View in My Dashboard
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookServicePage;

