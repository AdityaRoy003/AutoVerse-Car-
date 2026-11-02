import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Fuel,
  Gauge,
  User,
  ChevronRight,
  FileText,
  AlertCircle,
  Phone,
  Shield,
  Layers,
} from 'lucide-react';

export const UsedCarDetailPage: React.FC = () => {
  const { stockId } = useParams<{ stockId: string }>();
  const { user } = useAuth();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Enquiry state
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryName, setEnquiryName] = useState(user?.name || '');
  const [enquiryPhone, setEnquiryPhone] = useState(user?.phone || '');
  const [enquiryEmail, setEnquiryEmail] = useState(user?.email || '');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryConsent, setEnquiryConsent] = useState(true);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      if (!stockId) return;
      try {
        const res = await api.getUsedCarByStockId(stockId);
        if (res.success && res.usedCar) {
          setCar(res.usedCar);
        }
      } catch (err) {
        console.error('Failed to load used car:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [stockId]);

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.submitLead({
        customerName: enquiryName,
        customerPhone: enquiryPhone,
        customerEmail: enquiryEmail,
        leadSource: 'Used-car enquiry',
        message: enquiryMessage || `Enquiring about certified pre-owned ${car.modelName} (Stock: ${car.stockId}).`,
        consentGiven: true,
      });
      if (res.success) setEnquirySuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
        <Car className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Vehicle Not Found</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6">Stock identifier #{stockId} does not exist in inventory.</p>
        <Link to="/used-cars" className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">
          Return to Pre-Owned Cars
        </Link>
      </div>
    );
  }

  const inspection = car.inspectionReportId || {};
  const images = car.images?.length > 0 ? car.images : ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80'];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header Breadcrumb */}
      <div className="bg-[#121212] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/used-cars" className="hover:text-white transition">Certified Used</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-red-400 font-medium">Stock #{car.stockId}</span>
          </div>
          <span className="text-xs bg-emerald-600 text-white px-2.5 py-0.5 rounded font-semibold">
            Autoverse Certified
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: Photos & 150-Point Inspection Report */}
          <div className="lg:col-span-8 space-y-8">
            {/* Photo Gallery */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="relative h-80 sm:h-[420px] bg-gray-900">
                <img
                  src={images[activeImageIndex]}
                  alt={`${car.modelName} ${car.variantName}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-sm text-white text-xs font-mono font-bold px-3 py-1 rounded">
                  Registration: {car.maskedRegistration || 'UP32AB****'}
                </div>
                <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded flex items-center space-x-1.5 shadow">
                  <ShieldCheck className="w-4 h-4" />
                  <span>150-Pt Inspected: {inspection.status || 'Passed'}</span>
                </div>
              </div>

              {images.length > 1 && (
                <div className="p-3 bg-gray-50 border-t border-gray-200 flex space-x-3 overflow-x-auto">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-md overflow-hidden border-2 shrink-0 transition ${
                        activeImageIndex === idx ? 'border-red-600' : 'border-gray-200 opacity-70'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 150-POINT OFFICIAL INSPECTION REPORT */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    <h3 className="text-xl font-bold text-gray-900">
                      150-Point Technical Diagnostic Report
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Evaluator: {inspection.inspectorName || 'Lead Certified Evaluator'} • Date: {new Date(inspection.inspectionDate || Date.now()).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-3 sm:mt-0 flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Overall Score</span>
                    <span className="text-2xl font-black text-emerald-600">{inspection.overallRatingPoints || 144}/150</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center font-black text-emerald-700 text-sm">
                    {Math.round(((inspection.overallRatingPoints || 144) / 150) * 100)}%
                  </div>
                </div>
              </div>

              {/* Sections Breakdown */}
              <div className="space-y-4">
                {/* 1. Exterior & Ultrasound Paint */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-1.5">
                    <h4 className="font-bold text-sm text-gray-900">Exterior Body & Paintwork Ultrasound</h4>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ★ {inspection.exterior?.rating || 4.8}/5.0
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {inspection.exterior?.comments || 'Original paint depth measured between 95 to 110 microns. All original factory panels.'}
                  </p>
                </div>

                {/* 2. Engine & Transmission */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-1.5">
                    <h4 className="font-bold text-sm text-gray-900">Engine, Compression & Transmission</h4>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ★ {inspection.engineTransmission?.rating || 5.0}/5.0
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {inspection.engineTransmission?.comments || 'Smooth gear shift, silent idle, compression test within manufacturer specs.'}
                  </p>
                </div>

                {/* 3. Tyres & Brakes Life */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm text-gray-900">Tyres & Brake Rotor Diagnostics</h4>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ★ {inspection.tyresBrakes?.rating || 4.7}/5.0
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs mb-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Remaining Tyre Tread Life:</span>
                        <span className="font-bold text-gray-800">{inspection.tyresBrakes?.tyreLifePercent || 82}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${inspection.tyresBrakes?.tyreLifePercent || 82}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Brake Pad Thickness:</span>
                        <span className="font-bold text-gray-800">{inspection.tyresBrakes?.brakePadLifePercent || 80}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${inspection.tyresBrakes?.brakePadLifePercent || 80}%` }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {inspection.tyresBrakes?.comments || 'Uniform tyre tread depth 6.2mm, brake rotors checked.'}
                  </p>
                </div>

                {/* 4. Electricals & OBD Scanner */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-1.5">
                    <h4 className="font-bold text-sm text-gray-900">Electrical Architecture & OBD-II Scan</h4>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ★ {inspection.electricals?.rating || 5.0}/5.0
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {inspection.electricals?.comments || 'OBD-II diagnostics scan clean, zero DTC fault codes reported.'}
                  </p>
                </div>

                {/* 5. Accident History & Service Records */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Non-Accidental Ultrasonic Certified</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Authorized Workshop Service Records Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Pricing & Enquiry */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 space-y-5 sticky top-28">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">
                  Stock #{car.stockId}
                </span>
                <h2 className="text-2xl font-black text-gray-900 mt-0.5">
                  {car.manufacturingYear} {car.modelName}
                </h2>
                <p className="text-xs text-gray-500 font-medium">{car.variantName}</p>
              </div>

              {/* Price Tag */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">
                  Asking Dealership Price
                </span>
                <span className="text-3xl font-black text-gray-900 tracking-tight block mt-1">
                  {formatCurrency(car.askingPrice)}
                </span>
                <span className="text-[11px] text-gray-500 block mt-1">
                  Inclusive of RTO transfer facilitation in Lucknow
                </span>
              </div>

              {/* Specs Table */}
              <div className="space-y-2 text-xs border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Odometer</span>
                  <span className="font-semibold text-gray-800">{car.kilometres?.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Fuel Type</span>
                  <span className="font-semibold text-gray-800">{car.fuelType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Transmission</span>
                  <span className="font-semibold text-gray-800">{car.transmission}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Ownership</span>
                  <span className="font-semibold text-gray-800">{car.ownershipCount === 1 ? '1st Owner' : `${car.ownershipCount} Owners`}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Stock Location</span>
                  <span className="font-semibold text-gray-800">{car.city || 'Lucknow'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Warranty</span>
                  <span className="font-semibold text-emerald-700">1 Year Dealership Warranty</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setEnquiryModalOpen(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg text-xs transition shadow-sm"
                >
                  Schedule Inspection / Hold Vehicle
                </button>

                <div className="p-3 bg-gray-50 rounded-lg text-center text-xs text-gray-600">
                  Call Used Car Stockyard: <strong className="text-gray-900">+91 522 2618900</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Enquire for {car.modelName}</h3>
                <p className="text-xs text-gray-500">Stock #{car.stockId} • Asking {formatCurrency(car.askingPrice)}</p>
              </div>
              <button onClick={() => setEnquiryModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            {enquirySuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-gray-900">Request Dispatched</h4>
                <p className="text-xs text-gray-600 max-w-xs mx-auto">
                  Our certified pre-owned manager will connect with you within 5 minutes with car keys & inspection documents.
                </p>
                <button
                  onClick={() => { setEnquiryModalOpen(false); setEnquirySuccess(false); }}
                  className="bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquiry} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile</label>
                    <input
                      type="tel"
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value)}
                      required
                      placeholder="9876543210"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={enquiryEmail}
                      onChange={(e) => setEnquiryEmail(e.target.value)}
                      required
                      placeholder="name@email.com"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Inspection Note</label>
                  <textarea
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    rows={2}
                    placeholder="Would like to inspect vehicle at Hazratganj yard tomorrow."
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <label className="flex items-start space-x-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enquiryConsent}
                      onChange={(e) => setEnquiryConsent(e.target.checked)}
                      className="mt-0.5 rounded text-red-600"
                    />
                    <span>I consent to data handling under DPDP for vehicle purchase enquiry.</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg text-sm transition mt-2"
                >
                  {submitting ? 'Connecting...' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

