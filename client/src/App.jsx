import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background-dark text-white flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer
          position="bottom-right"
          theme="dark"
          autoClose={3000}
        />
      </div>
    </Router>
  );
}

export default App;