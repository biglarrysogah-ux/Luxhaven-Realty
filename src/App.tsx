import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedPropertyForTour, setSelectedPropertyForTour] = useState<string>('');

  useEffect(() => {
    if (currentPage && currentPage !== 'dashboard') {
      // Small timeout to allow render lifecycle to finish if navigating back from dashboard
      const timer = setTimeout(() => {
        if (currentPage === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const element = document.getElementById(currentPage);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  const renderPage = () => {
    if (currentPage === 'dashboard') {
      return <Dashboard />;
    }
    return (
      <Home
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        selectedPropertyId={selectedPropertyForTour}
        setSelectedPropertyId={setSelectedPropertyForTour}
      />
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-glass-radial font-sans selection:bg-gold selection:text-navy-dark text-white">
      {/* Premium Sticky Navigation */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Feature Screens */}
      <main className="flex-grow">{renderPage()}</main>

      {/* Sophisticated Footer */}
      {currentPage !== 'dashboard' && <Footer setCurrentPage={setCurrentPage} />}
    </div>
  );
}

