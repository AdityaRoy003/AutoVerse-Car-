import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Car,
  Calendar,
  User,
  Shield,
  Briefcase,
  Menu,
  X,
  Globe,
  ChevronDown,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onOpenQuickLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickLogin }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      {/* Top micro bar for quick demo switch and dealer info */}
      <div className="bg-[#121212] text-gray-300 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-red-500 font-semibold tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse mr-1.5"></span>
            LUCKNOW AUTHORISED DEALERSHIP
          </span>
          <span className="hidden md:inline text-gray-500">|</span>
          <span className="hidden md:inline text-gray-400">3 Showrooms • 2 Mega Workshops • 150-Pt Certified Pre-Owned</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick Demo Switcher Button */}
          <button
            onClick={onOpenQuickLogin}
            className="flex items-center space-x-1.5 bg-red-600/90 hover:bg-red-600 text-white px-2.5 py-0.5 rounded text-[11px] font-medium transition shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span>Switch Demo Role</span>
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition px-2 py-0.5 rounded hover:bg-gray-800"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'English' : 'हिंदी'}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1 w-28 bg-[#1E1E1E] border border-gray-700 rounded shadow-xl py-1 z-50">
                <button
                  onClick={() => {
                    setLanguage('en');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-800 flex items-center justify-between ${
                    language === 'en' ? 'text-red-400 font-semibold' : 'text-gray-300'
                  }`}
                >
                  English {language === 'en' && '✓'}
                </button>
                <button
                  onClick={() => {
                    setLanguage('hi');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-800 flex items-center justify-between ${
                    language === 'hi' ? 'text-red-400 font-semibold' : 'text-gray-300'
                  }`}
                >
                  हिंदी {language === 'hi' && '✓'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded bg-[#121212] flex items-center justify-center text-white font-extrabold tracking-tighter group-hover:bg-red-600 transition">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-[#121212] font-mono">
              AUTO<span className="text-red-600">VERSE</span>
            </span>
            <span className="block text-[10px] tracking-widest uppercase text-gray-500 font-medium -mt-1">
              Lucknow Premier Dealership
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-8 text-sm font-medium">
          <Link
            to="/"
            className={`transition ${isActive('/') ? 'text-red-600 font-semibold' : 'text-gray-700 hover:text-black'}`}
          >
            {t('navHome')}
          </Link>
          <Link
            to="/cars"
            className={`transition ${isActive('/cars') ? 'text-red-600 font-semibold' : 'text-gray-700 hover:text-black'}`}
          >
            {t('navNewCars')}
          </Link>
          <Link
            to="/used-cars"
            className={`transition ${isActive('/used-cars') ? 'text-red-600 font-semibold' : 'text-gray-700 hover:text-black'}`}
          >
            {t('navUsedCars')}
          </Link>
          <Link
            to="/offers"
            className={`transition ${isActive('/offers') ? 'text-red-600 font-semibold' : 'text-gray-700 hover:text-black'}`}
          >
            {t('navOffers')}
          </Link>
          <Link
            to="/book-service"
            className={`transition ${isActive('/book-service') ? 'text-red-600 font-semibold' : 'text-gray-700 hover:text-black'}`}
          >
            {t('navBookService')}
          </Link>
          <Link
            to="/about"
            className={`transition ${isActive('/about') ? 'text-red-600 font-semibold' : 'text-gray-700 hover:text-black'}`}
          >
            {t('navAbout')}
          </Link>
        </div>

        {/* Right CTA & Account Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/book-test-drive"
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-md shadow-sm transition"
          >
            <Calendar className="w-4 h-4" />
            <span>{t('navBookTestDrive')}</span>
          </Link>

          {/* User Status / Role Pill */}
          {user ? (
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
              <Link
                to={
                  user.role === 'ADMIN'
                    ? '/dashboard/admin'
                    : user.role === 'SALES_CONSULTANT'
                    ? '/dashboard/consultant'
                    : '/dashboard/buyer'
                }
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md transition text-xs font-semibold text-gray-800"
              >
                {user.role === 'ADMIN' ? (
                  <Shield className="w-4 h-4 text-purple-600" />
                ) : user.role === 'SALES_CONSULTANT' ? (
                  <Briefcase className="w-4 h-4 text-blue-600" />
                ) : (
                  <User className="w-4 h-4 text-emerald-600" />
                )}
                <div className="text-left">
                  <span className="block truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                  <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-normal">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </Link>

              <button
                onClick={logout}
                title="Sign out"
                className="text-gray-400 hover:text-red-600 transition p-1.5"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenQuickLogin}
              className="flex items-center space-x-1.5 text-sm font-medium text-gray-700 hover:text-black px-3 py-2 rounded transition"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('navLogin')}</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-black rounded"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-gray-800 hover:text-red-600 border-b border-gray-100"
            >
              {t('navHome')}
            </Link>
            <Link
              to="/cars"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-gray-800 hover:text-red-600 border-b border-gray-100"
            >
              {t('navNewCars')}
            </Link>
            <Link
              to="/used-cars"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-gray-800 hover:text-red-600 border-b border-gray-100"
            >
              {t('navUsedCars')}
            </Link>
            <Link
              to="/offers"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-gray-800 hover:text-red-600 border-b border-gray-100"
            >
              {t('navOffers')}
            </Link>
            <Link
              to="/book-service"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-gray-800 hover:text-red-600 border-b border-gray-100"
            >
              {t('navBookService')}
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-gray-800 hover:text-red-600 border-b border-gray-100"
            >
              {t('navAbout')}
            </Link>

            {user && (
              <Link
                to={
                  user.role === 'ADMIN'
                    ? '/dashboard/admin'
                    : user.role === 'SALES_CONSULTANT'
                    ? '/dashboard/consultant'
                    : '/dashboard/buyer'
                }
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-red-600 font-semibold border-b border-gray-100 flex items-center justify-between"
              >
                <span>
                  {user.role === 'ADMIN'
                    ? t('navAdminDashboard')
                    : user.role === 'SALES_CONSULTANT'
                    ? t('navConsultantDashboard')
                    : t('navBuyerDashboard')}
                </span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                  {user.role}
                </span>
              </Link>
            )}
          </div>

          <div className="pt-2 flex flex-col space-y-2">
            <Link
              to="/book-test-drive"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-red-600 text-white py-2.5 rounded-md font-medium text-sm"
            >
              {t('navBookTestDrive')}
            </Link>

            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center border border-gray-300 text-gray-700 py-2 rounded-md text-sm font-medium"
              >
                {t('navLogout')}
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenQuickLogin) onOpenQuickLogin();
                }}
                className="w-full text-center border border-gray-300 text-gray-700 py-2 rounded-md text-sm font-medium"
              >
                {t('navLogin')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

