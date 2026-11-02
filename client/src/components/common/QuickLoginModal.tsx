import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Shield, Briefcase, User, X, Check, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface QuickLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickLoginModal: React.FC<QuickLoginModalProps> = ({ isOpen, onClose }) => {
  const { user, quickLogin, login, register } = useAuth();
  const [tab, setTab] = useState<'quick' | 'login' | 'register'>('quick');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [consentGiven, setConsentGiven] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleQuickRole = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(role);
      onClose();
      if (role === 'ADMIN') navigate('/dashboard/admin');
      else if (role === 'SALES_CONSULTANT') navigate('/dashboard/consultant');
      else navigate('/dashboard/buyer');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      setError('Explicit consent under DPDP is required to register an account.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(name, email, password, phone, marketingOptIn);
      onClose();
      navigate('/dashboard/buyer');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#121212] text-white p-6 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-flex items-center space-x-1.5 text-xs text-red-400 font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autoverse Access Portal</span>
              </span>
              <h3 className="text-xl font-bold mt-1 text-white">Demonstration & Sign In</h3>
              <p className="text-xs text-gray-400 mt-1">
                Select a seeded demo account for immediate 1-click evaluation, or sign in with custom credentials.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 mt-5 border-b border-gray-800 pb-0">
            <button
              onClick={() => { setTab('quick'); setError(null); }}
              className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
                tab === 'quick' ? 'border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              ⚡ 1-Click Demo Roles
            </button>
            <button
              onClick={() => { setTab('login'); setError(null); }}
              className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
                tab === 'login' ? 'border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setError(null); }}
              className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
                tab === 'register' ? 'border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              New Buyer Register
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: QUICK 1-CLICK DEMO ROLES */}
          {tab === 'quick' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-500 mb-2">
                Click any persona below to authenticate automatically with seed credentials:
              </div>

              {/* Admin Persona */}
              <button
                onClick={() => handleQuickRole('ADMIN')}
                disabled={loading}
                className="w-full text-left p-4 rounded-lg border border-purple-200 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50 transition group flex items-center justify-between"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-purple-600 text-white rounded-lg group-hover:scale-105 transition">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-gray-900">Administrator</span>
                      <span className="text-[10px] bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded">
                        Full Dealership Control
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      admin@autoverse.demo • Manage catalog, city-wise pricing rules, showrooms, demo vehicles, and audit logs.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition shrink-0 ml-2" />
              </button>

              {/* Sales Consultant Persona */}
              <button
                onClick={() => handleQuickRole('SALES_CONSULTANT')}
                disabled={loading}
                className="w-full text-left p-4 rounded-lg border border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 transition group flex items-center justify-between"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-blue-600 text-white rounded-lg group-hover:scale-105 transition">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-gray-900">Sales Consultant (Rajesh Sharma)</span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded">
                        CRM & AI Intelligence
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      consultant@autoverse.demo • Assigned leads, 5-min countdown timers, AI buyer summaries, editable AI drafts.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition shrink-0 ml-2" />
              </button>

              {/* Buyer Persona */}
              <button
                onClick={() => handleQuickRole('BUYER')}
                disabled={loading}
                className="w-full text-left p-4 rounded-lg border border-emerald-200 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 transition group flex items-center justify-between"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-lg group-hover:scale-105 transition">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-gray-900">Verified Buyer (Aditya Srivastava)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded">
                        Customer Portal
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      buyer@autoverse.demo • View confirmed test-drive bookings, quotation history, and manage DPDP consent preferences.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition shrink-0 ml-2" />
              </button>
            </div>
          )}

          {/* TAB 2: MANUAL LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-md text-sm transition shadow-sm"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* DPDP Consent */}
              <div className="pt-2 border-t border-gray-200 space-y-2">
                <label className="flex items-start space-x-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                  />
                  <span>
                    I explicitly consent to data processing for vehicle quotation and test-drive management under DPDP regulations.
                  </span>
                </label>

                <label className="flex items-start space-x-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Receive WhatsApp updates for exclusive seasonal discounts and exchange bonus news.</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-md text-sm transition shadow-sm mt-3"
              >
                {loading ? 'Creating Account...' : 'Create Buyer Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

