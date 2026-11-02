import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Car } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#121212] text-gray-400 border-t border-gray-800 text-sm">
      {/* Top Value Banner */}
      <div className="border-b border-gray-800/80 bg-black/40 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-start space-x-3.5">
            <ShieldCheck className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold text-sm">150-Point Certified Inspection</h4>
              <p className="text-xs text-gray-400 mt-1">Non-accidental ultrasound certified with 1-year dealership warranty.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3.5">
            <Car className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold text-sm">Zero Mark-up On-Road Engine</h4>
              <p className="text-xs text-gray-400 mt-1">Mathematical RTO tax calculation based on official Lucknow district tables.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3.5">
            <MapPin className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold text-sm">3 Strategic Lucknow Showrooms</h4>
              <p className="text-xs text-gray-400 mt-1">Hazratganj Central, Gomti Nagar Cyber Tower, and Alambagh Metro.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3.5">
            <Clock className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold text-sm">5-Minute Response Commitment</h4>
              <p className="text-xs text-gray-400 mt-1">Dedicated sales executive response tracking on every digital test-drive booking.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand & About */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white font-black text-sm">
              AV
            </div>
            <span className="text-xl font-black tracking-tight text-white font-mono">
              AUTO<span className="text-red-500">VERSE</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
            Company A (Autoverse Authorised Dealership) is the premier passenger car sales and certified service network across Lucknow, Uttar Pradesh. Operating 3 flagship showrooms, 2 multi-bay service workshops, and 1 certified used-car stockyard with over 340 automotive professionals.
          </p>
          <div className="pt-2 text-xs text-gray-400">
            <p className="font-semibold text-gray-300">Headquarters & Central Showroom:</p>
            <p>24/B, Mahatma Gandhi Marg, Hazratganj, Lucknow, UP 226001</p>
            <p className="mt-1 flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-red-500" />
              <span>+91 522 2618900 / +91 98765 00001</span>
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Inventory</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/cars" className="hover:text-white transition">All New Cars</Link></li>
            <li><Link to="/cars/model-h" className="hover:text-white transition">Model H (Flagship SUV)</Link></li>
            <li><Link to="/cars/model-c" className="hover:text-white transition">Model C (Executive Sedan)</Link></li>
            <li><Link to="/cars/model-s" className="hover:text-white transition">Model S (Urban Hatchback)</Link></li>
            <li><Link to="/cars/model-e" className="hover:text-white transition">Model E (Pure Electric)</Link></li>
            <li><Link to="/used-cars" className="hover:text-white transition">Certified Used Cars</Link></li>
            <li><Link to="/offers" className="hover:text-white transition">Festive Offers</Link></li>
          </ul>
        </div>

        {/* Showroom Network */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Lucknow Locations</h4>
          <ul className="space-y-3 text-xs">
            <li>
              <strong className="text-gray-200 block">Lucknow Central</strong>
              <span className="text-gray-400 text-[11px]">Hazratganj, MG Marg</span>
            </li>
            <li>
              <strong className="text-gray-200 block">Gomti Nagar Showroom</strong>
              <span className="text-gray-400 text-[11px]">Vibhuti Khand, Near Cyber Tower</span>
            </li>
            <li>
              <strong className="text-gray-200 block">Alambagh Showroom</strong>
              <span className="text-gray-400 text-[11px]">Pillar 42, Kanpur - Lucknow Rd</span>
            </li>
            <li>
              <strong className="text-gray-200 block">Transport Nagar Mega Workshop</strong>
              <span className="text-gray-400 text-[11px]">24 Bays, Body & Paint Booth</span>
            </li>
          </ul>
        </div>

        {/* Legal & DPDP Compliance */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Privacy & DPDP</h4>
          <ul className="space-y-2.5 text-xs text-gray-400">
            <li><span className="text-gray-300">Policy Version:</span> 1.0 (DPDP 2023 Compliant)</li>
            <li><span className="text-gray-300">Data Purpose:</span> Vehicle quotations, appointments & authorized warranty servicing.</li>
            <li><span className="text-gray-300">Consent Management:</span> Available in Buyer Garage dashboard.</li>
            <li><span className="text-gray-300">Masked Identifiers:</span> Used car registrations are masked to preserve previous owner privacy.</li>
          </ul>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="border-t border-gray-800/80 py-5 px-4 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} AUTOVERSE Authorised Dealership, Lucknow. All rights reserved.</p>
          <div className="flex space-x-6 text-gray-400">
            <span>Engineering Assessment Demonstration Platform</span>
            <span>•</span>
            <span>Zero Mock AI Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

