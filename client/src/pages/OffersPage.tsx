import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { Sparkles, Tag, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

export const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOffers() {
      try {
        const res = await api.getOffers();
        if (res.success) setOffers(res.offers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOffers();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header */}
      <div className="bg-[#121212] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
            Special Dealership Promotions
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Festive & Corporate Dealership Offers
          </h1>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Authorized discounts, corporate exchange bonuses, and government electric vehicle incentives for Lucknow deliveries.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white h-48 rounded-2xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {offers.map((offer) => (
              <div
                key={offer._id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col md:flex-row"
              >
                <div className="md:w-1/3 relative h-48 md:h-auto bg-gray-900">
                  <img src={offer.bannerImageUrl} alt={offer.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded">
                    {offer.badgeText}
                  </div>
                </div>

                <div className="p-6 md:w-2/3 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{offer.title}</h3>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">{offer.description}</p>
                    
                    {offer.discountAmount > 0 && (
                      <div className="mt-3 inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-200">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Benefits up to {formatCurrency(offer.discountAmount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-100 gap-2">
                    <span className="text-[11px] text-gray-400">
                      Offer Valid Until: {new Date(offer.validTill).toLocaleDateString()}
                    </span>
                    <Link
                      to="/book-test-drive"
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg flex items-center space-x-1 transition"
                    >
                      <span>Claim via Test Drive</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

