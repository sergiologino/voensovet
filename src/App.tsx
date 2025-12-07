import React, { useEffect, useState } from 'react';
import { HomePage } from './pages/HomePage';
import { HelpPage } from './pages/HelpPage';
import { ContractServicePage } from './pages/ContractServicePage';
export function App() {
  // Simple routing simulation
  // In production, use React Router
  const [currentPage, setCurrentPage] = useState('home');
  // Listen to hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'contract-service') {
        setCurrentPage('contract-service');
      } else if (hash === 'help') {
        setCurrentPage('help');
      } else {
        setCurrentPage('home');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  if (currentPage === 'contract-service') {
    return <ContractServicePage />;
  }
  if (currentPage === 'help') {
    return <HelpPage />;
  }
  return <HomePage />;
}