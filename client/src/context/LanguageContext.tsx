import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const translations: Translations = {
  // Brand
  brandName: { en: 'AUTOVERSE', hi: 'ऑटोवर्स' },
  tagline: { en: 'Discover Your Drive.', hi: 'अपनी पसंदीदा ड्राइव खोजें।' },
  
  // Navigation
  navHome: { en: 'Home', hi: 'होम' },
  navNewCars: { en: 'New Cars', hi: 'नई कारें' },
  navUsedCars: { en: 'Certified Used Cars', hi: 'प्रमाणित पुरानी कारें' },
  navOffers: { en: 'Offers', hi: 'ऑफ़र्स' },
  navAbout: { en: 'About Us', hi: 'हमारे बारे में' },
  navBookTestDrive: { en: 'Book Test Drive', hi: 'टेस्ट ड्राइव बुक करें' },
  navBookService: { en: 'Book Service', hi: 'सर्विस बुक करें' },
  navLogin: { en: 'Sign In', hi: 'लॉग इन' },
  navLogout: { en: 'Sign Out', hi: 'लॉग आउट' },
  navBuyerDashboard: { en: 'My Garage', hi: 'मेरा गैराज' },
  navConsultantDashboard: { en: 'CRM Portal', hi: 'कंसल्टेंट पोर्टल' },
  navAdminDashboard: { en: 'Admin Studio', hi: 'व्यवस्थापक स्टूडियो' },

  // Hero Section
  heroHeadline: { en: 'Find the Car That Moves You.', hi: 'वह कार चुनें जो आपको प्रेरित करे।' },
  heroSubtitle: { en: 'Authorised dealership in Lucknow featuring executive sedans, commanding SUVs, and certified pre-owned vehicles with authentic city-wise pricing.', hi: 'लखनऊ में अधिकृत डीलरशिप – प्रीमियम सेडान, दमदार एसयूवी और सटीक ऑन-रोड कीमत के साथ प्रमाणित कारें।' },
  btnExploreNew: { en: 'Explore New Vehicles', hi: 'नई कारें देखें' },
  btnExploreUsed: { en: 'Browse Certified Used', hi: 'प्रमाणित कारें देखें' },

  // Sections
  secFeaturedNew: { en: 'Featured Showroom Lineup', hi: 'प्रमुख शोरूम कारें' },
  secCertifiedUsed: { en: 'Autoverse Certified Pre-Owned', hi: 'प्रमाणित प्री-ओन्ड कारें' },
  secWhyChooseUs: { en: 'Why Drive with Autoverse', hi: 'ऑटोवर्स क्यों चुनें' },
  secWhyChooseUsSub: { en: 'Setting the benchmark for automotive transparency and premium ownership in Uttar Pradesh.', hi: 'उत्तर प्रदेश में ऑटोमोटिव पारदर्शिता और प्रीमियम सेवा का नया मानक।' },
  
  // USPs
  uspCertifiedTitle: { en: '150-Point Certified Evaluation', hi: '150-बिंदु तकनीकी प्रमाणन' },
  uspCertifiedDesc: { en: 'Every pre-owned vehicle undergoes rigorous mechanical, ultrasonic paint depth, and diagnostic screening.', hi: 'प्रत्येक वाहन का 150-पॉइंट गहन निरीक्षण, ओरिजिनल पेंट चेक और इंजन टेस्ट किया जाता है।' },
  uspPricingTitle: { en: 'Zero Hidden Costs On-Road Engine', hi: 'पारदर्शी ऑन-रोड मूल्य' },
  uspPricingDesc: { en: 'Exact RTO road tax, registration, and comprehensive insurance broken down with zero artificial markups.', hi: 'सटीक आरटीओ रोड टैक्स, बीमा और पंजीकरण शुल्क का स्पष्ट विवरण बिना किसी छिपे खर्च के।' },
  uspTestDriveTitle: { en: 'Bespoke Executive Test Drives', hi: 'आसान टेस्ट ड्राइव बुकिंग' },
  uspTestDriveDesc: { en: 'Choose your preferred vehicle, time slot, and Lucknow showroom for a tailored driving experience.', hi: 'अपनी पसंद का मॉडल, समय स्लॉट और लखनऊ का शोरूम चुनकर सुविधाजनक टेस्ट ड्राइव लें।' },
  uspServiceTitle: { en: 'Mega Service Network', hi: 'विशाल सर्विस नेटवर्क' },
  uspServiceDesc: { en: '2 dedicated state-of-the-art mega workshops in Lucknow with 40 service bays and certified technicians.', hi: 'लखनऊ में 2 अत्याधुनिक विशाल वर्कशॉप और अनुभवी तकनीशियन।' },

  // Actions & Buttons
  btnViewDetails: { en: 'View Specifications', hi: 'विवरण देखें' },
  btnCalculatePrice: { en: 'Calculate On-Road Price', hi: 'ऑन-रोड कीमत जानें' },
  btnCalculateEMI: { en: 'EMI Calculator', hi: 'ईएमआई कैलकुलेटर' },
  btnEnquireNow: { en: 'Submit Enquiry', hi: 'पूछताछ करें' },
  btnRequestTradeIn: { en: 'Request Trade-In Valuation', hi: 'एक्सचेंज मूल्यांकन' },
  btnFilterReset: { en: 'Reset Filters', hi: 'फ़िल्टर रीसेट करें' },
  btnApply: { en: 'Apply', hi: 'लागू करें' },

  // Form Fields & Labels
  lblFullName: { en: 'Full Name', hi: 'पूरा नाम' },
  lblMobile: { en: 'Mobile Number', hi: 'मोबाइल नंबर' },
  lblEmail: { en: 'Email Address', hi: 'ईमेल पता' },
  lblCity: { en: 'Registration City', hi: 'पंजीकरण शहर' },
  lblShowroom: { en: 'Preferred Showroom', hi: 'पसंदीदा शोरूम' },
  lblFuelType: { en: 'Fuel Type', hi: 'ईंधन का प्रकार' },
  lblTransmission: { en: 'Transmission', hi: 'ट्रांसमिशन' },
  lblBudget: { en: 'Estimated Budget', hi: 'अनुमानित बजट' },
  lblMessage: { en: 'Enquiry Details / Requirements', hi: 'अपनी आवश्यकता या प्रश्न लिखें' },
  lblConsent: { en: 'I explicitly consent to Autoverse storing and processing my contact details to assist with vehicle quotations and scheduled appointments under the Digital Personal Data Protection (DPDP) Act.', hi: 'मैं डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम के तहत वाहन कोटेशन और अपॉइंटमेंट के लिए अपने संपर्क विवरण संग्रहीत करने की सहमति देता/देती हूँ।' },
  lblMarketingConsent: { en: 'Send me updates regarding festive offers, price revisions, and new car launches via WhatsApp / SMS.', hi: 'मुझे व्हाट्सएप/एसएमएस पर नए ऑफ़र, कीमतों और कार लॉन्च की जानकारी भेजें।' },

  // Pricing Terms
  exShowroom: { en: 'Ex-Showroom Price', hi: 'एक्स-शोरूम कीमत' },
  onRoadPrice: { en: 'Official On-Road Price', hi: 'सटीक ऑन-रोड कीमत' },
  roadTax: { en: 'RTO Road Tax', hi: 'आरटीओ रोड टैक्स' },
  insurance: { en: 'Comprehensive 1+3 Yr Insurance', hi: 'व्यापक मोटर बीमा' },
  registrationCharges: { en: 'RTO Registration & Fastag', hi: 'आरटीओ पंजीकरण शुल्क' },
  accessories: { en: 'Essential Accessory Kit', hi: 'आवश्यक एक्सेसरीज किट' },
  otherCharges: { en: 'Logistics & Green Cess', hi: 'अन्य वैधानिक शुल्क' },
  disclaimerText: { en: 'Prices are indicative and subject to change. Please confirm the final quotation with the dealership.', hi: 'मूल्य सांकेतिक हैं और परिवर्तन के अधीन हैं। कृपया डीलरशिप के साथ अंतिम कोटेशन की पुष्टि करें।' },

  // Booking Steps
  stepModel: { en: 'Select Model & Variant', hi: 'मॉडल व वेरिएंट चुनें' },
  stepShowroom: { en: 'Choose Showroom', hi: 'शोरूम का चयन करें' },
  stepDemoCar: { en: 'Select Demo Vehicle', hi: 'डेमो वाहन चुनें' },
  stepDateTime: { en: 'Date & Time Slot', hi: 'दिनांक व समय स्लॉट' },
  stepDetails: { en: 'Buyer Information', hi: 'ग्राहक विवरण' },
  stepConfirm: { en: 'Booking Confirmation', hi: 'पुष्टि' },

  // Status
  statusAvailable: { en: 'Available', hi: 'उपलब्ध' },
  statusBooked: { en: 'Reserved', hi: 'आरक्षित' },
  statusSold: { en: 'Sold', hi: 'बिक चुका' },
  statusConfirmed: { en: 'Confirmed', hi: 'पुष्ट' },
  statusPending: { en: 'Pending Review', hi: 'लंबित' },
  statusCancelled: { en: 'Cancelled', hi: 'रद्द' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('autoverse_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('autoverse_lang', lang);
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

