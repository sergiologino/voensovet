import React, { useEffect, useState } from 'react';
import { EntryLandingPage } from './pages/EntryLandingPage';
import { HomePage } from './pages/HomePage';
import { HelpPage } from './pages/HelpPage';
import { ContractServicePage } from './pages/ContractServicePage';
import { VeteranPage } from './pages/VeteranPage';
import { FamilyPage } from './pages/FamilyPage';
import { BereavedPage } from './pages/BereavedPage';
import { BenefitsPage } from './pages/BenefitsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { ReturnToLifePage } from './pages/ReturnToLifePage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { RegionProvider } from './context/RegionContext';
import { AuthProvider } from './context/AuthContext';
import { PageTracker } from './components/PageTracker';

function getInitialPageFromHash() {
  const rawHash = window.location.hash || '';
  const hash = rawHash.replace(/^#/, '');

  // "Gateway" logic:
  // - If user lands on root (empty hash), show entry landing first time.
  // - If user navigates directly to a section via hash, don't block them.
  const isRoot = hash.trim() === '';
  if (isRoot) {
    const entrySeen = window.localStorage.getItem('vs_entry_seen') === '1';
    return entrySeen ? 'home' : 'welcome';
  }

  return hash;
}

function AppContent() {
  // Simple routing simulation
  // In production, use React Router
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const initialHash = getInitialPageFromHash();
    const routes: Record<string, string> = {
      'home': 'home',
      'welcome': 'welcome',
      'contract-service': 'contract-service',
      'help': 'help',
      'veteran': 'veteran',
      'family': 'family',
      'bereaved': 'bereaved',
      'benefits': 'benefits',
      'complaints': 'complaints',
      'organizations': 'organizations',
      'return': 'return',
      'psychological': 'help',
      'profile': 'profile',
      'admin': 'admin',
      'auth-callback': 'auth-callback',
    };

    return routes[initialHash] || 'home';
  });

  // Listen to hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = getInitialPageFromHash();
      const routes: Record<string, string> = {
        'home': 'home',
        'welcome': 'welcome',
        'contract-service': 'contract-service',
        'help': 'help',
        'veteran': 'veteran',
        'family': 'family',
        'bereaved': 'bereaved',
        'benefits': 'benefits',
        'complaints': 'complaints',
        'organizations': 'organizations',
        'return': 'return',
        'psychological': 'help',
        'profile': 'profile',
        'admin': 'admin',
        'auth-callback': 'auth-callback',
      };
      setCurrentPage(routes[hash] || 'home');
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const pages: Record<string, React.ReactNode> = {
    'welcome': <EntryLandingPage />,
    'home': <HomePage />,
    'help': <HelpPage />,
    'contract-service': <ContractServicePage />,
    'veteran': <VeteranPage />,
    'family': <FamilyPage />,
    'bereaved': <BereavedPage />,
    'benefits': <BenefitsPage />,
    'complaints': <ComplaintsPage />,
    'organizations': <OrganizationsPage />,
    'return': <ReturnToLifePage />,
    'profile': <ProfilePage />,
    'admin': <AdminPage />,
    'auth-callback': <AuthCallbackPage />,
  };

  return pages[currentPage] || <HomePage />;
}

export function App() {
  return (
    <AuthProvider>
      <RegionProvider>
        <PageTracker />
        <AppContent />
      </RegionProvider>
    </AuthProvider>
  );
}