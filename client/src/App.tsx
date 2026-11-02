import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { QuickLoginModal } from './components/common/QuickLoginModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ScrollToTop } from './components/common/ScrollToTop';

// Pages
import { HomePage } from './pages/HomePage';
import { NewCarsPage } from './pages/NewCarsPage';
import { CarDetailPage } from './pages/CarDetailPage';
import { UsedCarsPage } from './pages/UsedCarsPage';
import { UsedCarDetailPage } from './pages/UsedCarDetailPage';
import { BookTestDrivePage } from './pages/BookTestDrivePage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { ConsultantDashboardPage } from './pages/ConsultantDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { OffersPage } from './pages/OffersPage';
import { AboutPage } from './pages/AboutPage';
import { BookServicePage } from './pages/BookServicePage';

// Protected Route Helpers
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-12 text-center text-xs">Checking authorization...</div>;
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const ConsultantRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-12 text-center text-xs">Checking authorization...</div>;
  if (!user || (user.role !== 'SALES_CONSULTANT' && user.role !== 'ADMIN')) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const BuyerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-12 text-center text-xs">Checking authorization...</div>;
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function AppContent() {
  const [quickLoginOpen, setQuickLoginOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenQuickLogin={() => setQuickLoginOpen(true)} />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cars" element={<NewCarsPage />} />
          <Route path="/cars/:slug" element={<CarDetailPage />} />
          <Route path="/used-cars" element={<UsedCarsPage />} />
          <Route path="/used-cars/:stockId" element={<UsedCarDetailPage />} />
          <Route path="/book-test-drive" element={<BookTestDrivePage />} />
          <Route path="/book-service" element={<BookServicePage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Dashboards */}
          <Route
            path="/dashboard/buyer"
            element={
              <BuyerRoute>
                <BuyerDashboardPage />
              </BuyerRoute>
            }
          />
          <Route path="/buyer-dashboard" element={<Navigate to="/dashboard/buyer" replace />} />
          <Route
            path="/dashboard/consultant"
            element={
              <ConsultantRoute>
                <ConsultantDashboardPage />
              </ConsultantRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Quick Login Modal */}
      <QuickLoginModal
        isOpen={quickLoginOpen}
        onClose={() => setQuickLoginOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;

