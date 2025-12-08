import React, { useEffect, useState } from 'react';
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

export function App() {
  // Simple routing simulation
  // In production, use React Router
  const [currentPage, setCurrentPage] = useState('home');

  // Listen to hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const routes: Record<string, string> = {
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
  };

  return pages[currentPage] || <HomePage />;
}