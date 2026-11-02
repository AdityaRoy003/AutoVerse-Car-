import React from 'react';
import { MapPin, Phone, Mail, Award, Users, Shield, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Hero */}
      <div className="bg-[#121212] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
            Authorised Dealership Profile
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            About Company A (Autoverse)
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Operating Lucknow's largest passenger car sales and certified service network across 3 showrooms, 2 multi-bay workshops, and 1 certified used-car stockyard with 340 dedicated personnel.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        {/* Key Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-3xl font-black text-red-600 block">3</span>
            <span className="text-xs font-semibold text-gray-700 mt-1 block">Flagship Showrooms</span>
            <span className="text-[10px] text-gray-400">Hazratganj, Gomti Nagar, Alambagh</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-3xl font-black text-red-600 block">2</span>
            <span className="text-xs font-semibold text-gray-700 mt-1 block">Mega Service Hubs</span>
            <span className="text-[10px] text-gray-400">Transport Nagar & Amausi</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-3xl font-black text-red-600 block">340+</span>
            <span className="text-xs font-semibold text-gray-700 mt-1 block">Automotive Staff</span>
            <span className="text-[10px] text-gray-400">Certified technicians & consultants</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-3xl font-black text-red-600 block">150-Pt</span>
            <span className="text-xs font-semibold text-gray-700 mt-1 block">Diagnostic Standard</span>
            <span className="text-[10px] text-gray-400">Certified Pre-Owned Certification</span>
          </div>
        </div>

        {/* Lucknow Showrooms Network */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Our Lucknow Facilities</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <span className="font-bold text-sm text-gray-900 block">1. Lucknow Central (Hazratganj)</span>
              <p className="text-gray-600">24/B, Mahatma Gandhi Marg, Hazratganj, Lucknow, UP 226001</p>
              <p className="text-red-600 font-semibold">+91 522 2618900</p>
              <span className="text-[10px] text-gray-400 block">Flagship sales lounge, executive demo vehicles, VIP delivery bay</span>
            </div>

            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <span className="font-bold text-sm text-gray-900 block">2. Gomti Nagar Showroom</span>
              <p className="text-gray-600">Plot 4, Vibhuti Khand, Behind Cyber Tower, Gomti Nagar, Lucknow, UP 226010</p>
              <p className="text-red-600 font-semibold">+91 522 4105200</p>
              <span className="text-[10px] text-gray-400 block">EV Fast Charging station, interactive customization studio</span>
            </div>

            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <span className="font-bold text-sm text-gray-900 block">3. Alambagh Showroom</span>
              <p className="text-gray-600">Metro Pillar 42, Kanpur - Lucknow Road, Alambagh, Lucknow, UP 226005</p>
              <p className="text-red-600 font-semibold">+91 522 2451300</p>
              <span className="text-[10px] text-gray-400 block">Direct connectivity to Kanpur highway corridor & test circuit</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            to="/book-test-drive"
            className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-8 py-3.5 rounded-xl shadow-lg transition"
          >
            <span>Book an Executive Test Drive in Lucknow</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

