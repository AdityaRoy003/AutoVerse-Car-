import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  Shield,
  Fuel,
  Gauge,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Info,
  Sliders,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Layers,
} from 'lucide-react';

export const CarDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [car, setCar] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pricing engine state
  const [pricingBreakdown, setPricingBreakdown] = useState<any>(null);
  const [pricingAvailable, setPricingAvailable] = useState<boolean>(true);
  const [pricingMessage, setPricingMessage] = useState<string>('');
  const [pricingLoading, setPricingLoading] = useState(false);

  // EMI Calculator state
  const [loanTenure, setLoanTenure] = useState<number>(60); // 5 years
  const [interestRate, setInterestRate] = useState<number>(9.5); // 9.5% per annum
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // 20% down
  const [emiDetails, setEmiDetails] = useState<any>(null);

  // Enquiry modal state
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [tradeInModalOpen, setTradeInModalOpen] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [tradeInSuccess, setTradeInSuccess] = useState(false);

  // Enquiry form data
  const [enquiryName, setEnquiryName] = useState(user?.name || '');
  const [enquiryPhone, setEnquiryPhone] = useState(user?.phone || '');
  const [enquiryEmail, setEnquiryEmail] = useState(user?.email || '');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryConsent, setEnquiryConsent] = useState(true);
  const [enquiryMarketing, setEnquiryMarketing] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  // Trade-in form data
  const [tradeInModel, setTradeInModel] = useState('');
  const [tradeInYear, setTradeInYear] = useState('2020');
  const [tradeInKm, setTradeInKm] = useState('45000');
  const [tradeInFuel, setTradeInFuel] = useState('Petrol');
  const [tradeInCondition, setTradeInCondition] = useState('Good');
  const [tradeInSubmitting, setTradeInSubmitting] = useState(false);

  // 1. Initial Load of Car and Cities
  useEffect(() => {
    async function init() {
      if (!slug) return;
      try {
        const [carRes, citiesRes] = await Promise.all([
          api.getCarBySlug(slug),
          api.getCities(),
        ]);

        if (carRes.success && carRes.car) {
          setCar(carRes.car);
          if (carRes.car.variants && carRes.car.variants.length > 0) {
            setSelectedVariant(carRes.car.variants[0]);
          }
        }

        if (citiesRes.success && citiesRes.cities) {
          setCities(citiesRes.cities);
          // Default to Lucknow
          const lucknow = citiesRes.cities.find((c: any) => c.name.toLowerCase().includes('lucknow')) || citiesRes.cities[0];
          setSelectedCity(lucknow);
        }
      } catch (err) {
        console.error('Failed to load car details:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [slug]);

  // 2. City-Wise On-Road Price Calculation Trigger
  useEffect(() => {
    async function calculatePricing() {
      if (!selectedVariant || !selectedCity) return;
      setPricingLoading(true);
      try {
        const res = await api.getOnRoadPrice(selectedVariant._id, selectedCity._id);
        if (res.success && res.available && res.pricing) {
          setPricingBreakdown(res.pricing);
          setPricingAvailable(true);
          setPricingMessage('');
        } else {
          setPricingBreakdown(null);
          setPricingAvailable(false);
          setPricingMessage(res.message || 'Price currently unavailable. Contact dealership for the latest quotation.');
        }
      } catch (err) {
        setPricingAvailable(false);
        setPricingMessage('Price currently unavailable. Contact dealership for the latest quotation.');
      } finally {
        setPricingLoading(false);
      }
    }

    calculatePricing();
  }, [selectedVariant, selectedCity]);

  // 3. EMI Real-Time Calculation
  useEffect(() => {
    if (!selectedVariant) return;

    const basePrice = pricingBreakdown?.totalOnRoadPrice || selectedVariant.exShowroomPrice;
    const downPayment = Math.round(basePrice * (downPaymentPercent / 100));
    const principal = Math.max(0, basePrice - downPayment);

    if (principal <= 0) {
      setEmiDetails({
        monthlyEmi: 0,
        totalInterest: 0,
        totalRepayment: 0,
        principal: 0,
        downPayment,
      });
      return;
    }

    const r = interestRate / 12 / 100;
    const n = loanTenure;
    const factor = Math.pow(1 + r, n);
    const monthlyEmi = Math.round((principal * r * factor) / (factor - 1));
    const totalRepayment = monthlyEmi * n;
    const totalInterest = totalRepayment - principal;

    setEmiDetails({
      monthlyEmi,
      totalInterest,
      totalRepayment,
      principal,
      downPayment,
      totalCost: downPayment + totalRepayment,
    });
  }, [selectedVariant, pricingBreakdown, loanTenure, interestRate, downPaymentPercent]);

  // Handle Enquiry Submit
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryConsent) {
      setEnquiryError('Customer consent under DPDP is required to process enquiry.');
      return;
    }
    setEnquirySubmitting(true);
    setEnquiryError(null);
    try {
      const res = await api.submitLead({
        customerName: enquiryName,
        customerPhone: enquiryPhone,
        customerEmail: enquiryEmail,
        interestedModelId: car._id,
        interestedVariantId: selectedVariant?._id,
        preferredShowroom: user?.assignedShowroom || undefined,
        message: enquiryMessage || `Enquired for ${car.name} (${selectedVariant?.name}) in ${selectedCity?.name}.`,
        consentGiven: true,
        marketingOptIn: enquiryMarketing,
        leadSource: 'Website',
      });

      if (res.success) {
        setEnquirySuccess(true);
      } else {
        setEnquiryError(res.message || 'Failed to submit enquiry.');
      }
    } catch (err: any) {
      setEnquiryError(err.message || 'Server error occurred.');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  // Handle Trade-in Submit
  const handleTradeInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTradeInSubmitting(true);
    try {
      const res = await api.submitTradeIn({
        customerName: enquiryName || user?.name || 'Customer',
        customerPhone: enquiryPhone || user?.phone || '9876543210',
        customerEmail: enquiryEmail || user?.email || 'customer@example.com',
        currentVehicleModel: tradeInModel,
        manufacturingYear: Number(tradeInYear),
        kilometres: Number(tradeInKm),
        fuelType: tradeInFuel,
        condition: tradeInCondition,
        interestedNewModelId: car._id,
        consentGiven: true,
      });

      if (res.success) {
        setTradeInSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTradeInSubmitting(false);
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
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500 font-medium">Loading vehicle specifications & pricing tables...</span>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
        <Car className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Vehicle Not Found</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6">The requested car model is currently not in our catalog.</p>
        <Link to="/cars" className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const images = car.images && car.images.length > 0 ? car.images : [car.heroImage];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Breadcrumb Header */}
      <div className="bg-[#121212] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/cars" className="hover:text-white transition">New Cars</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-red-400 font-medium">{car.name}</span>
          </div>
          <span className="text-xs text-gray-400 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded">
            Authorised Lucknow Stock
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: Gallery, Variants, Specs */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. VEHICLE GALLERY */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="relative h-80 sm:h-[420px] bg-gray-900">
                <img
                  src={images[activeImageIndex]}
                  alt={car.name}
                  className="w-full h-full object-cover transition duration-300"
                />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded">
                  {car.bodyType}
                </div>
                {car.safetyRating && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow">
                    ★ {car.safetyRating} Star Bharat NCAP Safety
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-3 bg-gray-50 border-t border-gray-200 flex space-x-3 overflow-x-auto">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-md overflow-hidden border-2 shrink-0 transition ${
                        activeImageIndex === idx ? 'border-red-600 ring-2 ring-red-400/50' : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. VARIANT SELECTOR */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Select Vehicle Variant</h3>
                  <p className="text-xs text-gray-500">Ex-showroom pricing updates based on variant equipment level</p>
                </div>
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded">
                  {car.variants?.length || 0} Variants Configured
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {car.variants?.map((v: any) => {
                  const isSelected = selectedVariant?._id === v._id;
                  return (
                    <button
                      key={v._id}
                      onClick={() => setSelectedVariant(v)}
                      className={`text-left p-4 rounded-xl border transition ${
                        isSelected
                          ? 'border-red-600 bg-red-50/40 ring-2 ring-red-500/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-gray-400 font-mono block uppercase">
                            Stock Code: {v.code}
                          </span>
                          <span className="font-bold text-base text-gray-900 mt-0.5 block">
                            {v.name}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0" />}
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-gray-600 mt-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">{v.fuelType}</span>
                        <span>•</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">{v.transmission}</span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">Ex-Showroom</span>
                        <span className="text-sm font-black text-gray-900">
                          {formatCurrency(v.exShowroomPrice)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Variant Equipment Badges */}
              {selectedVariant && selectedVariant.keyFeatures?.length > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-700 block mb-2">Variant Standard Highlights:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVariant.keyFeatures.map((f: string, i: number) => (
                      <span key={i} className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. TECHNICAL SPECIFICATIONS & SAFETY */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Engine & Technical Specifications</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Engine</span>
                  <span className="font-semibold text-gray-800 text-sm mt-0.5 block">{car.specifications?.engine}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Displacement</span>
                  <span className="font-semibold text-gray-800 text-sm mt-0.5 block">{car.specifications?.displacementCc} cc</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Max Power</span>
                  <span className="font-semibold text-gray-800 text-sm mt-0.5 block">{car.specifications?.maxPower}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Max Torque</span>
                  <span className="font-semibold text-gray-800 text-sm mt-0.5 block">{car.specifications?.maxTorque}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">ARAI Mileage</span>
                  <span className="font-semibold text-gray-800 text-sm mt-0.5 block">{car.specifications?.mileageKmpl} km/l</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Boot Space</span>
                  <span className="font-semibold text-gray-800 text-sm mt-0.5 block">{car.specifications?.bootSpaceLiters} Liters</span>
                </div>
              </div>

              {/* Safety Features */}
              {car.safetyFeatures?.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-2.5 flex items-center space-x-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Active & Passive Safety Architecture</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                    {car.safetyFeatures.map((s: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {car.availableColors?.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                    Available Factory Finishes:
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {car.availableColors.map((col: any, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 shadow-inner"
                          style={{ backgroundColor: col.hexCode }}
                        />
                        <span className="text-xs font-medium text-gray-700">{col.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ON-ROAD PRICE ENGINE & EMI CALCULATOR */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* CARD 1: CITY-WISE ON-ROAD PRICING ENGINE */}
            <div className="bg-white rounded-2xl border-2 border-red-500/20 shadow-md p-6 overflow-hidden relative">
              <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">
                    Official Pricing Engine
                  </span>
                  <h3 className="text-xl font-black text-gray-900 mt-1">
                    On-Road Quotation
                  </h3>
                  <p className="text-xs text-gray-500">Calculated strictly from MongoDB RTO tables</p>
                </div>

                {/* City Selector */}
                <div className="w-36">
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">City Region</label>
                  <select
                    value={selectedCity?._id || ''}
                    onChange={(e) => {
                      const found = cities.find((c) => c._id === e.target.value);
                      if (found) setSelectedCity(found);
                    }}
                    className="w-full py-1.5 px-2 bg-gray-50 border border-gray-300 rounded-md text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {cities.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.rtoCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Calculation Output */}
              {pricingLoading || (!pricingBreakdown && pricingAvailable) ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <span className="text-xs text-gray-500">Calculating regional RTO slab for {selectedCity?.name || 'Lucknow'}...</span>
                </div>
              ) : !pricingAvailable ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-2">
                  <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
                  <p className="text-xs font-semibold text-amber-800">
                    {pricingMessage}
                  </p>
                  <button
                    onClick={() => setEnquiryModalOpen(true)}
                    className="mt-2 text-xs bg-amber-600 text-white font-semibold px-4 py-2 rounded hover:bg-amber-700 transition"
                  >
                    Request Manual Dealership Quotation
                  </button>
                </div>
              ) : pricingBreakdown ? (
                <div className="space-y-4">
                  {/* Total Headline */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-baseline">
                    <div>
                      <span className="text-xs text-gray-500 block">Total Indicative On-Road Price:</span>
                      <span className="text-3xl font-black text-gray-900 tracking-tight">
                        {formatCurrency(pricingBreakdown.totalOnRoadPrice)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {selectedCity?.name} RTO
                    </span>
                  </div>

                  {/* Component Breakdown Accordion / List */}
                  <div className="space-y-2 text-xs border border-gray-200 rounded-xl p-3.5 bg-white">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Ex-Showroom Price</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(pricingBreakdown.exShowroomPrice)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">
                        RTO Road Tax ({pricingBreakdown.roadTaxRatePercent}%)
                      </span>
                      <span className="font-semibold text-gray-900">{formatCurrency(pricingBreakdown.roadTaxAmount)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Comprehensive Insurance (1+3 Yr)</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(pricingBreakdown.insuranceAmount)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">RTO Registration & Fastag Charges</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(pricingBreakdown.registrationCharges)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Mandatory Basic Accessories Kit</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(pricingBreakdown.accessoriesAmount)}</span>
                    </div>
                    {(pricingBreakdown.otherCharges || 0) > 0 && (
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-600">Green Cess & Logistics</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(pricingBreakdown.otherCharges)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 text-sm font-bold text-red-600">
                      <span>Total Net Price</span>
                      <span>{formatCurrency(pricingBreakdown.totalOnRoadPrice)}</span>
                    </div>
                  </div>

                  {/* Pricing Meta & Disclaimer */}
                  <div className="text-[11px] text-gray-500 space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span>Tariff Valid Until: {pricingBreakdown.validUntil ? new Date(pricingBreakdown.validUntil).toLocaleDateString() : 'N/A'}</span>
                      <span>Updated: {pricingBreakdown.lastUpdated ? new Date(pricingBreakdown.lastUpdated).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <p className="italic text-[10px] text-gray-400 leading-tight">
                      * {pricingBreakdown.disclaimer || 'Prices are indicative and subject to change. Please confirm the final quotation with the dealership.'}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-5 mt-5 border-t border-gray-100">
                <Link
                  to={`/book-test-drive?model=${car._id}&variant=${selectedVariant?._id}`}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-3 rounded-lg text-xs text-center transition flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Test Drive</span>
                </Link>

                <button
                  onClick={() => setEnquiryModalOpen(true)}
                  className="bg-gray-900 hover:bg-black text-white font-semibold py-3 px-3 rounded-lg text-xs text-center transition flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <span>Enquire for Booking</span>
                </button>
              </div>

              {/* Trade-in Trigger */}
              <button
                onClick={() => setTradeInModalOpen(true)}
                className="w-full mt-3 text-center text-xs font-semibold text-gray-700 hover:text-red-600 py-1.5 border border-dashed border-gray-300 rounded-md transition"
              >
                Have an existing car to exchange? Request Trade-In Valuation →
              </button>
            </div>

            {/* CARD 2: INTERACTIVE EMI CALCULATOR */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-base text-gray-900">EMI & Finance Estimator</h3>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                  Reducing Balance
                </span>
              </div>

              {/* Tenure Selection */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                  <span>Loan Tenure</span>
                  <span className="text-red-600 font-bold">{loanTenure} Months ({loanTenure / 12} Years)</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[36, 48, 60, 84].map((m) => (
                    <button
                      key={m}
                      onClick={() => setLoanTenure(m)}
                      className={`py-1.5 text-xs font-semibold rounded-md border transition ${
                        loanTenure === m
                          ? 'bg-black text-white border-black'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {m / 12} Yrs ({m}m)
                    </button>
                  ))}
                </div>
              </div>

              {/* Down Payment Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                  <span>Down Payment ({downPaymentPercent}%)</span>
                  <span className="text-gray-900 font-bold">{formatCurrency(emiDetails?.downPayment || 0)}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              {/* Interest Rate Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                  <span>Interest Rate</span>
                  <span className="text-gray-900 font-bold">{interestRate}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="7.5"
                  max="14.0"
                  step="0.25"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              {/* Output Result */}
              {emiDetails && (
                <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 space-y-2 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-700">Estimated Monthly EMI:</span>
                    <span className="text-2xl font-black text-red-600">
                      {formatCurrency(emiDetails.monthlyEmi)}<span className="text-xs font-normal text-gray-500">/mo</span>
                    </span>
                  </div>
                  <div className="pt-2 border-t border-red-100/60 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                    <div>Principal: {formatCurrency(emiDetails.principal)}</div>
                    <div>Total Interest: {formatCurrency(emiDetails.totalInterest)}</div>
                  </div>
                  <p className="text-[10px] text-gray-400 italic pt-1">
                    Indicative calculation. Final loan rate depends on financier credit rating.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ENQUIRY MODAL */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Enquire for {car.name}</h3>
                <p className="text-xs text-gray-500">Selected: {selectedVariant?.name} in {selectedCity?.name}</p>
              </div>
              <button onClick={() => setEnquiryModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            {enquirySuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-gray-900">Enquiry Submitted Successfully</h4>
                <p className="text-xs text-gray-600 max-w-xs mx-auto">
                  Our dedicated automotive consultant in Lucknow has received your request and will reach out within 5 minutes.
                </p>
                <button
                  onClick={() => { setEnquiryModalOpen(false); setEnquirySuccess(false); }}
                  className="bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-3">
                {enquiryError && (
                  <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                    {enquiryError}
                  </div>
                )}

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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Specific Query / Purchase Timeline</label>
                  <textarea
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    rows={2}
                    placeholder="e.g. Planning to purchase within 30 days. Looking for finance options."
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <label className="flex items-start space-x-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enquiryConsent}
                      onChange={(e) => setEnquiryConsent(e.target.checked)}
                      className="mt-0.5 rounded text-red-600"
                    />
                    <span>
                      I explicitly consent to data processing for vehicle quotation and test-drive management under DPDP regulations.
                    </span>
                  </label>

                  <label className="flex items-start space-x-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enquiryMarketing}
                      onChange={(e) => setEnquiryMarketing(e.target.checked)}
                      className="mt-0.5 rounded text-red-600"
                    />
                    <span>Receive periodic WhatsApp updates regarding festive discounts.</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={enquirySubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg text-sm transition mt-2"
                >
                  {enquirySubmitting ? 'Routing to Consultant...' : 'Submit Enquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TRADE-IN MODAL */}
      {tradeInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Exchange / Trade-In Valuation</h3>
                <p className="text-xs text-gray-500">Upgrade to a new {car.name} with certified exchange bonus</p>
              </div>
              <button onClick={() => setTradeInModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            {tradeInSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-gray-900">Valuation Request Registered</h4>
                <p className="text-xs text-gray-600 max-w-xs mx-auto">
                  Our certified used-car evaluation desk will coordinate an ultrasonic paint & mechanical inspection at your doorstep or nearest Lucknow workshop.
                </p>
                <button
                  onClick={() => { setTradeInModalOpen(false); setTradeInSuccess(false); }}
                  className="bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleTradeInSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current Vehicle Make & Model</label>
                  <input
                    type="text"
                    value={tradeInModel}
                    onChange={(e) => setTradeInModel(e.target.value)}
                    required
                    placeholder="e.g. 2019 Maruti Swift VXi"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Year</label>
                    <input
                      type="number"
                      value={tradeInYear}
                      onChange={(e) => setTradeInYear(e.target.value)}
                      required
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Kilometres</label>
                    <input
                      type="number"
                      value={tradeInKm}
                      onChange={(e) => setTradeInKm(e.target.value)}
                      required
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Fuel</label>
                    <select
                      value={tradeInFuel}
                      onChange={(e) => setTradeInFuel(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Overall Condition</label>
                    <select
                      value={tradeInCondition}
                      onChange={(e) => setTradeInCondition(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Needs Work">Needs Work</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={tradeInSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg text-sm transition mt-2"
                >
                  {tradeInSubmitting ? 'Submitting...' : 'Request Inspection & Valuation'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

