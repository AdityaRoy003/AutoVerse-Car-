import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Car,
  DollarSign,
  MapPin,
  Calendar,
  Users,
  FileSpreadsheet,
  History,
  TrendingUp,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Upload,
  Wrench,
  Download,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'cars' | 'services' | 'dms' | 'leads' | 'users' | 'audit'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [pricingList, setPricingList] = useState<any[]>([]);
  const [carsList, setCarsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // DMS export state
  const [dmsDate, setDmsDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dmsExporting, setDmsExporting] = useState(false);

  // AI Used Car Valuation Modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModel, setAiModel] = useState('Model H');
  const [aiYear, setAiYear] = useState(2023);
  const [aiKm, setAiKm] = useState(32000);
  const [aiFuel, setAiFuel] = useState('Petrol');
  const [aiTrans, setAiTrans] = useState('Manual');
  const [aiOwners, setAiOwners] = useState(1);
  const [aiConditionScore, setAiConditionScore] = useState(92);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // CSV Import Modal state
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any>(null);
  const [csvImportResult, setCsvImportResult] = useState<any>(null);
  const [csvLoading, setCsvLoading] = useState(false);

  // New Car Modal state
  const [newCarModalOpen, setNewCarModalOpen] = useState(false);
  const [newCarName, setNewCarName] = useState('');
  const [newCarSlug, setNewCarSlug] = useState('');
  const [newCarTagline, setNewCarTagline] = useState('');
  const [newCarBodyType, setNewCarBodyType] = useState('SUV');
  const [newCarStartingPrice, setNewCarStartingPrice] = useState(1200000);
  const [newCarHeroImage, setNewCarHeroImage] = useState('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80');

  // New Pricing Modal state
  const [newPricingModalOpen, setNewPricingModalOpen] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [priceExShowroom, setPriceExShowroom] = useState(1245000);
  const [priceRoadTaxPercent, setPriceRoadTaxPercent] = useState(10);
  const [priceInsurance, setPriceInsurance] = useState(48000);
  const [priceAccessories, setPriceAccessories] = useState(15000);
  const [priceValidUntil, setPriceValidUntil] = useState('2027-12-31');

  // Load Dashboard Data
  const loadAdminData = async () => {
    try {
      const [dashRes, pricingRes, carsRes, usersRes, auditRes, citiesRes, servicesRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getAllPricing(),
        api.getCars({ limit: 50 }),
        api.getAdminUsers(),
        api.getAuditLogs({ limit: 30 }),
        api.getCities(),
        api.getAllServiceBookings(),
      ]);

      if (dashRes.success) setStats(dashRes.stats);
      if (pricingRes.success) setPricingList(pricingRes.pricing || []);
      if (carsRes.success) setCarsList(carsRes.cars || []);
      if (usersRes.success) setUsersList(usersRes.users || []);
      if (auditRes.success) setAuditLogs(auditRes.logs || []);
      if (citiesRes.success) setCities(citiesRes.cities || []);
      if (servicesRes.success) setServicesList(servicesRes.bookings || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateServiceStatus = async (id: string, newStatus: string) => {
    try {
      const res = await api.updateServiceBookingStatus(id, newStatus);
      if (res.success) {
        setServicesList((prev) =>
          prev.map((s) => (s._id === id ? { ...s, status: newStatus } : s))
        );
      }
    } catch (err) {
      console.error('Failed to update service status:', err);
    }
  };

  const handleCalculateAiPriceBand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAiLoading(true);
      const res = await api.suggestUsedCarPrice({
        modelName: aiModel,
        manufacturingYear: Number(aiYear),
        kilometres: Number(aiKm),
        fuelType: aiFuel,
        transmission: aiTrans,
        ownershipCount: Number(aiOwners),
        conditionScore: Number(aiConditionScore),
      });
      if (res.success && res.priceBand) {
        setAiResult(res.priceBand);
      }
    } catch (err) {
      console.error('AI price suggestion error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDownloadDmsSales = async () => {
    try {
      setDmsExporting(true);
      await api.downloadDmsSalesCsv(dmsDate);
    } catch (err) {
      console.error('Error downloading sales CSV:', err);
    } finally {
      setDmsExporting(false);
    }
  };

  const handleDownloadDmsService = async () => {
    try {
      setDmsExporting(true);
      await api.downloadDmsServiceCsv(dmsDate);
    } catch (err) {
      console.error('Error downloading service CSV:', err);
    } finally {
      setDmsExporting(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handle CSV File Select & Preview
  const handleCSVSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setCsvLoading(true);
    setCsvPreview(null);
    setCsvImportResult(null);

    try {
      const res = await api.importCSVLeads(file, true);
      if (res.success && res.preview) {
        setCsvPreview(res.preview);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCsvLoading(false);
    }
  };

  // Execute CSV Import
  const handleExecuteCSVImport = async () => {
    if (!csvFile) return;
    setCsvLoading(true);
    try {
      const res = await api.importCSVLeads(csvFile, false);
      if (res.success) {
        setCsvImportResult(res.result);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCsvLoading(false);
    }
  };

  // Create New Car
  const handleCreateCar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createCarModel({
        name: newCarName,
        slug: newCarSlug.toLowerCase() || newCarName.toLowerCase().replace(/\s+/g, '-'),
        tagline: newCarTagline,
        bodyType: newCarBodyType,
        startingPrice: Number(newCarStartingPrice),
        heroImage: newCarHeroImage,
        images: [newCarHeroImage],
        featured: true,
      });
      if (res.success) {
        setNewCarModalOpen(false);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create New Pricing Rule
  const handleCreatePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createPricing({
        carVariantId: selectedVariantId,
        cityId: selectedCityId,
        exShowroomPrice: Number(priceExShowroom),
        roadTaxRatePercent: Number(priceRoadTaxPercent),
        insuranceAmount: Number(priceInsurance),
        accessoriesAmount: Number(priceAccessories),
        registrationCharges: 1500,
        otherCharges: 2500,
        validFrom: new Date(),
        validUntil: new Date(priceValidUntil),
        isActive: true,
        auditNotes: 'Created via Administrator Pricing Studio',
      });
      if (res.success) {
        setNewPricingModalOpen(false);
        loadAdminData();
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

  // Chart data
  const leadStatusData = stats?.leads ? [
    { name: 'New', count: stats.leads.new, fill: '#3B82F6' },
    { name: 'Contacted', count: stats.leads.contacted, fill: '#10B981' },
    { name: 'Qualified', count: stats.leads.qualified, fill: '#8B5CF6' },
    { name: 'Converted', count: stats.leads.converted, fill: '#EC4899' },
    { name: 'Overdue', count: stats.leads.overdue, fill: '#EF4444' },
  ] : [];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Admin Studio Header */}
      <div className="bg-[#121212] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Dealership Executive Administration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Autoverse Operations & Governance Studio
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Authorized Dealership Head Office: Lucknow, Uttar Pradesh (340 Active Personnel)
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={() => setCsvModalOpen(true)}
              className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Portal Leads CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-6 flex space-x-2 border-b border-gray-800 text-xs overflow-x-auto">
          {[
            { id: 'overview', label: 'Analytics Overview', icon: TrendingUp },
            { id: 'pricing', label: 'City Pricing Engine', icon: DollarSign },
            { id: 'cars', label: 'Catalog & Inventory', icon: Car },
            { id: 'services', label: 'Workshop Bays & Services', icon: Wrench },
            { id: 'dms', label: 'Daily DMS CSV Exports', icon: Download },
            { id: 'users', label: 'Consultant Roster', icon: Users },
            { id: 'audit', label: 'Audit Trail Logs', icon: History },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`pb-3 px-4 font-semibold flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition ${
                  isActive
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* TAB 1: ANALYTICS OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-xs font-semibold text-gray-400 uppercase">Total Inquiries</span>
                <span className="text-3xl font-black text-gray-900 mt-1 block">{stats?.leads?.total || 0}</span>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                  {stats?.leads?.conversionRatePercent || 0}% Conversion Rate
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-xs font-semibold text-gray-400 uppercase">Test Drives Confirmed</span>
                <span className="text-3xl font-black text-gray-900 mt-1 block">{stats?.bookings?.confirmed || 0}</span>
                <span className="text-[11px] text-gray-500 block mt-1">
                  Across 3 Lucknow Showrooms
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-xs font-semibold text-gray-400 uppercase">Avg Response Time</span>
                <span className="text-3xl font-black text-gray-900 mt-1 block">
                  {stats?.leads?.avgResponseMinutes || 3.5} <span className="text-sm font-normal text-gray-500">mins</span>
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                  Target: &lt; 5.0 mins SLA
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm bg-red-50/20">
                <span className="text-xs font-bold text-red-600 uppercase">Active Overdue Leads</span>
                <span className="text-3xl font-black text-red-600 mt-1 block">{stats?.leads?.overdue || 0}</span>
                <span className="text-[11px] text-red-500 block mt-1">Requires immediate follow-up</span>
              </div>
            </div>

            {/* Recharts Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-base text-gray-900 mb-4">Lead Pipeline by Status</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadStatusData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-gray-900">Inventory Distribution</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-semibold text-gray-700">New Car Models</span>
                    <span className="font-bold text-gray-900 text-sm">{stats?.inventory?.carModels || 4} Models</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-semibold text-gray-700">Variants Configured</span>
                    <span className="font-bold text-gray-900 text-sm">{stats?.inventory?.variants || 8} Variants</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-semibold text-gray-700">Certified Pre-Owned Cars</span>
                    <span className="font-bold text-gray-900 text-sm">{stats?.inventory?.certifiedUsedCars || 8} Cars</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-semibold text-gray-700">Showroom Demo Fleet</span>
                    <span className="font-bold text-gray-900 text-sm">{stats?.inventory?.demoVehicles || 6} Demo Cars</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CITY-WISE PRICING MANAGEMENT */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">City-Wise On-Road Pricing Rules</h3>
                <p className="text-xs text-gray-500">
                  Every on-road price displayed to customers is strictly computed from these active database tariffs.
                </p>
              </div>
              <button
                onClick={() => setNewPricingModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Pricing Record</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="p-4">Variant Code</th>
                      <th className="p-4">City</th>
                      <th className="p-4">Ex-Showroom</th>
                      <th className="p-4">Road Tax Rate</th>
                      <th className="p-4">Insurance</th>
                      <th className="p-4">Validity</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pricingList.map((pr) => {
                      const isExpired = new Date(pr.validUntil).getTime() < Date.now();
                      return (
                        <tr key={pr._id} className="hover:bg-gray-50 transition">
                          <td className="p-4 font-mono font-bold text-gray-900">
                            {pr.carVariantId?.code || 'N/A'}
                            <span className="block text-[10px] text-gray-500 font-normal">
                              {pr.carVariantId?.name}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-gray-800">
                            {pr.cityId?.name} ({pr.cityId?.state})
                          </td>
                          <td className="p-4 font-mono font-bold text-gray-900">
                            {formatCurrency(pr.exShowroomPrice)}
                          </td>
                          <td className="p-4 text-gray-700">
                            {pr.roadTaxRatePercent}% + {formatCurrency(pr.roadTaxFixed || 0)}
                          </td>
                          <td className="p-4 text-gray-700">
                            {formatCurrency(pr.insuranceAmount)}
                          </td>
                          <td className="p-4 text-gray-500">
                            Until {new Date(pr.validUntil).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            {isExpired ? (
                              <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                Expired
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                Active
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CARS CATALOG */}
        {activeTab === 'cars' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Vehicle Models Catalog</h3>
                <p className="text-xs text-gray-500">Manage models, specifications, variants, and colors</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAiModalOpen(true)}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>AI Used-Car Price Band</span>
                </button>
                <button
                  onClick={() => setNewCarModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Car Model</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {carsList.map((car) => (
                <div key={car._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <img src={car.heroImage} alt={car.name} className="w-full h-36 object-cover" />
                    <div className="p-4">
                      <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {car.bodyType}
                      </span>
                      <h4 className="font-bold text-base text-gray-900 mt-1">{car.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{car.tagline}</p>
                      <div className="mt-3 text-xs font-semibold text-gray-900">
                        From {formatCurrency(car.startingPrice)}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs">
                    <span className="text-gray-500">{car.variantCount || car.variants?.length || 1} Variants</span>
                    <Link to={`/cars/${car.slug}`} className="text-red-600 font-semibold hover:underline">
                      View Page →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3.5: WORKSHOP BAYS & SERVICES */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Workshop Bays & Service Appointments</h3>
                <p className="text-xs text-gray-500">Live bay occupancy across Amausi (16 bays) & Transport Nagar (24 bays)</p>
              </div>
              <Link
                to="/book-service"
                className="bg-brand-red hover:bg-red-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Service Appointment</span>
              </Link>
            </div>

            {/* Bay Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-semibold uppercase block">Amausi Workshop</span>
                <span className="text-2xl font-black text-gray-900 mt-1 block">16 Active Bays</span>
                <span className="text-xs text-emerald-600 font-medium">Kanpur Highway Facility</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-semibold uppercase block">Transport Nagar Mega Hub</span>
                <span className="text-2xl font-black text-gray-900 mt-1 block">24 Active Bays</span>
                <span className="text-xs text-emerald-600 font-medium">Central Express Workshop</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-semibold uppercase block">Scheduled Today</span>
                <span className="text-2xl font-black text-brand-red mt-1 block">{servicesList.length} Appointments</span>
                <span className="text-xs text-gray-500 font-medium">Capacity Utilized</span>
              </div>
            </div>

            {/* Service Bookings Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Vehicle Plate</th>
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Bay & Slot</th>
                    <th className="p-4">Service Package</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {servicesList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        No service bookings found.
                      </td>
                    </tr>
                  ) : (
                    servicesList.map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50">
                        <td className="p-4 font-mono font-bold text-gray-900">
                          {s.bookingReference}
                        </td>
                        <td className="p-4 font-mono font-semibold text-neutral-800">
                          {s.vehicleRegistrationNumber}
                          <span className="block text-[10px] text-gray-400 font-normal">{s.vehicleModel}</span>
                        </td>
                        <td className="p-4 text-gray-700">
                          <span className="font-semibold block">{s.customerName}</span>
                          <span className="text-gray-400 font-mono text-[11px]">{s.customerPhone}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-emerald-700 block">Bay #{s.assignedBayNumber}</span>
                          <span className="text-gray-500 text-[11px]">{s.bookingDate} ({s.timeSlot})</span>
                        </td>
                        <td className="p-4 text-gray-800 font-medium">
                          {s.serviceType}
                          {s.pickupDropRequired && (
                            <span className="block text-[10px] text-brand-red font-semibold">Pickup Requested</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-gray-900">
                          ₹{s.estimatedCost?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            s.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'IN_SERVICE'
                              ? 'bg-blue-100 text-blue-800'
                              : s.status === 'COMPLETED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {s.status === 'CONFIRMED' ? (
                            <button
                              onClick={() => handleUpdateServiceStatus(s._id, 'IN_SERVICE')}
                              className="text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-2 py-1 rounded"
                            >
                              Check-In Bay
                            </button>
                          ) : s.status === 'IN_SERVICE' ? (
                            <button
                              onClick={() => handleUpdateServiceStatus(s._id, 'COMPLETED')}
                              className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold px-2 py-1 rounded"
                            >
                              Complete Job
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3.6: DAILY DMS CSV EXPORTS */}
        {activeTab === 'dms' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Daily DMS Integration CSV Exports</h3>
                <p className="text-xs text-gray-500">
                  Client Brief Specification: Direct DMS integration replaced with standardized daily CSV exports for sales billing and workshop job cards.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">Export Date:</span>
                <input
                  type="date"
                  value={dmsDate}
                  onChange={(e) => setDmsDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sales DMS Export */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                      Sales & Leads Intake
                    </span>
                    <h4 className="font-bold text-base text-gray-900 mt-2">DMS Sales Export CSV</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Exports web enquiries, portal imports, and test-drive reservations for Brand X sales management.
                    </p>
                  </div>
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                </div>

                <div className="bg-gray-50 rounded-xl p-3 text-[11px] font-mono text-gray-600 space-y-1">
                  <p><strong>Included Headers:</strong></p>
                  <p className="truncate">DMS_RECORD_REF, INTAKE_TYPE, CREATED_TIMESTAMP, CUSTOMER_NAME, CONTACT_PHONE, VEHICLE_MODEL, VARIANT_NAME, SHOWROOM_DEALERSHIP, ASSIGNED_OFFICER, WORKFLOW_STATUS, DPDP_CONSENT_VERIFIED</p>
                </div>

                <button
                  type="button"
                  disabled={dmsExporting}
                  onClick={handleDownloadDmsSales}
                  className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Sales DMS CSV ({dmsDate})</span>
                </button>
              </div>

              {/* Service Workshop DMS Export */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      Workshop 40-Bay Job Cards
                    </span>
                    <h4 className="font-bold text-base text-gray-900 mt-2">DMS Workshop Job Cards CSV</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Exports Amausi & Transport Nagar bay allocations, vehicle registration plates, service packages, and doorstep pickups.
                    </p>
                  </div>
                  <Wrench className="w-8 h-8 text-emerald-600" />
                </div>

                <div className="bg-gray-50 rounded-xl p-3 text-[11px] font-mono text-gray-600 space-y-1">
                  <p><strong>Included Headers:</strong></p>
                  <p className="truncate">DMS_JOB_CARD_REF, BOOKING_DATE, ALLOCATED_TIME_SLOT, VEHICLE_REGISTRATION_NO, VEHICLE_MODEL, WORKSHOP_NAME, BAY_NUMBER, CUSTOMER_NAME, SERVICE_TYPE, ESTIMATED_AMOUNT, DPDP_CONSENT_VERIFIED</p>
                </div>

                <button
                  type="button"
                  disabled={dmsExporting}
                  onClick={handleDownloadDmsService}
                  className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Service DMS CSV ({dmsDate})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: USERS / CONSULTANTS ROSTER */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Dealership Staff & User Roster</h3>
              <p className="text-xs text-gray-500">Sales consultants, model specializations, and assigned showrooms</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Staff Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Assigned Showroom</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-900">{u.name}</td>
                      <td className="p-4 text-gray-600 font-mono">{u.email}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'SALES_CONSULTANT' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">
                        {u.assignedShowroom?.name || 'All Facilities'}
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT TRAIL LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Chronological Audit Logs</h3>
              <p className="text-xs text-gray-500">Every pricing revision, user role adjustment, and lead action recorded</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Entity</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Target ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="p-4 font-mono text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-gray-900">{log.action}</td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-800 font-mono text-[10px] px-2 py-0.5 rounded">
                          {log.entityType}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">{log.userName || 'System'}</td>
                      <td className="p-4 font-mono text-gray-500 text-[10px]">{log.entityId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* CSV IMPORT MODAL */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-xl w-full p-6 space-y-5">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Import Portal Leads from CSV</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Automated validation, phone duplicate screening, and showroom workload assignment.
                </p>
              </div>
              <button onClick={() => setCsvModalOpen(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            {csvImportResult ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-gray-900">CSV Import Completed</h4>
                <div className="text-xs text-gray-600 max-w-sm mx-auto space-y-1">
                  <p><strong>{csvImportResult.successCount}</strong> leads successfully imported and auto-assigned.</p>
                  <p><strong>{csvImportResult.failureCount}</strong> duplicate or invalid rows skipped.</p>
                </div>
                <button
                  onClick={() => { setCsvModalOpen(false); setCsvImportResult(null); }}
                  className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg mt-3"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-center bg-gray-50">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVSelect}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                  <p className="text-[11px] text-gray-400 mt-2">
                    Headers supported: Name, Phone, Email, Model, Budget, Showroom
                  </p>
                </div>

                {csvLoading && (
                  <div className="text-center py-4 text-xs text-gray-500">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                    Validating CSV data...
                  </div>
                )}

                {csvPreview && (
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                      <span>Valid Rows Ready to Import: <strong>{csvPreview.validRows?.length || 0}</strong></span>
                      <span>Duplicates Detected: <strong>{csvPreview.duplicateRows?.length || 0}</strong></span>
                    </div>

                    {csvPreview.validRows?.length > 0 && (
                      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50 space-y-1">
                        {csvPreview.validRows.map((r: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-[11px] py-1 border-b border-gray-200/50">
                            <span className="font-semibold text-gray-800">{r.data.Name} ({r.data.Phone})</span>
                            <span className="text-gray-500">{r.data.Model || 'Any'} • {r.data.Showroom || 'Lucknow'}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={handleExecuteCSVImport}
                      disabled={csvLoading || csvPreview.validRows?.length === 0}
                      className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-lg text-xs transition"
                    >
                      Confirm and Auto-Assign {csvPreview.validRows?.length} Leads
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE CAR MODAL */}
      {newCarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Create New Car Model</h3>
              <button onClick={() => setNewCarModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateCar} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Model Name</label>
                <input
                  type="text"
                  value={newCarName}
                  onChange={(e) => setNewCarName(e.target.value)}
                  placeholder="e.g. Model X"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Body Type</label>
                  <select
                    value={newCarBodyType}
                    onChange={(e) => setNewCarBodyType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="EV">EV</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Starting Price (₹)</label>
                  <input
                    type="number"
                    value={newCarStartingPrice}
                    onChange={(e) => setNewCarStartingPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Tagline</label>
                <input
                  type="text"
                  value={newCarTagline}
                  onChange={(e) => setNewCarTagline(e.target.value)}
                  placeholder="e.g. Commanding Road Presence"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Photograph URL</label>
                <input
                  type="text"
                  value={newCarHeroImage}
                  onChange={(e) => setNewCarHeroImage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg mt-3"
              >
                Create Model
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PRICING MODAL */}
      {newPricingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Add City-Wise Pricing Record</h3>
              <button onClick={() => setNewPricingModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreatePricing} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select City Region</label>
                <select
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select City...</option>
                  {cities.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.state})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Target Variant</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Variant...</option>
                  {carsList.flatMap((c) => c.variants || []).map((v: any) => (
                    <option key={v._id} value={v._id}>{v.name} ({v.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Ex-Showroom (₹)</label>
                  <input
                    type="number"
                    value={priceExShowroom}
                    onChange={(e) => setPriceExShowroom(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Road Tax %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={priceRoadTaxPercent}
                    onChange={(e) => setPriceRoadTaxPercent(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Insurance (₹)</label>
                  <input
                    type="number"
                    value={priceInsurance}
                    onChange={(e) => setPriceInsurance(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Accessories (₹)</label>
                  <input
                    type="number"
                    value={priceAccessories}
                    onChange={(e) => setPriceAccessories(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Valid Until Date</label>
                <input
                  type="date"
                  value={priceValidUntil}
                  onChange={(e) => setPriceValidUntil(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg mt-3"
              >
                Save Official Pricing Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI USED-CAR VALUATION MODAL (Exclusively for Used-Car Manager / Admin) */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-100 text-amber-900 text-[10px] font-bold uppercase mb-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Used-Car Manager Internal Intelligence
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  AI Certified Used-Car Valuation Band
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Calibrated against Lucknow certified inventory transactions and market depreciation curves.
                </p>
              </div>
              <button
                onClick={() => {
                  setAiModalOpen(false);
                  setAiResult(null);
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCalculateAiPriceBand} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Model Name</label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="Model H">Brand X - Model H (Sedan)</option>
                    <option value="Model C">Brand X - Model C (SUV)</option>
                    <option value="Model S">Brand X - Model S (Hatchback)</option>
                    <option value="Model E">Brand X - Model E (EV Cross)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Manufacturing Year</label>
                  <input
                    type="number"
                    min={2015}
                    max={2026}
                    value={aiYear}
                    onChange={(e) => setAiYear(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Odometer (km)</label>
                  <input
                    type="number"
                    min={0}
                    value={aiKm}
                    onChange={(e) => setAiKm(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Ownership</label>
                  <select
                    value={aiOwners}
                    onChange={(e) => setAiOwners(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value={1}>1st Owner</option>
                    <option value={2}>2nd Owner</option>
                    <option value={3}>3rd+ Owner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Fuel Type</label>
                  <select
                    value={aiFuel}
                    onChange={(e) => setAiFuel(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Transmission</label>
                  <select
                    value={aiTrans}
                    onChange={(e) => setAiTrans(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="CVT">CVT</option>
                    <option value="DCT">DCT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Inspection Score (0-100)</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={aiConditionScore}
                    onChange={(e) => setAiConditionScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={aiLoading}
                className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <span>Querying Valuation Intelligence...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>Run AI Price Band Calculation</span>
                  </>
                )}
              </button>
            </form>

            {aiResult && (
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Suggested Retail Band</span>
                    <span className="text-lg font-black text-brand-red">
                      ₹{aiResult.suggestedMinPrice?.toLocaleString('en-IN')} – ₹{aiResult.suggestedMaxPrice?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Recommended Baseline</span>
                    <span className="text-lg font-black text-neutral-900">
                      ₹{aiResult.suggestedIdealPrice?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    Confidence: {Math.round((aiResult.confidence || 0.88) * 100)}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                    Demand: {aiResult.marketDemandIndex}
                  </span>
                  <span className="text-gray-500">
                    Comps: {aiResult.historicalDataPoints || 'Historical'} records
                  </span>
                </div>

                <p className="text-xs text-neutral-700 bg-white p-3 rounded-lg border border-neutral-200">
                  {aiResult.rationale}
                </p>

                <div className="text-[10px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-medium">
                  {aiResult.disclaimer}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
