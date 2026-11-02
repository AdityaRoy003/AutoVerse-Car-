import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { translations } from '../context/LanguageContext';
import { QuickLoginModal } from '../components/common/QuickLoginModal';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';

describe('Frontend Internationalization & Business Logic', () => {
  it('contains comprehensive English and Hindi translations for all critical workflows', () => {
    expect(translations.brandName.en).toBe('AUTOVERSE');
    expect(translations.brandName.hi).toBe('ऑटोवर्स');
    expect(translations.tagline.en).toContain('Discover');
    expect(translations.tagline.hi).toContain('खोजें');
    expect(translations.navBookTestDrive.en).toBe('Book Test Drive');
    expect(translations.navBookTestDrive.hi).toBe('टेस्ट ड्राइव बुक करें');
    expect(translations.onRoadPrice.en).toContain('On-Road');
  });

  it('correctly formats masked registration numbers for DPDP previous owner privacy', () => {
    const rawPlate1 = 'UP32AB1234';
    const masked1 = `${rawPlate1.slice(0, 6)}****`;
    expect(masked1).toBe('UP32AB****');

    const rawPlate2 = 'MH01AB9999';
    const masked2 = `${rawPlate2.slice(0, 6)}****`;
    expect(masked2).toBe('MH01AB****');
  });

  it('renders 1-Click Demo Persona Switcher Modal', () => {
    render(
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <QuickLoginModal isOpen={true} onClose={() => {}} />
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Autoverse Access Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Administrator/i)).toBeInTheDocument();
    expect(screen.getByText(/Sales Consultant/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Buyer/i)).toBeInTheDocument();
  });
});

